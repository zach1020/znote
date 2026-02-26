import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';

// Vaporwave base theme — backgrounds, gutter, cursor, selection
export const vaporwaveTheme = EditorView.theme({
  '&': {
    backgroundColor: '#050508',
    color: '#EEEEF2',
    height: '100%',
  },
  '.cm-content': {
    fontFamily: "'Space Mono', monospace",
    fontSize: '13px',
    lineHeight: '1.7',
    padding: '24px 32px',
    caretColor: '#FF2D95',
  },
  '&.cm-focused .cm-cursor': {
    borderLeftColor: '#FF2D95',
    borderLeftWidth: '2px',
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
    background: 'rgba(255, 45, 149, 0.15) !important',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(255, 45, 149, 0.04)',
    borderLeft: '2px solid #FF2D95',
  },
  '.cm-gutters': {
    backgroundColor: '#0A0A14',
    color: '#555577',
    border: 'none',
    borderRight: '1px solid #1A1A3E',
    fontFamily: "'Space Mono', monospace",
    fontSize: '13px',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'transparent',
    color: '#FF2D95',
  },
  '.cm-lineNumbers .cm-gutterElement': {
    padding: '0 8px 0 12px',
    minWidth: '40px',
    textAlign: 'right',
  },
  '.cm-foldGutter': {
    width: '12px',
  },
  // Matching bracket
  '&.cm-focused .cm-matchingBracket': {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    outline: '1px solid rgba(0, 240, 255, 0.3)',
  },
  // Search match
  '.cm-searchMatch': {
    backgroundColor: 'rgba(176, 38, 255, 0.2)',
    outline: '1px solid rgba(176, 38, 255, 0.4)',
  },
  '.cm-searchMatch.cm-searchMatch-selected': {
    backgroundColor: 'rgba(0, 240, 255, 0.2)',
  },
  // Tooltip
  '.cm-tooltip': {
    backgroundColor: '#10101E',
    border: '1px solid #1A1A3E',
    color: '#EEEEF2',
    borderRadius: '6px',
  },
  '.cm-tooltip-autocomplete': {
    '& > ul > li[aria-selected]': {
      background: 'rgba(255, 45, 149, 0.15)',
    },
  },
  // Panels
  '.cm-panels': {
    backgroundColor: '#0A0A14',
    borderBottom: '1px solid #1A1A3E',
  },
  '.cm-panel input': {
    backgroundColor: '#080812',
    border: '1px solid #1A1A3E',
    color: '#EEEEF2',
    borderRadius: '4px',
  },
  '.cm-panel button': {
    backgroundColor: '#10101E',
    color: '#EEEEF2',
    border: '1px solid #1A1A3E',
    borderRadius: '4px',
  },
}, { dark: true });

// Syntax highlighting for markdown (neon colors)
export const vaporwaveHighlighting = syntaxHighlighting(HighlightStyle.define([
  // Headings → pink gradient feel
  { tag: tags.heading1, color: '#FF2D95', fontWeight: '700', fontSize: '1.6em', fontFamily: "'Space Grotesk', sans-serif" },
  { tag: tags.heading2, color: '#00F0FF', fontWeight: '700', fontSize: '1.3em', fontFamily: "'Space Grotesk', sans-serif" },
  { tag: tags.heading3, color: '#B026FF', fontWeight: '700', fontSize: '1.1em', fontFamily: "'Space Grotesk', sans-serif" },
  { tag: tags.heading4, color: '#C4F82A', fontWeight: '600' },
  { tag: tags.heading5, color: '#8888AA', fontWeight: '600' },
  { tag: tags.heading6, color: '#555577', fontWeight: '600' },

  // Emphasis
  { tag: tags.emphasis, color: '#00F0FF', fontStyle: 'italic' },
  { tag: tags.strong, color: '#C4F82A', fontWeight: '700' },
  { tag: tags.strikethrough, color: '#555577', textDecoration: 'line-through' },

  // Code
  { tag: tags.monospace, color: '#C4F82A', fontFamily: "'Space Mono', monospace" },

  // Links
  { tag: tags.link, color: '#00F0FF', textDecoration: 'underline' },
  { tag: tags.url, color: '#8888AA' },

  // Quote
  { tag: tags.quote, color: '#B026FF', fontStyle: 'italic' },

  // Lists
  { tag: tags.list, color: '#FF2D95' },

  // Meta (markdown markers like #, *, >, etc.)
  { tag: tags.meta, color: '#555577' },
  { tag: tags.processingInstruction, color: '#555577' },

  // Comments
  { tag: tags.comment, color: '#555577', fontStyle: 'italic' },

  // Strings (in code blocks)
  { tag: tags.string, color: '#C4F82A' },
  { tag: tags.number, color: '#FF2D95' },
  { tag: tags.bool, color: '#B026FF' },
  { tag: tags.keyword, color: '#FF2D95' },
  { tag: tags.function(tags.variableName), color: '#00F0FF' },
  { tag: tags.variableName, color: '#EEEEF2' },
  { tag: tags.definition(tags.variableName), color: '#00F0FF' },
  { tag: tags.typeName, color: '#B026FF' },
  { tag: tags.operator, color: '#FF2D95' },
  { tag: tags.punctuation, color: '#8888AA' },
  { tag: tags.bracket, color: '#8888AA' },
  { tag: tags.propertyName, color: '#00F0FF' },

  // Content
  { tag: tags.content, color: '#EEEEF2' },
]));
