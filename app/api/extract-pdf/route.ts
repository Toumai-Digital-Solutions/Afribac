import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export const maxDuration = 120; // Allow up to 60 seconds for processing

export async function POST(req: Request) {
  try {
    const { images } = await req.json();

    if (!images || !Array.isArray(images) || images.length === 0) {
      return new Response('No images provided', { status: 400 });
    }

    const result = streamText({
      model: google("gemini-3-pro-preview"),
      messages: [
        {
          role: 'system',
          content: 'You are an expert document digitizer. Transcribe the following document page into clean HTML. Use standard tags like <h1>, <p>, <ul>, <table>. Use LaTeX for math formulas (wrapped in $ or $$). Do not add any conversational text, just the HTML content. Also i want a good formatting of the text, so use proper indentation and line breaks. ',
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
    return new Response('Internal Server Error', { status: 500 });
  }
}
