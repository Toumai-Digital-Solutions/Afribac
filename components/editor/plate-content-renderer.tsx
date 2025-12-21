'use client';

import type { Value } from 'platejs';
import { usePlateViewEditor } from 'platejs/react';

import { BaseEditorKit } from '@/components/editor/editor-base-kit';
import { EditorView } from '@/components/ui/editor';

interface PlateContentRendererProps {
  value: Value;
  className?: string;
  variant?: React.ComponentProps<typeof EditorView>['variant'];
}

export function PlateContentRenderer({ value, className, variant }: PlateContentRendererProps) {
  const editor = usePlateViewEditor({
    plugins: BaseEditorKit,
    value,
  });

  return (
    <EditorView
      editor={editor}
      className={className}
      variant={variant}
    />
  );
}
