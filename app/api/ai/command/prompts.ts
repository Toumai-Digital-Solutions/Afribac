import type { ChatMessage } from '@/components/editor/use-chat';
import type { SlateEditor } from 'platejs';

import { getMarkdown } from '@platejs/ai';
import dedent from 'dedent';

import {
  addSelection,
  buildStructuredPrompt,
  formatTextFromMessages,
  getMarkdownWithSelection,
  isMultiBlocks,
} from './utils';

export function getChooseToolPrompt({ messages }: { messages: ChatMessage[] }) {
  return buildStructuredPrompt({
    examples: [
      // GENERATE
      `Utilisateur : « Rédige un paragraphe sur l’éthique de l’IA » → Bien : "generate" | Mal : "edit"`,
      `Utilisateur : « Écris un court poème sur le printemps » → Bien : "generate" | Mal : "comment"`,

      // EDIT
      `Utilisateur : « Corrige la grammaire. » → Bien : "edit" | Mal : "generate"`,
      `Utilisateur : « Améliore le style. » → Bien : "edit" | Mal : "generate"`,
      `Utilisateur : « Rends ce texte plus concis. » → Bien : "edit" | Mal : "generate"`,
      `Utilisateur : « Traduis ce paragraphe en anglais. » → Bien : "edit" | Mal : "generate"`,

      // COMMENT
      `Utilisateur : « Peux-tu relire ce texte et me donner un avis ? » → Bien : "comment" | Mal : "edit"`,
      `Utilisateur : « Ajoute des commentaires dans ce code pour l’expliquer » → Bien : "comment" | Mal : "generate"`,
    ],
    history: formatTextFromMessages(messages),
    rules: dedent`
      - Par défaut : "generate". Toute question ouverte, demande d’idée, ou demande de création → "generate".
      - Retourner "edit" uniquement si l’utilisateur fournit du texte (ou une sélection) ET demande de le modifier, reformuler, traduire ou raccourcir.
      - Retourner "comment" uniquement si l’utilisateur demande explicitement des commentaires, un avis, des annotations ou une relecture. Ne jamais l’inférer implicitement.
      - Retourner une seule valeur (enum), sans explication.
    `,
    task: `Tu es un classifieur strict. Classe la dernière demande de l’utilisateur en "generate", "edit", ou "comment".`,
  });
}

