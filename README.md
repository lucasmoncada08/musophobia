# Musophobia

A Vim-style keyboard navigation extension for Microsoft Edge. Built as an alternative to Vimium C for environments where that extension is blocked, therefore enabling a safe way to use this functionality.

> **Status:** Early prototype - core scrolling and help menu implemented, more features in progress.

## Features

See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for current progress and next steps.

## Installation (Development Mode)

### Prerequisites
- Node.js
- npm

### Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd musophobia
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```
   Or for development with auto-rebuild on changes:
   ```bash
   npm run dev
   ```

### Load in Edge

1. Open Edge and navigate to `edge://extensions/`
2. Enable **Developer mode** (toggle in the bottom-left)
3. Click **Load unpacked**
4. Select the `dist/` folder from this project
5. The extension is now active on all pages

To reload after changes: click the refresh icon on the extension card in `edge://extensions/`.

## Usage

Navigate to any webpage and use vim-style keys. 

Commands are disabled when typing in input fields, textareas, or contenteditable elements.

For the full command reference, see [docs/COMMANDS.md](docs/COMMANDS.md).

## Development

### Scripts

```bash
npm run build    # Production build
npm run dev      # Development build with watch mode
npm test         # Run tests
```

### Before Building

Always run these checks before building:
```bash
npx tsc --noEmit  # Type check
npm test          # Run tests
```

### Project Structure

```
src/               # Source code
tests/             # Test files (mirrors src/ structure)
dist/              # Build output (load this in Edge)
docs/              # Documentation
```

## Documentation

- [DEVELOPMENT.md](docs/DEVELOPMENT.md) - Current slice, requirements, and next steps
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - System design and component relationships
- [COMMANDS.md](docs/COMMANDS.md) - Keyboard shortcuts reference
- [SMOOTH_SCROLLING.md](docs/SMOOTH_SCROLLING.md) - Scrolling implementation details

## Tech Stack

- TypeScript
- Webpack
- Vitest
- Manifest V3

## License

ISC
