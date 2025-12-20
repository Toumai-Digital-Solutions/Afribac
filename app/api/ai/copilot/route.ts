import type { NextRequest } from 'next/server';

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

type Provider = 'openai' | 'gemini';

const DEFAULT_GEMINI_MODEL = 'gemini-2.0-flash';
const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini';

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
  console.log('[AI Copilot] Request received');
  const {
    model,
    prompt,
    provider = 'gemini', // Default to Gemini
    system,
  } = await req.json();

  console.log('[AI Copilot] Provider:', provider, 'Model:', model);
  console.log('[AI Copilot] Prompt length:', prompt?.length ?? 0);

  // Check for at least one API key
  const hasGeminiKey = !!process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const hasOpenAIKey = !!process.env.OPENAI_API_KEY;

  console.log(
    '[AI Copilot] API Keys - Gemini:',
    hasGeminiKey,
    'OpenAI:',
    hasOpenAIKey
  );

  if (!hasGeminiKey && !hasOpenAIKey) {
    return NextResponse.json(
      {
        error:
          'Clé API IA manquante. Définissez GOOGLE_GENERATIVE_AI_API_KEY ou OPENAI_API_KEY.',
      },
      { status: 401 }
    );
  }

  const { provider: effectiveProvider, model: effectiveModel } =
    normalizeProviderAndModel({
      model,
      provider,
      hasGeminiKey,
      hasOpenAIKey,
    });

  const resolvedModel =
    effectiveModel ||
    (effectiveProvider === 'gemini'
      ? DEFAULT_GEMINI_MODEL
      : DEFAULT_OPENAI_MODEL);

  console.log(
    '[AI Copilot] Effective provider:',
    effectiveProvider,
    'Model:',
    effectiveModel,
    'Resolved model:',
    resolvedModel
  );

  // Create the appropriate model
  const aiModel =
    effectiveProvider === 'gemini'
      ? createGoogleGenerativeAI({
          apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
        })(resolvedModel)
      : createOpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        })(resolvedModel);

  try {
    const result = await generateText({
      abortSignal: req.signal,
      maxOutputTokens: 50,
      model: aiModel,
      prompt,
      system,
      temperature: 0.7,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(null, { status: 408 });
    }

    return NextResponse.json(
      { error: 'Échec du traitement de la requête IA' },
      { status: 500 }
    );
  }
}
