# Musophobia Architecture

## Overview

Vimium-like Edge browser extension for vim-style keyboard navigation.

## Manifest V3 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    BROWSER EXTENSION                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐      ┌──────────────────┐            │
│  │  Background       │      │  Content Script   │            │
│  │  (Service Worker) │◄────►│  (Runs in pages)  │            │
│  │                   │      │                   │            │
│  │  - Tab management │      │  - DOM access     │            │
│  │  - Browser APIs   │      │  - Key handling   │            │
│  │  - Cross-tab      │      │  - UI overlays    │            │
│  │    messaging      │      │                   │            │
│  └──────────────────┘      └──────────────────┘            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Content Script**: Injected into every webpage. Has DOM access but limited browser APIs. Handles scrolling, hints, and overlays.

**Background Script (Service Worker)**: Runs independently of webpages. Has browser API access (tabs, storage) but no DOM access. Used for tab management.

## Project Structure

```
src/
├── content.ts          # Entry point - wiring only (~50 lines)
├── smoothScroll.ts     # Scroll animation engine
├── animationLoop.ts    # RAF lifecycle management
├── keySequence.ts      # Multi-key sequence detection (gg, etc.)
├── keyHandler.ts       # Command routing + hold key handling
├── isInputElement.ts   # Input field detection utility
tests/
├── *.test.ts           # Tests mirror src/ structure
```

## Content Script Architecture

The content script is composed of small, focused modules with clear responsibilities:

```
                    ┌─────────────────┐
                    │   content.ts    │  Entry point
                    │   (wiring)      │  Creates instances & connects them
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  AnimationLoop  │ │   KeyHandler    │ │  SmoothScroller │
│                 │ │                 │ │  (x2: v & h)    │
│ RAF lifecycle   │ │ Event routing   │ │ Physics engine  │
└─────────────────┘ └────────┬────────┘ └─────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │KeySequenceDetector│
                    │ Multi-key (gg)  │
                    └─────────────────┘
```

### Module Responsibilities

| Module | Responsibility | Knows About |
|--------|----------------|-------------|
| `content.ts` | Wiring & configuration | All modules (creates them) |
| `AnimationLoop` | RAF start/stop lifecycle | Nothing (pure utility) |
| `SmoothScroller` | Physics-based scrolling | Nothing (pure utility) |
| `KeySequenceDetector` | Multi-key sequence matching | Nothing (pure utility) |
| `KeyHandler` | Route keys → actions | Scrollers, AnimationLoop, Sequences |

### Why This Structure?

**Single Responsibility**: Each module does one thing. `AnimationLoop` doesn't know about scrolling. `SmoothScroller` doesn't know about keyboard input.

**Testability**: Pure utility classes (`AnimationLoop`, `KeySequenceDetector`) are trivially testable with no mocking. `KeyHandler` can be tested with mock scrollers.

**Extensibility**: Adding new commands is localized:
- Single-key: Add to `commands` map in `KeyHandler`
- Multi-key: Register with `KeySequenceDetector`
- New animation: Register callback with `AnimationLoop`

**Thin Entry Point**: `content.ts` is wiring-only (~50 lines). All logic lives in testable modules.

## Key Decisions

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-01 | Manifest V3 | Required for Edge, future-proof |
| 2025-01 | TypeScript + Vitest | Type safety, fast testing |
| 2025-01 | Minimal slices approach | Avoid premature abstraction |
| 2025-01 | Content script modularization | See below |

### Content Script Modularization (Jan 2025)

**Problem**: `content.ts` had grown to ~120 lines mixing multiple concerns:
- Animation loop management (RAF start/stop)
- Key sequence tracking (`gg` detection)
- Command routing (which key does what)
- Hold key state management
- Scroller configuration

This made it difficult to:
- Test individual behaviors in isolation
- Add new commands without understanding all the code
- Reason about what happens when a key is pressed

**Solution**: Extract focused modules with clear interfaces:

1. **AnimationLoop** - Generic RAF lifecycle. Knows nothing about scrolling.
2. **KeySequenceDetector** - Buffer-based multi-key detection. Knows nothing about what sequences mean.
3. **KeyHandler** - Routes keyboard events to actions. Single place for all key bindings.
4. **content.ts** - Pure wiring. Creates objects and connects them.

**Result**:
- `content.ts` reduced from ~120 to ~50 lines
- Each module testable in isolation
- Adding commands is now a one-liner in the appropriate method
- Clear extension points for future features (help menu can call `getAvailableCommands()`)

## Communication Patterns

Content script ↔ Background script messaging:
```
Content Script                    Background Script
     │                                   │
     │──── message (e.g. "getTabs") ────►│
     │                                   │
     │◄─── response ────────────────────│
```

## Permissions

- `tabs` - Query and manage browser tabs
- `activeTab` - Access the currently active tab
- `storage` - Save user preferences (future)
