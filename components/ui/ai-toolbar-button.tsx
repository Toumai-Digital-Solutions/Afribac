'use client';

import * as React from 'react';

import { AIChatPlugin } from '@platejs/ai/react';
import { useEditorPlugin } from 'platejs/react';

import { ToolbarButton } from './toolbar';

export function AIToolbarButton(
  props: React.ComponentProps<typeof ToolbarButton>
) {
  const { api, editor } = useEditorPlugin(AIChatPlugin);

  return (
    <ToolbarButton
      {...props}
      onClick={() => {
        if (editor.selection) {
          editor.tf.focus();
        } else {
          editor.tf.focus({ edge: 'endEditor' });
        }
        requestAnimationFrame(() => {
          api.aiChat.show();
        });
      }}
      onMouseDown={(e) => {
        e.preventDefault();
      }}
    />
  );
}
