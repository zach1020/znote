import './style.css';
import { createEditor, setContent, getContent, onUpdate } from './editor/editor.js';
import { initSidebar, openFolder } from './sidebar/sidebar.js';
import { initToolbar } from './toolbar/toolbar.js';
import { initStatusbar } from './statusbar/statusbar.js';
import { openFile, saveFile, saveFileAs, newFile, setHasUnsavedChanges } from './commands/file-ops.js';

// Default welcome document
const WELCOME_DOC = `# Welcome to ZNOTE

A vaporwave-inspired rich text editor built for the digital frontier. Write in markdown, export to .docx, .txt, or .pdf with neon-drenched precision.

> "The future is already here — it's just not evenly distributed."  — William Gibson

## Features

- Markdown syntax highlighting
- Export to .docx, .txt, and .pdf
- Real-time preview with split pane
- Cyberpunk theme with neon accents

\`\`\`javascript
const editor = new ZNote({
  theme: 'vaporwave',
  formats: ['md', 'docx', 'pdf'],
  autosave: true
});
\`\`\`
`;

function init() {
  const container = document.getElementById('editor-container');
  const editor = createEditor(container, WELCOME_DOC);

  // --- Helpers ---
  const setEditorContent = (text) => setContent(text);
  const getEditorContent = () => getContent();
  const updateTitle = (name) => {
    const tabName = document.querySelector('.tab-name');
    if (tabName) tabName.textContent = name;
    document.title = `ZNOTE — ${name}`;
  };

  // --- Track unsaved changes ---
  onUpdate((update) => {
    if (update.docChanged) {
      setHasUnsavedChanges(true);
    }
  });

  // --- Init modules ---
  initSidebar(setEditorContent, updateTitle);
  initToolbar(getEditorContent);
  initStatusbar();

  // --- Keyboard shortcuts ---
  document.addEventListener('keydown', (e) => {
    const mod = e.metaKey || e.ctrlKey;

    if (mod && e.key === 'o') {
      e.preventDefault();
      openFile(setEditorContent, updateTitle);
    }
    if (mod && e.key === 's') {
      e.preventDefault();
      if (e.shiftKey) {
        saveFileAs(getEditorContent, updateTitle);
      } else {
        saveFile(getEditorContent, updateTitle);
      }
    }
    if (mod && e.key === 'n') {
      e.preventDefault();
      newFile(setEditorContent, updateTitle);
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
