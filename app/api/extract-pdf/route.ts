import { google } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { getAIConfigWithFallback } from '@/lib/ai/config';
import { logAIUsage } from '@/lib/ai/logging';

export const maxDuration = 120; // Autorise jusqu'à 120 secondes de traitement
export const runtime = 'nodejs';

const toBase64 = (arrayBuffer: ArrayBuffer) =>
  Buffer.from(arrayBuffer).toString('base64');

export async function POST(req: Request) {
  const startTime = Date.now();

  try {
    // Fetch AI configuration from database
    const config = await getAIConfigWithFallback('extraction');
    console.log('[Extract PDF] Using config:', config);

    const { images, imageUrls } = await req.json();

    const base64Images: string[] = [];

    if (Array.isArray(images)) {
      base64Images.push(...images.filter((img) => typeof img === 'string' && img.length > 0));
    }

    if (Array.isArray(imageUrls)) {
      for (const url of imageUrls) {
        if (typeof url !== 'string' || url.length === 0) continue;
        const res = await fetch(url);
        if (!res.ok) {
          return new Response(`Impossible de télécharger l’image : ${url}`, {
            status: 400,
          });
        }
        const ab = await res.arrayBuffer();
        base64Images.push(toBase64(ab));
      }
    }

    if (base64Images.length === 0) {
      return new Response('Aucune image fournie', { status: 400 });
    }

    console.log('[Extract PDF] Images:', base64Images.length);

    // Create the appropriate model based on config
    const aiModel =
      config.provider === 'gemini'
        ? google(config.modelName)
        : createOpenAI({
            apiKey: process.env.OPENAI_API_KEY,
          })(config.modelName);

    // Log request start
    await logAIUsage({
      serviceType: 'extraction',
      provider: config.provider,
      modelName: config.modelName,
      status: 'success',
      processingTimeMs: Date.now() - startTime,
      metadata: { imageCount: base64Images.length }
    });

    const result = streamText({
      model: aiModel,
      temperature: config.temperature,
      messages: [
        {
          role: 'system',
          content:
            [
              "Tu es un expert de la numérisation de documents (OCR + structuration).",
              '',
              "Objectif : produire un HTML COMPLET (sans CSS) qui représente fidèlement la page, dans l'ordre de lecture.",
              '',
              'Règles de sortie :',
              '- Retourne uniquement du HTML (pas de Markdown, pas de texte conversationnel).',
              '- Utilise des balises standard : <h1>…<h6>, <p>, <ul>/<ol>/<li>, <table> (si tableau), <blockquote>.',
              '- Pour les formules, utilise du LaTeX entre $…$ (inline) ou $$…$$ (bloc).',
              '- Indentation et retours à la ligne propres.',
              "- Ignore les numéros de page (ex: 'Page 1', '1/12', etc.).",
              '',
              'IMPORTANT : ne saute aucun contenu non textuel.',
              'Si la page contient un schéma / figure / graphique / carte / image annotée :',
              '- Ajoute un bloc dédié au bon endroit dans le flux, sous forme de :',
              "  <h4>Figure — {titre s'il existe}</h4>",
              '  <p>…description claire…</p>',
              '  <ul><li>…éléments/labels…</li></ul>',
              '- Décris ce qui est représenté (relations, flèches, étapes, légende).',
              '- Recopie les labels/valeurs visibles (axes, unités, noms, annotations).',
              "- Si un élément est partiellement illisible, indique-le explicitement mais conserve un bloc descriptif (ne l'ignore pas).",
              '',
              'Si tu détectes plusieurs figures, crée un bloc par figure.',
            ].join('\n'),
        },
        {
          role: 'user',
          content: base64Images.map((image) => ({
            type: 'image',
            image: image, // base64 string
          })),
        },
      ],
    });

    return result.toTextStreamResponse();
  } catch (error) {
    const processingTime = Date.now() - startTime;

    console.error('Error in extract-pdf:', error);

    // Log error (best effort - use fallback config if config fetch failed)
    try {
      const config = await getAIConfigWithFallback('extraction');
      await logAIUsage({
        serviceType: 'extraction',
        provider: config.provider,
        modelName: config.modelName,
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        processingTimeMs: processingTime
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return new Response('Erreur interne du serveur', { status: 500 });
  }
}
