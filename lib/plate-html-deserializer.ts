import type { Value } from 'platejs';

/**
 * Converts HTML string to Plate JSON Value
 * Handles common HTML elements and LaTeX math expressions
 */
export function htmlToPlateValue(html: string): Value {
  // Create a DOM parser
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const result: Value = [];

  // Process all child nodes of the body
  for (const node of Array.from(doc.body.childNodes)) {
    const converted = convertNode(node);
    if (converted) {
      if (Array.isArray(converted)) {
        result.push(...converted);
      } else {
        result.push(converted);
      }
    }
  }

  return result.length > 0 ? result : [{ type: 'p', children: [{ text: '' }] }];
}

/**
 * Convert a DOM node to Plate node(s)
 */
function convertNode(node: Node): any | any[] | null {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent || '';
    if (!text.trim()) return null;

    // Check for LaTeX in text
    return parseTextWithLatex(text);
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const element = node as Element;
  const tagName = element.tagName.toLowerCase();

  switch (tagName) {
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      return {
        type: tagName,
        children: convertChildren(element),
      };

    case 'p':
      return {
        type: 'p',
        children: convertChildren(element),
      };

    case 'blockquote':
      return {
        type: 'blockquote',
        children: convertChildren(element),
      };

    case 'pre':
    case 'code':
      if (tagName === 'pre' || element.parentElement?.tagName.toLowerCase() !== 'pre') {
        const code = element.textContent || '';
        return {
          type: 'code_block',
          children: [{ type: 'code_line', children: [{ text: code }] }],
        };
      }
      return { text: element.textContent || '', code: true };

    case 'ul':
      return {
        type: 'ul',
        children: Array.from(element.children)
          .filter((li) => li.tagName.toLowerCase() === 'li')
          .map((li) => ({
            type: 'li',
            children: [
              {
                type: 'lic',
                children: convertChildren(li),
              },
            ],
          })),
      };

    case 'ol':
      return {
        type: 'ol',
        children: Array.from(element.children)
          .filter((li) => li.tagName.toLowerCase() === 'li')
          .map((li) => ({
            type: 'li',
            children: [
              {
                type: 'lic',
                children: convertChildren(li),
              },
            ],
          })),
      };

    case 'li':
      return {
        type: 'li',
        children: [
          {
            type: 'lic',
            children: convertChildren(element),
          },
        ],
      };

    case 'table':
      return {
        type: 'table',
        children: convertTableChildren(element),
      };

    case 'hr':
      return {
        type: 'hr',
        children: [{ text: '' }],
      };

    case 'br':
      return { text: '\n' };

    case 'a':
      return {
        type: 'a',
        url: element.getAttribute('href') || '',
        children: convertChildren(element),
      };

    case 'img':
      return {
        type: 'img',
        url: element.getAttribute('src') || '',
        caption: [{ children: [{ text: element.getAttribute('alt') || '' }] }],
        children: [{ text: '' }],
      };

    case 'strong':
    case 'b':
      return convertChildren(element).map((child: any) => ({
        ...child,
        bold: true,
      }));

    case 'em':
    case 'i':
      return convertChildren(element).map((child: any) => ({
        ...child,
        italic: true,
      }));

    case 'u':
      return convertChildren(element).map((child: any) => ({
        ...child,
        underline: true,
      }));

    case 's':
    case 'strike':
    case 'del':
      return convertChildren(element).map((child: any) => ({
        ...child,
        strikethrough: true,
      }));

    case 'sup':
      return convertChildren(element).map((child: any) => ({
        ...child,
        superscript: true,
      }));

    case 'sub':
      return convertChildren(element).map((child: any) => ({
        ...child,
        subscript: true,
      }));

    case 'div':
    case 'section':
    case 'article':
    case 'figure':
      // These are containers, process their children
      const divChildren: any[] = [];
      for (const child of Array.from(element.childNodes)) {
        const converted = convertNode(child);
        if (converted) {
          if (Array.isArray(converted)) {
            divChildren.push(...converted);
          } else {
            divChildren.push(converted);
          }
        }
      }
      return divChildren.length > 0 ? divChildren : null;

    case 'figcaption':
      return {
        type: 'p',
        children: convertChildren(element),
      };

    case 'span':
      return convertChildren(element);

    default:
      // For unknown elements, try to convert children
      const children = convertChildren(element);
      if (children.length > 0) {
        // Wrap in paragraph if it looks like block content
        if (element.querySelector('p, div, h1, h2, h3, h4, h5, h6')) {
          return children;
        }
        return {
          type: 'p',
          children,
        };
      }
      return null;
  }
}

