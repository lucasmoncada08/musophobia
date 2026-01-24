# Musophobia Development Guidelines

## Current Development
See `docs/DEVELOPMENT.md` for:
- Current slice and requirements
- Next steps (ordered)
- Open questions and decisions

Check this file before starting work and update it as tasks are completed.

## Development Philosophy

### Minimal Slices
- Work in the smallest possible increments that deliver value
- Only introduce types, abstractions, and utilities when they are actually used
- Avoid upfront design - let the code structure emerge from requirements
- Complexity should correspond directly to the current requirement, nothing more

### Test-Driven Development (TDD)
- Write tests before implementation
- Red → Green → Refactor cycle
- Use spikes to discover interfaces before writing tests
- Once interfaces are understood, mock them properly in tests

## Testing
- Framework: Vitest
- Spike first to understand browser APIs and extension interfaces
- Then write tests with proper mocks

## Before Building
Always run these checks before `npm run build`:
1. `npx tsc --noEmit` - Type check all files
2. `npm test` - Run all tests

Do not proceed with build if either fails.

## Project Structure
```
src/           # Source code only
tests/         # All test files (mirrors src/ structure)
```
- Tests live in `tests/` folder, separate from source
- Test files mirror the src structure (e.g., `src/scroll.ts` → `tests/scroll.test.ts`)

## Project
- Edge browser extension (Manifest V3)
- Vim-style keyboard navigation

## Repository Reference

### Key Documentation
- `docs/DEVELOPMENT.md` - Current slice, requirements, next steps, learning notes
- `docs/ARCHITECTURE.md` - System design and component relationships
- `docs/SMOOTH_SCROLLING.md` - Implementation details for smooth scrolling
- `docs/COMMANDS.md` - Available keyboard shortcuts reference

### Source Files (`src/`)
- `content.ts` - Entry point, wires together subsystems (Facade pattern)
- `keyHandler.ts` - Key bindings and command dispatch (Command pattern)
- `keySequence.ts` - Multi-key sequence handling (e.g., `gg`)
- `smoothScroll.ts` - Smooth scrolling implementation (Strategy pattern)
- `animationLoop.ts` - Frame-based animation callbacks (Observer pattern)
- `isInputElement.ts` - Utility to detect input focus
- `commandDefinitions.ts` - Single source of truth for command metadata
- `helpMenu.ts` - Help menu overlay UI

### Test Files (`tests/`)
- Mirror src/ structure (e.g., `src/foo.ts` → `tests/foo.test.ts`)

### Configuration
- `manifest.json` - Extension manifest (Manifest V3)
- `package.json` - Dependencies and scripts (`build`, `dev`, `test`)
- `tsconfig.json` - TypeScript configuration
- `vitest.config.ts` - Test runner configuration
- `webpack.config.js` - Build configuration

### Build Output
- `dist/` - Compiled extension files
