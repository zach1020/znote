import { onUpdate, getCursorInfo, getWordCount, getCharCount } from '../editor/editor.js';

export function initStatusbar() {
  const stLine = document.getElementById('st-line');
  const stWords = document.getElementById('st-words');
  const stChars = document.getElementById('st-chars');

  onUpdate((update) => {
    if (update.docChanged || update.selectionSet) {
      const cursor = getCursorInfo();
      stLine.textContent = `Ln ${cursor.line}, Col ${cursor.col}`;
      stWords.textContent = `${getWordCount()} words`;
      stChars.textContent = `${getCharCount().toLocaleString()} chars`;
    }
  });
}
