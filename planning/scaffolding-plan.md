# Edge Extension Scaffolding Plan - Musophobia

## Overview

We're building a Vimium-like Edge browser extension with these features (in priority order):
1. Vim-style smooth scrolling (j/k, d/u, gg/G)
2. Full link hints on all clickable elements (f key)
3. Single letter commands (r, t)
4. Tab management with popup overlay

---

## Understanding Browser Extensions

A browser extension consists of several key components:

### Manifest V3 Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    BROWSER EXTENSION                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────┐      ┌──────────────────┐        │
│  │  Background       │      │  Content Script   │        │
│  │  (Service Worker) │◄────►│  (Runs in pages)  │        │
│  │                   │      │                   │        │
│  │  - Tab management │      │  - DOM access     │        │
│  │  - Browser APIs   │      │  - Key handling   │        │
│  │  - Cross-tab      │      │  - UI overlays    │        │
│  │    messaging      │      │                   │        │
│  └──────────────────┘      └──────────────────┘        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Content Script**: JavaScript injected into every webpage. Has access to the DOM but limited browser APIs. This is where scrolling, hints, and overlays live.

**Background Script (Service Worker)**: Runs independently of any webpage. Has access to browser APIs (tabs, storage, etc.) but NO DOM access. Used for tab management.

---

## Project Structure

```
src/
├── background/
│   └── background.ts       # Service worker - tab management
├── content/
│   ├── index.ts            # Entry point - initializes everything
│   ├── scroll.ts           # Smooth scrolling module
│   ├── hints.ts            # Link hints (f key)
│   ├── commands.ts         # Single-key commands (r, t)
│   └── overlay.ts          # Search overlay UI
├── styles/
│   └── overlay.css         # Hint/overlay styling
├── types/
│   └── index.ts            # TypeScript type definitions
└── utils/
    └── dom.ts              # DOM helper functions
```

---

## File-by-File Breakdown

### 1. tsconfig.json

**Purpose**: Tells TypeScript how to compile our code.

**Key settings**:
- `target: ES2020` - Modern JavaScript features (all browsers support this)
- `module: ES2020` - Use ES modules (import/export)
- `strict: true` - Catch more bugs at compile time
- `types: ["chrome"]` - Include Chrome extension API types (Edge uses the same APIs)

---

### 2. manifest.json

**Purpose**: The extension's "ID card" - tells the browser what the extension does, what permissions it needs, and what scripts to run.

**Key sections**:
```json
{
  "manifest_version": 3,        // Required for Edge/Chrome
  "name": "Musophobia",
  "permissions": ["tabs", "activeTab", "storage"],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [{
    "matches": ["<all_urls>"],  // Run on all pages
    "js": ["content.js"],
    "css": ["overlay.css"]
  }]
}
```

**Permissions explained**:
- `tabs` - Query and manage browser tabs
- `activeTab` - Access the currently active tab
- `storage` - Save user preferences

---

### 3. src/types/index.ts

**Purpose**: Define TypeScript types shared across modules.

**Contents**:
- `ExtensionMode` - Tracks if we're in normal, hint, or search mode
- `KeyBinding` - Maps keys to actions
- `HintElement` - Represents a hintable DOM element

Types help catch bugs early and make the code self-documenting.

---

### 4. src/utils/dom.ts

**Purpose**: Helper functions for DOM operations.

**Contents**:
- `isVisible(element)` - Check if element is visible on screen
- `isClickable(element)` - Check if element can be clicked
- `getClickableElements()` - Find all hintable elements on page

These utilities are used by multiple modules (hints, overlay).

---

### 5. src/content/scroll.ts

**Purpose**: Implement smooth vim-style scrolling.

**How it works**:
1. Listen for j/k/d/u/g keys
2. Calculate target scroll position
3. Animate scroll with easing function (smooth, not instant)

**Key bindings**:
| Key | Action |
|-----|--------|
| j | Scroll down one line |
| k | Scroll up one line |
| d | Scroll down half page |
| u | Scroll up half page |
| gg | Go to top |
| G | Go to bottom |

**Implementation detail**: Uses `requestAnimationFrame` for smooth 60fps animation.

