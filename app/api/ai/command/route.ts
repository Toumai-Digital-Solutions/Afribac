import type {
  ChatMessage,
  ToolName,
} from '@/components/editor/use-chat';
import type { NextRequest } from 'next/server';

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import {
  type LanguageModel,
  type UIMessageStreamWriter,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateObject,
  streamObject,
  streamText,
  tool,
} from 'ai';
import { NextResponse } from 'next/server';
import { type SlateEditor, createSlateEditor, nanoid } from 'platejs';
import { z } from 'zod';

import { BaseEditorKit } from '@/components/editor/editor-base-kit';
import { markdownJoinerTransform } from '@/lib/markdown-joiner-transform';

import {
  getChooseToolPrompt,
  getCommentPrompt,
  getEditPrompt,
  getGeneratePrompt,
} from './prompts';

// Helper to get the appropriate model based on provider preference
type Provider = 'openai' | 'gemini';

const DEFAULT_GEMINI_MODEL = 'gemini-2.0-flash';
const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini';

const isToolName = (value: unknown): value is ToolName =>
  value === 'comment' || value === 'edit' || value === 'generate';

function getModel(modelName?: string, provider?: Provider): LanguageModel {
  const selectedProvider = provider || 'gemini'; // Default to Gemini since user already has it

  if (selectedProvider === 'gemini') {
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });
    return google(modelName || DEFAULT_GEMINI_MODEL);
  } else {
    const openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    return openai(modelName || DEFAULT_OPENAI_MODEL);
  }
}

const normalizeProviderAndModel = ({
  model,
  provider,
  hasGeminiKey,
  hasOpenAIKey,
}: {
  model?: string;
  provider?: string;
  hasGeminiKey: boolean;
  hasOpenAIKey: boolean;
}): { provider: Provider; model?: string } => {
  let normalizedProvider: Provider | undefined;
  let normalizedModel: string | undefined = model;

  if (model?.includes('/')) {
    const [prefix, ...rest] = model.split('/');
    const name = rest.join('/');

    if (prefix === 'openai') {
      normalizedProvider = 'openai';
      normalizedModel = name;
    } else if (prefix === 'google' || prefix === 'gemini') {
      normalizedProvider = 'gemini';
      normalizedModel = name;
    } else {
      normalizedModel = undefined;
    }
  }

  if (!normalizedProvider && (provider === 'openai' || provider === 'gemini')) {
    normalizedProvider = provider;
  }

  if (!normalizedProvider) {
    normalizedProvider = hasGeminiKey ? 'gemini' : 'openai';
  }

  if (normalizedProvider === 'openai' && !hasOpenAIKey && hasGeminiKey) {
    normalizedProvider = 'gemini';
    normalizedModel = undefined;
  } else if (normalizedProvider === 'gemini' && !hasGeminiKey && hasOpenAIKey) {
    normalizedProvider = 'openai';
    normalizedModel = undefined;
  }

  return { provider: normalizedProvider, model: normalizedModel };
};

