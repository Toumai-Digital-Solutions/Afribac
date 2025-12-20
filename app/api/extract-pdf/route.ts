import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export const maxDuration = 120; // Autorise jusqu’à 120 secondes de traitement

export async function POST(req: Request) {
  try {
    const { images } = await req.json();

    if (!images || !Array.isArray(images) || images.length === 0) {
      return new Response('Aucune image fournie', { status: 400 });
    }

    const result = streamText({
      model: google("gemini-3-pro-preview"),
      messages: [
        {
          role: 'system',
          content:
            "Tu es un expert de la numérisation de documents. Transcris cette page en HTML propre, sans CSS. Utilise des balises standard (<h1>, <p>, <ul>, <table>). Utilise du LaTeX pour les formules (entre $ ou $$). N’ajoute aucun texte conversationnel : uniquement le contenu HTML. Le rendu doit être bien mis en forme (indentation et retours à la ligne). Ignore les numéros de page.",
        },
        {
          role: 'user',
          content: images.map((image) => ({
            type: 'image',
            image: image, // base64 string
          })),
        },
      ],
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Error in extract-pdf:', error);
    return new Response('Erreur interne du serveur', { status: 500 });
  }
}
