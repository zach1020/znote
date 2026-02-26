import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection, rectangularSelection } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { bracketMatching, indentOnInput, foldGutter, foldKeymap } from '@codemirror/language';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { showMinimap } from '@replit/codemirror-minimap';
import { vaporwaveTheme, vaporwaveHighlighting } from './theme.js';

let editorView = null;
let updateListeners = [];

const minimapConfig = showMinimap.compute([], () => ({
  create: () => {
    const dom = document.createElement('div');
    return { dom };
  },
  displayText: 'blocks',
  showOverlay: 'always',
}));

export function createEditor(parent, initialDoc = '') {
  const state = EditorState.create({
    doc: initialDoc,
    extensions: [
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightActiveLine(),
      drawSelection(),
      rectangularSelection(),
      indentOnInput(),
      bracketMatching(),
      closeBrackets(),
      history(),
      foldGutter(),
      highlightSelectionMatches(),
      markdown({ base: markdownLanguage, codeLanguages: languages }),
      vaporwaveTheme,
      vaporwaveHighlighting,
      keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...historyKeymap,
        ...foldKeymap,
        ...searchKeymap,
        indentWithTab,
      ]),
      minimapConfig,
      EditorView.updateListener.of((update) => {
        for (const listener of updateListeners) {
          listener(update);
        }
      }),
    ],
  });

  editorView = new EditorView({
    state,
    parent,
  });

  return editorView;
}

export function getEditor() {
  return editorView;
}

export function setContent(text) {
  if (!editorView) return;
  editorView.dispatch({
    changes: {
      from: 0,
      to: editorView.state.doc.length,
      insert: text,
    },
  });
}

export function getContent() {
  if (!editorView) return '';
  return editorView.state.doc.toString();
}

export function onUpdate(fn) {
  updateListeners.push(fn);
}

export function getCursorInfo() {
  if (!editorView) return { line: 1, col: 1 };
  const pos = editorView.state.selection.main.head;
  const line = editorView.state.doc.lineAt(pos);
  return {
    line: line.number,
    col: pos - line.from + 1,
  };
}

export function getWordCount() {
  if (!editorView) return 0;
  const text = editorView.state.doc.toString();
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

export function getCharCount() {
  if (!editorView) return 0;
  return editorView.state.doc.length;
}

// Insert markdown syntax at cursor
export function insertMarkdown(before, after = '') {
  if (!editorView) return;
  const { from, to } = editorView.state.selection.main;
  const selected = editorView.state.sliceDoc(from, to);

  if (selected) {
    // Wrap selection
    editorView.dispatch({
      changes: { from, to, insert: before + selected + after },
      selection: { anchor: from + before.length, head: from + before.length + selected.length },
    });
  } else {
    // Insert with placeholder
    const placeholder = 'text';
    editorView.dispatch({
      changes: { from, insert: before + placeholder + after },
      selection: { anchor: from + before.length, head: from + before.length + placeholder.length },
    });
  }
  editorView.focus();
}

// Insert markdown at line start
export function insertLinePrefix(prefix) {
  if (!editorView) return;
  const pos = editorView.state.selection.main.head;
  const line = editorView.state.doc.lineAt(pos);
  editorView.dispatch({
    changes: { from: line.from, insert: prefix },
  });
  editorView.focus();
}
