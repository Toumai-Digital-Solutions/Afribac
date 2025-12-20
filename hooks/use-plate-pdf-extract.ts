'use client';

import { useState, useCallback } from 'react';
import type { Value } from 'platejs';
import type { PlateEditor } from 'platejs/react';
import { htmlToPlateValue, textToPlateValue } from '@/lib/plate-html-deserializer';

interface UsePlatePdfExtractProps {
  editor: PlateEditor;
  onExtracted?: (value: Value) => void;
}

export function usePlatePdfExtract({ editor, onExtracted }: UsePlatePdfExtractProps) {
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const extractTextFromPdfPage = useCallback(async (page: any): Promise<string> => {
    const textContent = await page.getTextContent();
    const items = (textContent.items || []) as Array<{ str: string; transform?: number[] }>;
    const lines: Array<{ y: number; parts: string[] }> = [];
    const tolerance = 2.5;

    for (const item of items) {
      const str = (item.str || '').trim();
      if (!str) continue;
      const y = item.transform?.[5] ?? 0;
      const existing = lines.find((l) => Math.abs(l.y - y) <= tolerance);
      if (existing) existing.parts.push(str);
      else lines.push({ y, parts: [str] });
    }

    lines.sort((a, b) => b.y - a.y);
    return lines.map((l) => l.parts.join(' ')).join('\n').trim();
  }, []);

  const extractPdf = useCallback(
    async (file: File) => {
      setIsExtracting(true);
      setProgress({ current: 0, total: 0 });

      try {
        const pdfJS = await import('pdfjs-dist/legacy/build/pdf.mjs');
        pdfJS.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
          import.meta.url
        ).toString();

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfJS.getDocument({ data: arrayBuffer }).promise;

        setProgress({ current: 0, total: pdf.numPages });

        const allNodes: Value = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          setProgress({ current: i, total: pdf.numPages });

          const page = await pdf.getPage(i);
          const extractedText = await extractTextFromPdfPage(page);
          const hasText = extractedText.length >= 40;

          let pageValue: Value = [];

          if (hasText) {
            // Text-based PDF - convert text to Plate value
            pageValue = textToPlateValue(extractedText);
          } else {
            // Scanned PDF - use AI OCR extraction
            const viewport = page.getViewport({ scale: 2 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context) continue;

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport, canvas } as any).promise;
            const base64Image = canvas.toDataURL('image/png').split(',')[1];

            const response = await fetch('/api/extract-pdf', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ images: [base64Image] }),
            });

            if (!response.ok) throw new Error('Extraction failed');

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let htmlContent = '';

            if (reader) {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                htmlContent += decoder.decode(value, { stream: true });
              }
            }

            // Convert HTML to Plate Value
            if (htmlContent.trim()) {
              pageValue = htmlToPlateValue(htmlContent.trim());
            }
          }

          if (pageValue.length > 0) {
            // Add page header
            allNodes.push({
              type: 'h3',
              children: [{ text: `Page ${i}` }],
            });

            // Add page content
            allNodes.push(...pageValue);

            // Add horizontal rule between pages
            if (i < pdf.numPages) {
              allNodes.push({
                type: 'hr',
                children: [{ text: '' }],
              });
            }
          }
        }

        // Insert all extracted content into the editor
        if (allNodes.length > 0) {
          // Move to end of document
          const endPoint = editor.api.end([]);
          if (endPoint) {
            editor.tf.select(endPoint);
          }

          // Insert the nodes
          editor.tf.insertNodes(allNodes);

          // Notify parent
          onExtracted?.(editor.children as Value);
        }
      } catch (error) {
        console.error('PDF extraction error:', error);
        throw error;
      } finally {
        setIsExtracting(false);
        setProgress({ current: 0, total: 0 });
      }
    },
    [editor, extractTextFromPdfPage, onExtracted]
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        await extractPdf(file);
      } catch (error) {
        alert("Erreur lors de l'extraction du PDF");
      } finally {
        e.target.value = '';
      }
    },
    [extractPdf]
  );

  return {
    isExtracting,
    progress,
    extractPdf,
    handleFileChange,
  };
}