export function getCommentPrompt(
  editor: SlateEditor,
  {
    messages,
  }: {
    messages: ChatMessage[];
  }
) {
  const selectingMarkdown = getMarkdown(editor, {
    type: 'blockWithBlockId',
  });

  return buildStructuredPrompt({
    backgroundData: selectingMarkdown,
    examples: [
      // 1) Basic single-block comment
      `Utilisateur : Relis ce paragraphe.

    backgroundData:
  <block id="1">AI systems are transforming modern workplaces by automating routine tasks.</block>

  Output:
  [
    {
      "blockId": "1",
      "content": "AI systems are transforming modern workplaces",
      "comment": "Précise le type de systèmes ou ajoute un exemple concret."
    }
  ]`,

      // 2) Multiple comments within one long block
      `Utilisateur : Ajoute des commentaires sur ce passage.

  backgroundData:
  <block id="2">AI models can automate customer support. However, they may misinterpret user intent if training data is biased.</block>

  Output:
  [
    {
      "blockId": "2",
      "content": "AI models can automate customer support.",
      "comment": "Tu peux préciser les limites ou le périmètre de l’automatisation."
    },
    {
      "blockId": "2",
      "content": "they may misinterpret user intent if training data is biased",
      "comment": "Bon point : explique brièvement comment réduire ou détecter les biais."
    }
  ]`,

      // 3) Multi-block comment (span across two related paragraphs)
      `Utilisateur : Fais une relecture et propose un retour.

  backgroundData:
  <block id="3">This policy aims to regulate AI-generated media.</block>
  <block id="4">Developers must disclose when content is synthetically produced.</block>

  Output:
  [
    {
      "blockId": "3",
      "content": "This policy aims to regulate AI-generated media.\\n\\nDevelopers must disclose when content is synthetically produced.",
      "comment": "Tu peux regrouper ces idées en une phrase plus claire sur la transparence."
    }
  ]`,

      // 4) With <Selection> – user highlighted part of a sentence
      `Utilisateur : Donne un avis sur l’expression surlignée.

  backgroundData:
  <block id="5">AI can <Selection>replace human creativity</Selection> in design tasks.</block>

  Output:
  [
    {
      "blockId": "5",
      "content": "replace human creativity",
      "comment": "Formulation trop forte : propose plutôt « assister » que « remplacer »."
    }
  ]`,

      // 5) With long <Selection> → multiple comments
      `Utilisateur : Relis la partie surlignée.

  backgroundData:
  <block id="6">
  <Selection>
  AI tools are valuable for summarizing information and generating drafts.
  Still, human review remains essential to ensure accuracy and ethical use.
  </Selection>
  </block>

  Output:
  [
    {
      "blockId": "6",
      "content": "AI tools are valuable for summarizing information and generating drafts.",
      "comment": "Bonne idée : ajoute un ou deux exemples d’outils."
    },
    {
      "blockId": "6",
      "content": "human review remains essential to ensure accuracy and ethical use",
      "comment": "Bonne nuance : explique brièvement pourquoi un contrôle humain est nécessaire."
    }
  ]`,
    ],
    history: formatTextFromMessages(messages),
    rules: dedent`
      - IMPORTANT : si un commentaire couvre plusieurs blocs, utilise l’id du **premier** bloc.
      - Le champ **content** doit être l’extrait original (sans les balises <block>), en conservant les balises MDX éventuelles.
      - IMPORTANT : le champ **content** est flexible :
        - il peut couvrir un bloc entier, une partie d’un bloc, ou plusieurs blocs ;
        - si plusieurs blocs sont inclus, sépare-les par deux \\n\\n ;
        - ne retourne pas systématiquement tout le bloc : utilise la plus petite portion pertinente.
      - Il faut au moins un commentaire.
      - Si une balise <Selection> existe, les commentaires doivent porter sur la <Selection>. Si la <Selection> est longue, il doit y avoir plusieurs commentaires.
    `,
    task: dedent`
      Tu es un assistant de relecture.
      Tu reçois un document MDX découpé en blocs : <block id="...">contenu</block>.
      <Selection> correspond au texte surligné par l’utilisateur.

      Ta mission :
      - Lire le contenu et fournir des commentaires.
      - Pour chaque commentaire, générer un objet JSON :
        - blockId : l’id du bloc concerné ;
        - content : l’extrait exact à commenter ;
        - comment : le commentaire (court) ou une explication.
    `,
  });
}

