'use client';

import * as React from 'react';

import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';

import {
  CalendarIcon,
  ChevronRightIcon,
  Columns3Icon,
  FileCodeIcon,
  FilmIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ImageIcon,
  Link2Icon,
  ListIcon,
  ListOrderedIcon,
  MinusIcon,
  PenToolIcon,
  PilcrowIcon,
  PlusIcon,
  QuoteIcon,
  RadicalIcon,
  SquareIcon,
  TableIcon,
  TableOfContentsIcon,
} from 'lucide-react';
import { KEYS } from 'platejs';
import { type PlateEditor, useEditorRef } from 'platejs/react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  insertBlock,
  insertInlineElement,
} from '@/components/editor/transforms';

import { ToolbarButton, ToolbarMenuGroup } from './toolbar';

type Group = {
  group: string;
  items: Item[];
};

type Item = {
  icon: React.ReactNode;
  value: string;
  onSelect: (editor: PlateEditor, value: string) => void;
  focusEditor?: boolean;
  label?: string;
};

const groups: Group[] = [
  {
    group: 'Blocs de base',
    items: [
      {
        icon: <PilcrowIcon />,
        label: 'Paragraphe',
        value: KEYS.p,
      },
      {
        icon: <Heading1Icon />,
        label: 'Titre 1',
        value: 'h1',
      },
      {
        icon: <Heading2Icon />,
        label: 'Titre 2',
        value: 'h2',
      },
      {
        icon: <Heading3Icon />,
        label: 'Titre 3',
        value: 'h3',
      },
      {
        icon: <TableIcon />,
        label: 'Tableau',
        value: KEYS.table,
      },
      {
        icon: <FileCodeIcon />,
        label: 'Code',
        value: KEYS.codeBlock,
      },
      {
        icon: <QuoteIcon />,
        label: 'Citation',
        value: KEYS.blockquote,
      },
      {
        icon: <MinusIcon />,
        label: 'Séparateur',
        value: KEYS.hr,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value);
      },
    })),
  },
  {
    group: 'Listes',
    items: [
      {
        icon: <ListIcon />,
        label: 'Liste à puces',
        value: KEYS.ul,
      },
      {
        icon: <ListOrderedIcon />,
        label: 'Liste numérotée',
        value: KEYS.ol,
      },
      {
        icon: <SquareIcon />,
        label: 'Liste de tâches',
        value: KEYS.listTodo,
      },
      {
        icon: <ChevronRightIcon />,
        label: 'Liste repliable',
        value: KEYS.toggle,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value);
      },
    })),
  },
  {
    group: 'Médias',
    items: [
      {
        icon: <ImageIcon />,
        label: 'Image',
        value: KEYS.img,
      },
      {
        icon: <FilmIcon />,
        label: 'Intégration',
        value: KEYS.mediaEmbed,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value);
      },
    })),
  },
  {
    group: 'Blocs avancés',
    items: [
      {
        icon: <TableOfContentsIcon />,
        label: 'Table des matières',
        value: KEYS.toc,
      },
      {
        icon: <Columns3Icon />,
        label: '3 colonnes',
        value: 'action_three_columns',
      },
      {
        focusEditor: false,
        icon: <RadicalIcon />,
        label: 'Équation',
        value: KEYS.equation,
      },
      {
        icon: <PenToolIcon />,
        label: 'Excalidraw',
        value: KEYS.excalidraw,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value);
      },
    })),
  },
  {
    group: 'En ligne',
    items: [
      {
        icon: <Link2Icon />,
        label: 'Lien',
        value: KEYS.link,
      },
      {
        focusEditor: true,
        icon: <CalendarIcon />,
        label: 'Date',
        value: KEYS.date,
      },
      {
        focusEditor: false,
        icon: <RadicalIcon />,
        label: 'Équation en ligne',
        value: KEYS.inlineEquation,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertInlineElement(editor, value);
      },
    })),
  },
];

export function InsertToolbarButton(props: DropdownMenuProps) {
  const editor = useEditorRef();
  const [open, setOpen] = React.useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={open} tooltip="Insérer" isDropdown>
          <PlusIcon />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="flex max-h-[500px] min-w-0 flex-col overflow-y-auto"
        align="start"
      >
        {groups.map(({ group, items: nestedItems }) => (
          <ToolbarMenuGroup key={group} label={group}>
            {nestedItems.map(({ icon, label, value, onSelect }) => (
              <DropdownMenuItem
                key={value}
                className="min-w-[180px]"
                onSelect={() => {
                  onSelect(editor, value);
                  editor.tf.focus();
                }}
              >
                {icon}
                {label}
              </DropdownMenuItem>
            ))}
          </ToolbarMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
