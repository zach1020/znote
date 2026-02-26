import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import { setContent } from '../editor/editor.js';
import { setCurrentFilePath, setHasUnsavedChanges, showToast } from '../commands/file-ops.js';

let currentFolder = null;
let activeFilePath = null;

const ICON_FOLDER_OPEN = '▾';
const ICON_FOLDER_CLOSED = '▸';
const ICON_FILE = '📄';

export function initSidebar(setEditorContent, updateTitle) {
  const tree = document.getElementById('file-tree');
  const searchInput = document.getElementById('search-input');

  // Show "Open Folder" prompt initially
  tree.innerHTML = `
    <div class="tree-empty">
      <div style="margin-bottom:8px">No folder open</div>
      <button id="btn-open-folder" style="
        background: var(--bg-elevated);
        border: 1px solid var(--border-subtle);
        color: var(--neon-cyan);
        padding: 6px 14px;
        border-radius: 6px;
        cursor: pointer;
        font-family: var(--font-body);
        font-size: 12px;
      ">Open Folder</button>
    </div>
  `;

  document.getElementById('btn-open-folder')?.addEventListener('click', () => {
    openFolder(setEditorContent, updateTitle);
  });

  // New file button
  document.getElementById('btn-new-file')?.addEventListener('click', async () => {
    if (!currentFolder) return;
    const name = prompt('New file name:', 'untitled.md');
    if (!name) return;
    try {
      const path = currentFolder + '/' + name;
      await invoke('create_file', { path });
      await loadFolder(currentFolder, setEditorContent, updateTitle);
      showToast(`Created ${name}`, 'success');
    } catch (e) {
      showToast(`Failed to create file: ${e}`, 'error');
    }
  });

  // Search filter
  searchInput?.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    const items = tree.querySelectorAll('.tree-item');
    items.forEach(item => {
      const name = item.querySelector('.tree-name')?.textContent.toLowerCase() || '';
      item.style.display = name.includes(query) || !query ? '' : 'none';
    });
  });
}

export async function openFolder(setEditorContent, updateTitle) {
  const path = await open({
    directory: true,
    multiple: false,
  });

  if (!path) return;
  currentFolder = path;
  await loadFolder(path, setEditorContent, updateTitle);
}

async function loadFolder(path, setEditorContent, updateTitle) {
  const tree = document.getElementById('file-tree');
  tree.innerHTML = '';
  try {
    const entries = await invoke('list_directory', { path });
    renderEntries(tree, entries, 0, setEditorContent, updateTitle);
  } catch (e) {
    tree.innerHTML = `<div class="tree-empty">Failed to load folder</div>`;
  }
}

function renderEntries(container, entries, depth, setEditorContent, updateTitle) {
  for (const entry of entries) {
    const item = document.createElement('div');
    item.className = `tree-item ${entry.is_dir ? 'folder' : ''} ${depth > 0 ? `indent-${Math.min(depth, 3)}` : ''}`;
    item.dataset.path = entry.path;

    const icon = document.createElement('span');
    icon.className = 'tree-icon';
    icon.textContent = entry.is_dir ? ICON_FOLDER_CLOSED : ICON_FILE;

    const name = document.createElement('span');
    name.className = 'tree-name';
    name.textContent = entry.name;

    item.appendChild(icon);
    item.appendChild(name);
    container.appendChild(item);

    if (entry.is_dir) {
      const childContainer = document.createElement('div');
      childContainer.className = 'tree-children';
      childContainer.style.display = 'none';
      container.appendChild(childContainer);

      item.addEventListener('click', async (e) => {
        e.stopPropagation();
        const isOpen = childContainer.style.display !== 'none';
        if (isOpen) {
          childContainer.style.display = 'none';
          icon.textContent = ICON_FOLDER_CLOSED;
        } else {
          childContainer.style.display = '';
          icon.textContent = ICON_FOLDER_OPEN;
          if (!childContainer.hasChildNodes()) {
            try {
              const subEntries = await invoke('list_directory', { path: entry.path });
              renderEntries(childContainer, subEntries, depth + 1, setEditorContent, updateTitle);
            } catch (err) {
              /* ignore */
            }
          }
        }
      });
    } else {
      item.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
          const content = await invoke('read_file', { path: entry.path });
          setEditorContent(content);
          setCurrentFilePath(entry.path);
          setHasUnsavedChanges(false);
          updateTitle(entry.name);

          // Update active state
          document.querySelectorAll('.tree-item').forEach(i => i.classList.remove('active'));
          item.classList.add('active');
          activeFilePath = entry.path;
        } catch (err) {
          showToast(`Failed to open: ${err}`, 'error');
        }
      });
    }
  }
}