export function getGeneratePrompt(
  editor: SlateEditor,
  { messages }: { messages: ChatMessage[] }
) {
  if (!isMultiBlocks(editor)) {
    addSelection(editor);
  }

  const selectingMarkdown = getMarkdownWithSelection(editor);

  return buildStructuredPrompt({
    backgroundData: selectingMarkdown,
    examples: [
      // 1) Summarize content
      'Utilisateur : Résume le texte suivant.\nDonnées de contexte :\nL’intelligence artificielle a transformé de nombreux secteurs, de la santé à la finance, en améliorant l’efficacité et en permettant des décisions fondées sur les données.\nSortie :\nL’IA améliore l’efficacité et la prise de décision dans de nombreux secteurs.',

      // 2) Generate key takeaways
      'Utilisateur : Donne trois points clés à retenir.\nDonnées de contexte :\nLe travail à distance augmente la flexibilité, mais exige aussi une meilleure communication et une bonne gestion du temps.\nSortie :\n- Le travail à distance apporte de la flexibilité.\n- La communication devient essentielle.\n- La gestion du temps conditionne la réussite.',

      // 3) Generate a title
      'Utilisateur : Propose un titre court et accrocheur.\nDonnées de contexte :\nCette section explique comment des modèles d’apprentissage automatique sont entraînés sur de grands jeux de données pour reconnaître des motifs.\nSortie :\nEntraîner des modèles à reconnaître des motifs',

      // 4) Generate action items
      'Utilisateur : Propose des prochaines étapes concrètes.\nDonnées de contexte :\nLe rapport suggère d’améliorer la documentation et de mener des entretiens utilisateurs avant la prochaine version.\nSortie :\n- Mettre à jour la documentation technique.\n- Planifier des entretiens utilisateurs avant la prochaine version.',

      // 5) Generate a comparison table
      'Utilisateur : Génère un tableau comparatif.\nDonnées de contexte :\nOutil A : gratuit, interface simple\nOutil B : payant, analyses avancées\nSortie :\n| Outil | Prix    | Fonctionnalités       |\n|------|---------|------------------------|\n| A    | Gratuit | Interface simple       |\n| B    | Payant  | Analyses avancées      |',

      // 6) Generate a summary table of statistics
      'Utilisateur : Crée un tableau récapitulatif.\nDonnées de contexte :\nVentes T1 : 1200 unités\nVentes T2 : 1500 unités\nVentes T3 : 900 unités\nSortie :\n| Trimestre | Ventes (unités) |\n|----------|------------------|\n| T1       | 1200             |\n| T2       | 1500             |\n| T3       | 900              |',

      // 7) Generate a question list
      'Utilisateur : Génère trois questions de réflexion.\nDonnées de contexte :\nL’article discute du rôle de la créativité dans la résolution de problèmes et de l’importance de la diversité pour l’innovation.\nSortie :\n1. Comment encourager la créativité dans un cadre structuré ?\n2. Quel rôle joue la diversité dans l’innovation ?\n3. Comment concilier créativité et efficacité ?',

      // 8) Explain a concept (selected phrase)
      'Utilisateur : Explique le sens de l’expression sélectionnée.\nDonnées de contexte :\nLe deep learning s’appuie sur des réseaux de neurones pour extraire automatiquement des motifs à partir des données : c’est ce qu’on appelle <Selection>feature learning</Selection>.\nSortie :\n« Feature learning » signifie apprendre automatiquement des représentations utiles à partir de données brutes, sans intervention manuelle.',
    ],
    history: formatTextFromMessages(messages),
    rules: dedent`
      - <Selection> correspond au texte surligné par l’utilisateur.
      - backgroundData représente le contexte Markdown actuel.
      - Tu ne dois utiliser que backgroundData et <Selection> ; ne demande jamais plus de données.
      - CRITIQUE : ne supprime pas et ne modifie pas les balises MDX personnalisées (<u>, <callout>, <kbd>, <toc>, <sub>, <sup>, <mark>, <del>, <date>, <span>, <column>, <column_group>, <file>, <audio>, <video>) sauf demande explicite.
      - CRITIQUE : en Markdown/MDX, n’entoure pas la sortie par des blocs de code.
      - Préserve l’indentation et les retours à la ligne dans les mises en page structurées (colonnes, etc.).
    `,
    task: dedent`
      Tu es un assistant de génération de contenu.
      Génère du contenu à partir des consignes de l’utilisateur, en utilisant le contexte fourni (backgroundData).
      Si la consigne demande une création ou une transformation (résumer, traduire, réécrire, faire un tableau, etc.), produis directement le résultat final en te basant uniquement sur backgroundData.
      Ne demande pas de contenu supplémentaire.
    `,
  });
}

