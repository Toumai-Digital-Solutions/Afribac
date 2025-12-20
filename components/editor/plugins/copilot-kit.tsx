'use client';

import type { TElement } from 'platejs';

import { CopilotPlugin } from '@platejs/ai/react';
import { serializeMd, stripMarkdown } from '@platejs/markdown';

import { GhostText } from '@/components/ui/ghost-text';

import { MarkdownKit } from './markdown-kit';

export const CopilotKit = [
  ...MarkdownKit,
  CopilotPlugin.configure(({ api }) => ({
    options: {
      completeOptions: {
        api: '/api/ai/copilot',
        body: {
          system: `Tu es un assistant avancé de rédaction, comparable à VSCode Copilot mais pour du texte général. Ta mission est de prédire et générer la suite du texte à partir du contexte fourni, en respectant la langue du texte.
  
  Règles :
  - Continue naturellement jusqu’au prochain signe de ponctuation (., ,, ;, :, ?, ou !), en respectant la langue du texte.
  - Conserve le style et le ton. Ne répète pas le texte fourni.
  - Si le contexte est ambigu, propose la continuation la plus probable, dans la langue du texte.
  - Gère les extraits de code, listes ou textes structurés si nécessaire.
  - N’inclus pas """ dans la réponse.
  - CRITIQUE : termine toujours par un signe de ponctuation, dans la langue du texte.
  - CRITIQUE : ne commence pas un nouveau bloc. N’utilise pas de mise en forme de type >, #, 1., 2., -, etc. La suggestion doit continuer dans le même bloc.
  - Si aucun contexte n’est fourni ou si tu ne peux pas générer une suite, renvoie "0" sans explication.`,
        },
        onError: () => {
          console.warn('[Copilot] Échec de la complétion');
        },
        onFinish: (_, completion) => {
          if (completion === '0') return;

          api.copilot.setBlockSuggestion({
            text: stripMarkdown(completion),
          });
        },
      },
      debounceDelay: 500,
      renderGhostText: GhostText,
      getPrompt: ({ editor }) => {
        const contextEntry = editor.api.block({ highest: true });

        if (!contextEntry) return '';

        const prompt = serializeMd(editor, {
          value: [contextEntry[0] as TElement],
        });

        return `Continue le texte jusqu’au prochain signe de ponctuation :
  """
  ${prompt}
  """`;
      },
    },
    shortcuts: {
      accept: {
        keys: 'tab',
      },
      acceptNextWord: {
        keys: 'mod+right',
      },
      reject: {
        keys: 'escape',
      },
      triggerSuggestion: {
        keys: 'ctrl+space',
      },
    },
  })),
];
