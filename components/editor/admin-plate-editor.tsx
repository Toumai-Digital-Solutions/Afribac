'use client';

import * as React from 'react';

import { Eye, Maximize2, Minimize2, Pencil } from 'lucide-react';
import type { Value } from 'platejs';
import { Plate, usePlateEditor } from 'platejs/react';

import { AdminEditorKit } from '@/components/editor/editor-kit';
import { SettingsDialog } from '@/components/editor/settings-dialog';
import { AILoadingBar, AIMenu } from '@/components/ui/ai-menu';
import { Button } from '@/components/ui/button';
import { Editor, EditorContainer } from '@/components/ui/editor';
import { FixedToolbar } from '@/components/ui/fixed-toolbar';
import { FixedToolbarButtons } from '@/components/ui/fixed-toolbar-buttons';
import { FloatingToolbar } from '@/components/ui/floating-toolbar';
import { FloatingToolbarButtons } from '@/components/ui/floating-toolbar-buttons';
import { GalleryToolbarButton } from '@/components/ui/gallery-toolbar-button';
import { PdfExtractToolbarButton } from '@/components/ui/pdf-extract-toolbar-button';
import { ToolbarGroup } from '@/components/ui/toolbar';
import { cn } from '@/lib/utils';

interface AdminPlateEditorProps {
  value?: Value;
  onChange?: (value: Value) => void;
  galleryUserId?: string;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
}

const defaultValue: Value = [
  {
    children: [{ text: '' }],
    type: 'p',
  },
];

export function AdminPlateEditor({
  value,
  onChange,
  galleryUserId,
  placeholder = 'Commencez à écrire...',
  readOnly = false,
  className,
}: AdminPlateEditorProps) {
  const editor = usePlateEditor({
    plugins: AdminEditorKit,
    value: value || defaultValue,
  });
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [mode, setMode] = React.useState<'write' | 'preview'>('write');

  // Sync external value changes
  React.useEffect(() => {
    if (value && JSON.stringify(editor.children) !== JSON.stringify(value)) {
      editor.tf.setValue(value);
    }
  }, [value, editor]);

  // Handle fullscreen escape key and body scroll
  React.useEffect(() => {
    if (!isFullscreen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsFullscreen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  const isPreviewMode = mode === 'preview' || readOnly;

  return (
    <Plate
      editor={editor}
      onChange={({ value: newValue }) => {
        onChange?.(newValue);
      }}
      readOnly={isPreviewMode}
    >
      <div
        className={cn(
          'relative',
          className,
          isFullscreen ? 'fixed inset-0 z-50 bg-background p-4' : ''
        )}
      >
        <div
          className={cn(
            'flex flex-col rounded-lg border bg-background overflow-hidden',
            isFullscreen ? 'h-full shadow-2xl' : ''
          )}
        >
          {/* Header bar with mode tabs and fullscreen */}
          <div className="flex items-center justify-between border-b bg-muted/30 px-2 py-1">
            {/* Mode tabs */}
            {!readOnly && (
              <div className="flex items-center gap-1">
                <Button
                  variant={mode === 'write' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-7 gap-1.5 px-2.5 text-xs"
                  onClick={() => setMode('write')}
                >
                  <Pencil className="size-3.5" />
                  Écrire
                </Button>
                <Button
                  variant={mode === 'preview' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-7 gap-1.5 px-2.5 text-xs"
                  onClick={() => setMode('preview')}
                >
                  <Eye className="size-3.5" />
                  Aperçu
                </Button>
              </div>
            )}
            {readOnly && <div />}

            {/* Fullscreen button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setIsFullscreen((prev) => !prev)}
              title={isFullscreen ? 'Quitter le plein écran (Esc)' : 'Plein écran'}
            >
              {isFullscreen ? (
                <Minimize2 className="size-4" />
              ) : (
                <Maximize2 className="size-4" />
              )}
            </Button>
          </div>

          {/* Toolbar - only in write mode */}
          {!isPreviewMode && (
            <FixedToolbar className="overflow-x-auto border-b">
              <FixedToolbarButtons
                extraLeftGroups={
                  <ToolbarGroup>
                    {galleryUserId && (
                      <GalleryToolbarButton userId={galleryUserId} />
                    )}
                    <PdfExtractToolbarButton onExtracted={onChange} />
                  </ToolbarGroup>
                }
              />
            </FixedToolbar>
          )}

          {/* Editor content */}
          <EditorContainer
            className={cn(
              isFullscreen ? 'flex-1 min-h-0 overflow-auto' : '',
              isPreviewMode ? 'bg-muted/10' : ''
            )}
          >
            <Editor
              variant="default"
              placeholder={placeholder}
              className={cn(
                'min-h-[300px]',
                isFullscreen ? 'min-h-0 h-full' : ''
              )}
            />
          </EditorContainer>

          {/* Floating toolbar - only in write mode */}
          {!isPreviewMode && (
            <FloatingToolbar>
              <FloatingToolbarButtons />
            </FloatingToolbar>
          )}
        </div>
      </div>
    </Plate>
  );
}
