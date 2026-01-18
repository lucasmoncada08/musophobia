# Musophobia Development Guidelines

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