export function getEditPrompt(
  editor: SlateEditor,
  { isSelecting, messages }: { isSelecting: boolean; messages: ChatMessage[] }
) {
  if (!isSelecting)
    throw new Error('L’outil d’édition est disponible uniquement sur une sélection');
  if (isMultiBlocks(editor)) {
    const selectingMarkdown = getMarkdownWithSelection(editor);

    return buildStructuredPrompt({
      backgroundData: selectingMarkdown,
      examples: [
        // 1) Fix grammar
        'Utilisateur : Corrige la grammaire.\nbackgroundData: # Guide utilisateur\nCe guide explique comment installer l’application.\nSortie :\n# Guide utilisateur\nCe guide explique comment installer l’application.',

        // 2) Make the tone more formal and professional
        "Utilisateur : Adopte un ton plus formel et professionnel.\nbackgroundData: ## Intro\nSalut, voici comment tout configurer rapidement.\nSortie :\n## Introduction\nCette section décrit la procédure de configuration de manière claire et professionnelle.",

        // 3) Make it more concise without losing meaning
        'Utilisateur : Rends ce texte plus concis sans perdre le sens.\nbackgroundData: L’objectif de ce document est de fournir une vue d’ensemble qui explique en détail toutes les étapes nécessaires pour terminer l’installation.\nSortie :\nCe document présente en détail les étapes de l’installation.',
      ],
      history: formatTextFromMessages(messages),
      outputFormatting: 'markdown',
      rules: dedent`
        - N’écris pas les balises <backgroundData> dans ta réponse.
        - <backgroundData> contient tous les blocs sélectionnés que l’utilisateur veut modifier.
        - Ta réponse doit remplacer directement l’intégralité de <backgroundData>.
        - Conserve la structure et le format, sauf demande explicite.
        - CRITIQUE : ne fournis que le contenu de remplacement. N’ajoute pas de blocs et ne change pas la structure des blocs sauf demande explicite.
      `,
      task: `Le <backgroundData> suivant est un contenu Markdown fourni par l’utilisateur. Modifie-le selon sa consigne.
      Sauf indication contraire, la sortie doit pouvoir remplacer l’original sans rupture.`,
    });
  }

  addSelection(editor);

  const selectingMarkdown = getMarkdownWithSelection(editor);
  const endIndex = selectingMarkdown.indexOf('<Selection>');
  const prefilledResponse = selectingMarkdown.slice(0, endIndex);

  return buildStructuredPrompt({
    backgroundData: selectingMarkdown,
    examples: [
      // 1) Improve word choice
      'Utilisateur : Améliore le choix des mots.\nbackgroundData: This is a <Selection>nice</Selection> person.\nSortie : great',

      // 2) Fix grammar
      'Utilisateur : Corrige la grammaire.\nbackgroundData: He <Selection>go</Selection> to school every day.\nSortie : goes',

      // 3) Make tone more polite
      'Utilisateur : Rends le ton plus poli.\nbackgroundData: <Selection>Give me</Selection> the report.\nSortie : Please provide',

      // 4) Make tone more confident
      'Utilisateur : Rends le ton plus affirmé.\nbackgroundData: I <Selection>think</Selection> this might work.\nSortie : believe',

      // 5) Simplify language
      'Utilisateur : Simplifie le langage.\nbackgroundData: The results were <Selection>exceedingly</Selection> positive.\nSortie : very',

      // 6) Translate into French
      'Utilisateur : Traduis en français.\nbackgroundData: <Selection>Hello</Selection>\nSortie : Bonjour',

      // 7) Expand description
      'Utilisateur : Développe la description.\nbackgroundData: The view was <Selection>beautiful</Selection>.\nSortie : breathtaking and full of vibrant colors',

      // 8) Make it sound more natural
      'Utilisateur : Rends la formulation plus naturelle.\nbackgroundData: She <Selection>did a party</Selection> yesterday.\nSortie : had a party',
    ],
    history: formatTextFromMessages(messages),
    outputFormatting: 'markdown',
    prefilledResponse,
    rules: dedent`
      - <Selection> contient le segment modifiable.
      - Ta réponse sera concaténée à prefilledResponse : le résultat doit rester fluide et cohérent.
      - Tu ne peux modifier que le contenu dans <Selection> et ne dois pas utiliser de contexte externe.
      - La sortie doit pouvoir remplacer directement <Selection>.
      - N’inclus pas les balises <Selection> ni le texte autour.
      - La formulation doit être correcte et naturelle.
      - Si l’entrée est invalide ou non améliorable, renvoie-la inchangée.
    `,
    task: dedent`
      Le backgroundData suivant contient une ou plusieurs balises <Selection> qui marquent les parties éditables.
      Tu dois uniquement modifier le texte dans <Selection>.
      Ta sortie doit remplacer directement la sélection, sans balises ni texte autour.
      Le remplacement doit être correct et s’intégrer naturellement dans le texte d’origine.
    `,
  });
}
