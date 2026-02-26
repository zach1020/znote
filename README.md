# ZNOTE

A vaporwave-themed rich text editor built with Tauri 2, CodeMirror 6, and Rust.

![Version](https://img.shields.io/badge/version-0.1.0-ff2d95)
![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-00f0ff)
![License](https://img.shields.io/badge/license-MIT-b026ff)

---

![ZNOTE Screenshot](assets/screenshot.png)

---

## What is ZNOTE?

ZNOTE is a lightweight desktop markdown editor with a neon-soaked vaporwave aesthetic. Write, edit, and export markdown files — all wrapped in a cyberpunk UI with deep blacks, neon pinks, and electric cyans.

### Features

- **Markdown editing** powered by CodeMirror 6 with syntax highlighting, line numbers, bracket matching, code folding, and search
- **Minimap** for quick document navigation
- **Formatting toolbar** — bold, italic, headings, lists, links, tables, blockquotes, and more
- **File explorer sidebar** — browse and open files from any folder
- **Multi-format export** — save your work as `.docx`, `.pdf`, or `.txt`
- **Keyboard shortcuts** — Cmd/Ctrl+O, S, Shift+S, N for common file operations
- **Word & character count** in the status bar
- **Unsaved changes tracking** with visual indicator

---

## Tech Stack

| Layer    | Technology                          |
| -------- | ----------------------------------- |
| Frontend | Vite 6, CodeMirror 6, vanilla JS   |
| Backend  | Rust, Tauri 2                       |
| Markdown | pulldown-cmark                      |
| Export   | docx-rs (DOCX), genpdf (PDF)       |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Rust](https://www.rust-lang.org/tools/install)
- [Tauri CLI prerequisites](https://v2.tauri.app/start/prerequisites/) for your OS

### Install

```bash
git clone <repo-url>
cd znote
npm install
```

### Development

```bash
npm run tauri dev
```

This starts the Vite dev server on `localhost:1420` and launches the Tauri window with hot reload.

### Build for Production

```bash
npm run tauri build
```

Outputs a native app bundle for your platform in `src-tauri/target/release/bundle/`.

---

## Project Structure

```
znote/
├── index.html                 # Entry point
├── src/                       # Frontend
│   ├── main.js                # App initialization
│   ├── style.css              # Vaporwave theme
│   ├── editor/                # CodeMirror setup & theme
│   ├── commands/              # File operations (open, save, export)
│   ├── toolbar/               # Formatting toolbar
│   ├── sidebar/               # File explorer
│   └── statusbar/             # Line/col, word count, save status
├── src-tauri/                 # Backend (Rust)
│   ├── src/
│   │   ├── lib.rs             # Tauri command registration
│   │   └── commands/          # file_io, export, folder operations
│   └── tauri.conf.json        # App config (window size, icons, etc.)
├── vite.config.js
└── package.json
```

---

## Keyboard Shortcuts

| Action   | Shortcut       |
| -------- | -------------- |
| New file | Cmd/Ctrl + N   |
| Open     | Cmd/Ctrl + O   |
| Save     | Cmd/Ctrl + S   |
| Save As  | Cmd/Ctrl + Shift + S |

---

## Export Formats

| Format | Description                              |
| ------ | ---------------------------------------- |
| `.txt` | Plain text with markdown stripped         |
| `.docx`| Word document with basic formatting       |
| `.pdf` | PDF using system fonts (Arial / Liberation / DejaVu) |

---

## Theme

ZNOTE uses a custom vaporwave color palette:

- **Neon Pink** `#FF2D95` — primary accent
- **Cyan** `#00F0FF` — secondary accent
- **Purple** `#B026FF` — highlights
- **Lime** `#C4F82A` — success states
- **Deep Void** `#050508` — background

Fonts: Space Grotesk, Manrope, Space Mono
