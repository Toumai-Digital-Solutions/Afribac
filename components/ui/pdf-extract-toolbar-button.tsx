'use client';

import * as React from 'react';
import { FileText, Loader2 } from 'lucide-react';
import type { Value } from 'platejs';
import { useEditorRef } from 'platejs/react';

import { usePlatePdfExtract } from '@/hooks/use-plate-pdf-extract';
import { ToolbarButton } from './toolbar';

interface PdfExtractToolbarButtonProps {
  onExtracted?: (value: Value) => void;
}

export function PdfExtractToolbarButton({ onExtracted }: PdfExtractToolbarButtonProps) {
  const editor = useEditorRef();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { isExtracting, progress, handleFileChange } = usePlatePdfExtract({
    editor,
    onExtracted,
  });

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <ToolbarButton
        onClick={handleClick}
        disabled={isExtracting}
        tooltip={
          isExtracting
            ? `Extraction en cours... (${progress.current}/${progress.total})`
            : 'Extraire du PDF'
        }
      >
        {isExtracting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <FileText className="size-4" />
        )}
      </ToolbarButton>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  );
}
