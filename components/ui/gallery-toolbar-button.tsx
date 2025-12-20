'use client';

import { useState } from 'react';

import { GalleryHorizontalEnd } from 'lucide-react';
import { KEYS } from 'platejs';
import { useEditorRef } from 'platejs/react';

import { GalleryPickerDialog } from '@/components/gallery/gallery-picker-dialog';
import type { Database } from '@/lib/supabase';

import { ToolbarButton } from './toolbar';

type GalleryAssetRow = Database['public']['Tables']['gallery_assets']['Row'];

interface GalleryToolbarButtonProps {
  userId?: string;
}

export function GalleryToolbarButton({ userId }: GalleryToolbarButtonProps) {
  const editor = useEditorRef();
  const [open, setOpen] = useState(false);

  if (!userId) {
    return null;
  }

  const handleSelect = (asset: GalleryAssetRow) => {
    if (asset.type === 'image' && asset.file_url) {
      // Insert image node
      editor.tf.insertNodes({
        type: KEYS.img,
        url: asset.file_url,
        caption: [{ children: [{ text: asset.title }], type: 'p' }],
        children: [{ text: '' }],
      });
    } else if (asset.type === 'latex' && asset.latex_content) {
      // Insert equation node
      editor.tf.insertNodes({
        type: KEYS.equation,
        texExpression: asset.latex_content,
        children: [{ text: '' }],
      });
    }
    setOpen(false);
  };

  return (
    <>
      <ToolbarButton onClick={() => setOpen(true)} tooltip="Galerie">
        <GalleryHorizontalEnd />
      </ToolbarButton>
      <GalleryPickerDialog
        open={open}
        onOpenChange={setOpen}
        onSelect={handleSelect}
        userId={userId}
      />
    </>
  );
}
