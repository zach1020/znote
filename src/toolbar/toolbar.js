import { insertMarkdown, insertLinePrefix, getEditor } from '../editor/editor.js';
import { exportAs } from '../commands/file-ops.js';
import { undo, redo } from '@codemirror/commands';

export function initToolbar(getEditorContent) {
  // Format buttons
  document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const action = btn.dataset.action;
      handleAction(action, getEditorContent);
    });
  });

  // Format pills (export triggers)
  document.querySelectorAll('.pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const format = pill.dataset.format;
      if (format === 'md') return; // md is the native format
      exportAs(format, getEditorContent);
    });
  });
}

function handleAction(action, getEditorContent) {
  switch (action) {
    case 'bold':
      insertMarkdown('**', '**');
      break;
    case 'italic':
      insertMarkdown('*', '*');
      break;
    case 'underline':
      // Markdown doesn't have native underline, use HTML
      insertMarkdown('<u>', '</u>');
      break;
    case 'strikethrough':
      insertMarkdown('~~', '~~');
      break;
    case 'code':
      insertMarkdown('`', '`');
      break;
    case 'h1':
      insertLinePrefix('# ');
      break;
    case 'h2':
      insertLinePrefix('## ');
      break;
    case 'h3':
      insertLinePrefix('### ');
      break;
    case 'ul':
      insertLinePrefix('- ');
      break;
    case 'ol':
      insertLinePrefix('1. ');
      break;
    case 'checklist':
      insertLinePrefix('- [ ] ');
      break;
    case 'link':
      insertMarkdown('[', '](url)');
      break;
    case 'image':
      insertMarkdown('![alt](', ')');
      break;
    case 'table':
      insertTable();
      break;
    case 'quote':
      insertLinePrefix('> ');
      break;
    case 'undo': {
      const editor = getEditor();
      if (editor) undo(editor);
      break;
    }
    case 'redo': {
      const editor = getEditor();
      if (editor) redo(editor);
      break;
    }
  }
}

function insertTable() {
  const table = `| Column 1 | Column 2 | Column 3 |
| -------- | -------- | -------- |
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |`;

  const editor = getEditor();
  if (!editor) return;
  const pos = editor.state.selection.main.head;
  editor.dispatch({
    changes: { from: pos, insert: '\n' + table + '\n' },
  });
  editor.focus();
}