export async function POST(req: NextRequest) {
  console.log('[AI Command] Request received');

  const {
    ctx,
    messages: messagesRaw = [],
    model: requestedModel,
    provider = 'gemini', // Default to Gemini
  } = await req.json();

  console.log('[AI Command] Provider:', provider, 'Model:', requestedModel);
  console.log('[AI Command] Messages count:', messagesRaw.length);

  const { children, selection, toolName: toolNameParam } = ctx;

  const editor = createSlateEditor({
    plugins: BaseEditorKit,
    selection,
    value: children,
  });

  // Check for at least one API key
  const hasGeminiKey = !!process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const hasOpenAIKey = !!process.env.OPENAI_API_KEY;

  console.log('[AI Command] API Keys - Gemini:', hasGeminiKey, 'OpenAI:', hasOpenAIKey);

  if (!hasGeminiKey && !hasOpenAIKey) {
    console.error('[AI Command] No API keys found!');
    return NextResponse.json(
      { error: 'Missing AI API key. Set GOOGLE_GENERATIVE_AI_API_KEY or OPENAI_API_KEY.' },
      { status: 401 }
    );
  }

  const { provider: effectiveProvider, model: effectiveModel } =
    normalizeProviderAndModel({
      model: requestedModel,
      provider,
      hasGeminiKey,
      hasOpenAIKey,
    });

  const resolvedModel =
    effectiveModel ||
    (effectiveProvider === 'gemini'
      ? DEFAULT_GEMINI_MODEL
      : DEFAULT_OPENAI_MODEL);

  const isSelecting = editor.api.isExpanded();

  try {
    console.log(
      '[AI Command] Effective provider:',
      effectiveProvider,
      'Model:',
      effectiveModel,
      'Resolved model:',
      resolvedModel
    );
    console.log('[AI Command] Creating stream, toolName:', toolNameParam, 'isSelecting:', isSelecting);

    const stream = createUIMessageStream<ChatMessage>({
      execute: async ({ writer }) => {
        let toolName = isToolName(toolNameParam) ? toolNameParam : undefined;

        if (toolNameParam && !toolName) {
          console.warn('[AI Command] Invalid toolName provided:', toolNameParam);
        }

        if (toolName) {
          console.log('[AI Command] Using toolName:', toolName);
          writer.write({
            data: toolName,
            type: 'data-toolName',
          });
        }

        if (!toolName) {
          console.log('[AI Command] No toolName provided, generating one...');
          const { object: AIToolName } = await generateObject({
            enum: isSelecting
              ? ['generate', 'edit', 'comment']
              : ['generate', 'comment'],
            model: getModel(resolvedModel, effectiveProvider),
            output: 'enum',
            prompt: getChooseToolPrompt(messagesRaw),
          });
          console.log('[AI Command] Generated toolName:', AIToolName);

          writer.write({
            data: AIToolName as ToolName,
            type: 'data-toolName',
          });

          toolName = isToolName(AIToolName) ? AIToolName : undefined;
        }

        const stream = streamText({
          experimental_transform: markdownJoinerTransform(),
          model: getModel(resolvedModel, effectiveProvider),
          // Not used
          prompt: '',
          tools: {
            comment: getCommentTool(editor, {
              messagesRaw,
              model: getModel(resolvedModel, effectiveProvider),
              writer,
            }),
          },
          prepareStep: async (step) => {
            if (toolName === 'comment') {
              return {
                ...step,
                toolChoice: { toolName: 'comment', type: 'tool' },
              };
            }

            if (toolName === 'edit') {
              const editPrompt = getEditPrompt(editor, {
                isSelecting,
                messages: messagesRaw,
              });

              return {
                ...step,
                activeTools: [],
                messages: [
                  {
                    content: editPrompt,
                    role: 'user',
                  },
                ],
              };
            }

            if (toolName === 'generate') {
              const generatePrompt = getGeneratePrompt(editor, {
                messages: messagesRaw,
              });

              return {
                ...step,
                activeTools: [],
                messages: [
                  {
                    content: generatePrompt,
                    role: 'user',
                  },
                ],
                model: getModel(resolvedModel, effectiveProvider),
              };
            }
          },
        });

        writer.merge(stream.toUIMessageStream({ sendFinish: false }));
      },
    });

    console.log('[AI Command] Stream created successfully');
    return createUIMessageStreamResponse({ stream });
  } catch (error) {
    console.error('[AI Command] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process AI request', details: String(error) },
      { status: 500 }
    );
  }
}

const getCommentTool = (
  editor: SlateEditor,
  {
    messagesRaw,
    model,
    writer,
  }: {
    messagesRaw: ChatMessage[];
    model: LanguageModel;
    writer: UIMessageStreamWriter<ChatMessage>;
  }
) =>
  tool({
    description: 'Comment on the content',
    inputSchema: z.object({}),
    execute: async () => {
      const { elementStream } = streamObject({
        model,
        output: 'array',
        prompt: getCommentPrompt(editor, {
          messages: messagesRaw,
        }),
        schema: z
          .object({
            blockId: z
              .string()
              .describe(
                'The id of the starting block. If the comment spans multiple blocks, use the id of the first block.'
              ),
            comment: z
              .string()
              .describe('A brief comment or explanation for this fragment.'),
            content: z
              .string()
              .describe(
                String.raw`The original document fragment to be commented on.It can be the entire block, a small part within a block, or span multiple blocks. If spanning multiple blocks, separate them with two \n\n.`
              ),
          })
          .describe('A single comment'),
      });

      for await (const comment of elementStream) {
        const commentDataId = nanoid();

        writer.write({
          id: commentDataId,
          data: {
            comment,
            status: 'streaming',
          },
          type: 'data-comment',
        });
      }

      writer.write({
        id: nanoid(),
        data: {
          comment: null,
          status: 'finished',
        },
        type: 'data-comment',
      });
    },
  });
