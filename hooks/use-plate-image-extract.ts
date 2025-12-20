'use client';

import * as React from 'react';

import type { Value } from 'platejs';
import { KEYS, PathApi } from 'platejs';
import type { PlateEditor } from 'platejs/react';
import { htmlToPlateValue } from '@/lib/plate-html-deserializer';

interface UsePlateImageExtractProps {
  editor: PlateEditor;
  onExtracted?: (value: Value) => void;
}

export function usePlateImageExtract({
  editor,
  onExtracted,
}: UsePlateImageExtractProps) {
  const [isExtracting, setIsExtracting] = React.useState(false);

  const extractImageFile = React.useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner un fichier image.');
        return;
      }
      setIsExtracting(true);

      try {
        console.log(`[Image Extract] Fichier: ${file.name}`);

        const base64Image = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = String(reader.result || '');
            const [, base64] = dataUrl.split(',');
            if (!base64) reject(new Error('Impossible de lire l’image'));
            else resolve(base64);
          };
          reader.onerror = () => reject(new Error('Impossible de lire l’image'));
          reader.readAsDataURL(file);
        });

        const response = await fetch('/api/extract-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ images: [base64Image] }),
        });

        if (!response.ok) throw new Error('Échec de l’extraction IA');

        const streamReader = response.body?.getReader();
        const decoder = new TextDecoder();
        let htmlContent = '';

        if (streamReader) {
          while (true) {
            const { done, value } = await streamReader.read();
            if (done) break;
            htmlContent += decoder.decode(value, { stream: true });
          }
        }

        const extracted = htmlContent.trim();
        if (!extracted) throw new Error('Réponse IA vide');

        const extractedNodes = htmlToPlateValue(extracted);

        const currentBlock = editor.api.block({ highest: true });
        const insertAt = currentBlock ? PathApi.next(currentBlock[1]) : undefined;

        editor.tf.insertNodes(
          [
            {
              type: 'h3',
              children: [{ text: 'Contenu extrait (image)' }],
            },
            ...extractedNodes,
          ] as any,
          insertAt ? { at: insertAt } : undefined
        );

        onExtracted?.(editor.children as Value);
      } finally {
        setIsExtracting(false);
      }
    },
    [editor, onExtracted]
  );

  return {
    isExtracting,
    extractImageFile,
  };
}