---

### 6. src/content/commands.ts

**Purpose**: Handle single-key commands.

**Key bindings**:
| Key | Action |
|-----|--------|
| r | Reload current page |
| t | (Future) Open new tab |

**How it works**:
- Maintains a command registry (map of key → function)
- Exports `handleCommand(key)` for the main handler to call

---

### 7. src/content/hints.ts

**Purpose**: Show clickable element hints when pressing 'f'.

**How it works**:
1. User presses 'f'
2. Find all clickable elements (links, buttons, inputs, etc.)
3. Generate short letter combinations (a, b, c... aa, ab...)
4. Display hint labels over each element
5. User types hint letters → we filter/match
6. When match found → click that element

**Initial scaffold**: Will create the structure but full implementation comes in a later phase.

---

### 8. src/content/overlay.ts

**Purpose**: Create the search overlay UI (for tab search, etc.).

**How it works**:
1. Creates a Shadow DOM container (isolated from page styles)
2. Renders a search input and results list
3. Communicates with background script to get tab list

**Why Shadow DOM?** Ensures our styles don't affect the page, and page styles don't break our UI.

---

### 9. src/content/index.ts

**Purpose**: Main entry point - wires everything together.

**Responsibilities**:
1. Initialize all modules (scroll, hints, commands, overlay)
2. Set up global keydown listener
3. Route keypresses to appropriate module based on current mode
4. Manage extension mode (normal vs hint vs search)

**Key routing logic**:
```
if mode == HINT:
    send key to hints.ts
else if mode == SEARCH:
    send key to overlay.ts
else:
    if key == 'f': enter hint mode
    else if key in scroll_keys: scroll.ts
    else: commands.ts
```

---

### 10. src/background/background.ts

**Purpose**: Service worker for browser-level operations.

**Responsibilities**:
- Listen for messages from content scripts
- Query tabs using `chrome.tabs.query()`
- Respond with tab data for the search overlay

**Communication flow**:
```
Content Script                    Background Script
     │                                   │
     │──── "getTabs" message ───────────►│
     │                                   │
     │                           queries chrome.tabs
     │                                   │
     │◄─── tab list response ────────────│
```

---

### 11. src/styles/overlay.css

**Purpose**: Styles for hints and search overlay.

**Contents**:
- `.hint-label` - Yellow boxes with letter hints
- `.search-overlay` - Full-screen search container
- `.search-input` - Text input styling
- `.search-results` - Results list styling

---

### 12. webpack.config.js (modifications)

**Changes needed**:
```javascript
entry: {
  content: './src/content/index.ts',
  background: './src/background/background.ts'
},
plugins: [
  new CopyPlugin({
    patterns: [
      { from: 'manifest.json' },
      { from: 'src/styles', to: 'styles' }
    ]
  })
]
```

This tells webpack to:
1. Build two separate bundles (content.js, background.js)
2. Copy manifest.json and CSS to dist/

---

## Implementation Order

| Step | File | Priority |
|------|------|----------|
| 1 | tsconfig.json | Setup |
| 2 | manifest.json | Setup |
| 3 | src/types/index.ts | Setup |
| 4 | src/utils/dom.ts | Setup |
| 5 | src/content/scroll.ts | Feature 1 |
| 6 | src/content/commands.ts | Setup |
| 7 | src/content/hints.ts | Stub |
| 8 | src/content/overlay.ts | Stub |
| 9 | src/content/index.ts | Core |
| 10 | src/background/background.ts | Core |
| 11 | src/styles/overlay.css | Styling |
| 12 | webpack.config.js | Build |

---

## Verification Steps

1. Run `npm run build` - should compile without errors
2. Open Edge → `edge://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked" → select `dist/` folder
5. Navigate to any webpage
6. Press `j` or `k` - should scroll smoothly
7. Open DevTools console - check for errors

---

## Next Phase (after scaffolding)

1. **Complete smooth scrolling** - polish the animation
2. **Implement full hints** - the 'f' key functionality
3. **Add tab search** - overlay with tab list
4. **Add more commands** - expand the command registry
