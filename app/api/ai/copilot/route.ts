import type { NextRequest } from 'next/server';

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

type Provider = 'openai' | 'gemini';

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
  const {
    model,
    prompt,
    provider = 'gemini', // Default to Gemini
    system,
  } = await req.json();

  // Check for at least one API key
  const hasGeminiKey = !!process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const hasOpenAIKey = !!process.env.OPENAI_API_KEY;

  if (!hasGeminiKey && !hasOpenAIKey) {
    return NextResponse.json(
      { error: 'Missing AI API key. Set GOOGLE_GENERATIVE_AI_API_KEY or OPENAI_API_KEY.' },
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

  // Create the appropriate model
  const aiModel = effectiveProvider === 'gemini'
    ? createGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      })(effectiveModel || 'gemini-2.0-flash')
    : createOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      })(effectiveModel || 'gpt-4o-mini');

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
      { error: 'Failed to process AI request' },
      { status: 500 }
    );
  }
}