/**
 * Convert children of an element to Plate nodes
 */
function convertChildren(element: Element): any[] {
  const result: any[] = [];

  for (const child of Array.from(element.childNodes)) {
    const converted = convertNode(child);
    if (converted) {
      if (Array.isArray(converted)) {
        result.push(...converted);
      } else {
        result.push(converted);
      }
    }
  }

  // Ensure there's at least one text node
  if (result.length === 0) {
    return [{ text: '' }];
  }

  // Flatten text nodes that should be inline
  return result.map((node) => {
    if (node.type && !['a', 'inline_equation'].includes(node.type)) {
      // Block elements should not be flattened
      return node;
    }
    return node;
  });
}

/**
 * Convert table children (thead, tbody, tr, etc.)
 */
function convertTableChildren(table: Element): any[] {
  const rows: any[] = [];

  // Get all rows from thead and tbody
  const allRows = table.querySelectorAll('tr');

  for (const tr of Array.from(allRows)) {
    const cells: any[] = [];

    for (const cell of Array.from(tr.children)) {
      if (cell.tagName.toLowerCase() === 'th' || cell.tagName.toLowerCase() === 'td') {
        cells.push({
          type: cell.tagName.toLowerCase() === 'th' ? 'th' : 'td',
          children: [
            {
              type: 'p',
              children: convertChildren(cell),
            },
          ],
        });
      }
    }

    if (cells.length > 0) {
      rows.push({
        type: 'tr',
        children: cells,
      });
    }
  }

  return rows;
}

/**
 * Parse text that may contain inline LaTeX
 */
function parseTextWithLatex(text: string): any[] {
  const result: any[] = [];

  // First check for block equations $$...$$
  if (text.trim().startsWith('$$') && text.trim().endsWith('$$')) {
    const latex = text.trim().slice(2, -2).trim();
    return [
      {
        type: 'equation',
        texExpression: latex,
        children: [{ text: '' }],
      },
    ];
  }

  // Parse inline equations $...$
  const regex = /\$([^$\n]+)\$/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      result.push({ text: text.slice(lastIndex, match.index) });
    }

    // Add inline equation
    result.push({
      type: 'inline_equation',
      texExpression: match[1].trim(),
      children: [{ text: '' }],
    });

    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    result.push({ text: text.slice(lastIndex) });
  }

  // If no LaTeX found, just return the text
  if (result.length === 0) {
    result.push({ text });
  }

  return result;
}

/**
 * Simple conversion for plain text with LaTeX to Plate Value
 */
export function textToPlateValue(text: string): Value {
  const lines = text.split('\n');
  const result: Value = [];
  let currentParagraph: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const paragraphText = currentParagraph.join(' ').trim();
      if (paragraphText) {
        const children = parseTextWithLatex(paragraphText);
        result.push({
          type: 'p',
          children,
        });
      }
      currentParagraph = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    // Empty line = paragraph break
    if (!trimmed) {
      flushParagraph();
      continue;
    }

    // Check for block equations
    if (trimmed.startsWith('$$') && trimmed.endsWith('$$')) {
      flushParagraph();
      const latex = trimmed.slice(2, -2).trim();
      result.push({
        type: 'equation',
        texExpression: latex,
        children: [{ text: '' }],
      });
      continue;
    }

    // Check for headings (simple markdown-style)
    if (trimmed.startsWith('# ')) {
      flushParagraph();
      result.push({
        type: 'h1',
        children: parseTextWithLatex(trimmed.slice(2)),
      });
      continue;
    }
    if (trimmed.startsWith('## ')) {
      flushParagraph();
      result.push({
        type: 'h2',
        children: parseTextWithLatex(trimmed.slice(3)),
      });
      continue;
    }
    if (trimmed.startsWith('### ')) {
      flushParagraph();
      result.push({
        type: 'h3',
        children: parseTextWithLatex(trimmed.slice(4)),
      });
      continue;
    }

    // Regular text line
    currentParagraph.push(trimmed);
  }

  // Flush any remaining paragraph
  flushParagraph();

  return result.length > 0 ? result : [{ type: 'p', children: [{ text: '' }] }];
}
