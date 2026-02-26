import { invoke } from '@tauri-apps/api/core';
import { open, save, ask } from '@tauri-apps/plugin-dialog';

// Current file state
let currentFilePath = null;
let hasUnsavedChanges = false;

const MD_FILTERS = [
  { name: 'Markdown', extensions: ['md', 'markdown'] },
  { name: 'Text', extensions: ['txt'] },
  { name: 'All Files', extensions: ['*'] },
];

export function getCurrentFilePath() {
  return currentFilePath;
}

export function setCurrentFilePath(path) {
  currentFilePath = path;
}

export function getHasUnsavedChanges() {
  return hasUnsavedChanges;
}

export function setHasUnsavedChanges(val) {
  hasUnsavedChanges = val;
  updateSaveIndicator(val);
}

function updateSaveIndicator(unsaved) {
  const dot = document.querySelector('.save-dot');
  const label = document.getElementById('st-saved');
  if (dot && label) {
    dot.className = unsaved ? 'save-dot unsaved' : 'save-dot saved';
    label.lastChild.textContent = unsaved ? ' Modified' : ' Saved';
  }
}

export async function openFile(setEditorContent, updateTitle) {
  // Check for unsaved changes
  if (hasUnsavedChanges) {
    const confirmed = await ask('You have unsaved changes. Discard them?', {
      title: 'Unsaved Changes',
      kind: 'warning',
    });
    if (!confirmed) return;
  }

  const path = await open({
    multiple: false,
    filters: MD_FILTERS,
  });

  if (!path) return;

  try {
    const content = await invoke('read_file', { path });
    setEditorContent(content);
    currentFilePath = path;
    hasUnsavedChanges = false;
    updateSaveIndicator(false);
    updateTitle(getFilename(path));
    updateFormatPill(path);
  } catch (e) {
    showToast(`Failed to open file: ${e}`, 'error');
  }
}

export async function saveFile(getEditorContent, updateTitle) {
  if (!currentFilePath) {
    return saveFileAs(getEditorContent, updateTitle);
  }

  try {
    const content = getEditorContent();
    await invoke('write_file', { path: currentFilePath, content });
    hasUnsavedChanges = false;
    updateSaveIndicator(false);
    updateTitle(getFilename(currentFilePath));
  } catch (e) {
    showToast(`Failed to save file: ${e}`, 'error');
  }
}

export async function saveFileAs(getEditorContent, updateTitle) {
  const path = await save({
    filters: MD_FILTERS,
    defaultPath: currentFilePath || 'untitled.md',
  });

  if (!path) return;

  try {
    const content = getEditorContent();
    await invoke('write_file', { path, content });
    currentFilePath = path;
    hasUnsavedChanges = false;
    updateSaveIndicator(false);
    updateTitle(getFilename(path));
    updateFormatPill(path);
  } catch (e) {
    showToast(`Failed to save file: ${e}`, 'error');
  }
}

export async function newFile(setEditorContent, updateTitle) {
  if (hasUnsavedChanges) {
    const confirmed = await ask('You have unsaved changes. Discard them?', {
      title: 'Unsaved Changes',
      kind: 'warning',
    });
    if (!confirmed) return;
  }

  setEditorContent('');
  currentFilePath = null;
  hasUnsavedChanges = false;
  updateSaveIndicator(false);
  updateTitle('untitled.md');
}

export async function exportAs(format, getEditorContent) {
  const ext = format;
  const path = await save({
    filters: [{ name: format.toUpperCase(), extensions: [ext] }],
    defaultPath: `export.${ext}`,
  });

  if (!path) return;

  try {
    const content = getEditorContent();
    switch (format) {
      case 'txt':
        await invoke('export_txt', { markdown: content, path });
        break;
      case 'docx':
        await invoke('export_docx', { markdown: content, path });
        break;
      case 'pdf':
        await invoke('export_pdf', { markdown: content, path });
        break;
    }
    showToast(`Exported to ${getFilename(path)}`, 'success');
  } catch (e) {
    showToast(`Export failed: ${e}`, 'error');
  }
}

function getFilename(path) {
  return path.split('/').pop().split('\\').pop();
}

function updateFormatPill(path) {
  const ext = path.split('.').pop().toLowerCase();
  const pills = document.querySelectorAll('.pill');
  pills.forEach(p => {
    p.classList.toggle('active', p.dataset.format === ext || (p.dataset.format === 'md' && (ext === 'md' || ext === 'markdown')));
  });

  // Update status bar format badge
  const badge = document.getElementById('st-format');
  const names = { md: 'Markdown', markdown: 'Markdown', txt: 'Plain Text', docx: 'DOCX', pdf: 'PDF' };
  if (badge) badge.textContent = names[ext] || 'Markdown';
}

function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

export { showToast };
