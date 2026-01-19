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
