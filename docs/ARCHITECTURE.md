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
├── content.ts          # Content script entry point
├── scroll.ts           # Scrolling module
tests/
├── scroll.test.ts      # Tests mirror src/ structure
```

Structure will evolve as features are added.

## Key Decisions

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-01 | Manifest V3 | Required for Edge, future-proof |
| 2025-01 | TypeScript + Vitest | Type safety, fast testing |
| 2025-01 | Minimal slices approach | Avoid premature abstraction |

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
