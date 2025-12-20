'use client';

import * as React from 'react';

import { ImageIcon, Loader2 } from 'lucide-react';
import type { Value } from 'platejs';
import { useEditorRef } from 'platejs/react';

import { usePlateImageExtract } from '@/hooks/use-plate-image-extract';

import { ToolbarButton } from './toolbar';

interface ImageExtractToolbarButtonProps {
  onExtracted?: (value: Value) => void;
}

export function ImageExtractToolbarButton({
  onExtracted,
}: ImageExtractToolbarButtonProps) {
  const editor = useEditorRef();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { isExtracting, extractImageFile } = usePlateImageExtract({
    editor,
    onExtracted,
  });

  return (
    <>
      <ToolbarButton
        onClick={() => fileInputRef.current?.click()}
        disabled={isExtracting}
        tooltip={
          isExtracting ? 'Extraction IA en cours…' : 'Extraire depuis une image'
        }
      >
        {isExtracting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ImageIcon className="size-4" />
        )}
      </ToolbarButton>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;

          try {
            await extractImageFile(file);
          } catch (error) {
            console.error('Erreur extraction image :', error);
            alert("Erreur lors de l'extraction de l'image");
          } finally {
            e.target.value = '';
          }
        }}
      />
    </>
  );
}
