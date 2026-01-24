# Project Name
Musophobia

# Project Goal
I want to create an edge browser extension that will mirror the vimium c extension. This extension is blocked on my work machine and I want to use this functionality in a safe, secure way. 

## Requirements
I would like to implement the features in the following order of priority:
- [x] navigating the page; smooth scrolling, top and bottom of page, half page scrolls, left/right scrolls
- [ ] help menu popup for users to see shortcuts
- [ ] enable the click button on screen using f functionality
- [ ] url based functionality; reload page, copy url, open clipboard url in a current/new tab
- [ ] navigating and using tabs; new tab, close/restore tab, duplicate tab, left/right tab, go to first/last tab 
- [ ] enable history shortcuts; back and forward
- [ ] musophobia search bar; search open tabs, open url current/new tab

## Current Slice
**What:** help menu popup
**Why:** allows users to see available shortcuts
**Done when:** user can see a popup with all available keyboard shortcuts

## Next Steps (Ordered)
1. help menu popup for users to see shortcuts

## Completed
- [x] smooth scrolling with j/k (see `docs/SMOOTH_SCROLLING.md` for implementation details)
- [x] half page scrolls with d/u
- [x] top/bottom of page with gg/G
- [x] horizontal scrolling with h/l
- [x] architecture refactor for modularity

## Architecture

### File Structure
```
src/
  content.ts        # Entry point - wiring only (~50 lines)
  smoothScroll.ts   # Scroll animation engine
  animationLoop.ts  # RAF lifecycle management
  keySequence.ts    # Multi-key sequence detection (gg, etc.)
  keyHandler.ts     # Command routing + hold key handling
  isInputElement.ts # Input field detection utility
```

### Key Classes

**AnimationLoop** - Manages requestAnimationFrame lifecycle
- Register callbacks that return true while active
- Automatically stops when all callbacks return false

**KeySequenceDetector** - Handles multi-key sequences (e.g., `gg`)
- Timeout-based buffer (500ms default)
- Returns true if key was consumed by sequence

**KeyHandler** - Routes keyboard events to actions
- Single-key commands (G, d, u) via command map
- Sequences (gg) via KeySequenceDetector
- Hold keys (j, k, h, l) with keydown/keyup tracking
- `getAvailableCommands()` for help menu integration

### Adding New Commands

**Single key command** (like `r` for reload):
```typescript
// In keyHandler.ts registerCommands()
this.commands.set('r', () => {
  window.location.reload();
});
```

**Multi-key sequence** (like `gt` for next tab):
```typescript
// In keyHandler.ts registerSequences()
this.sequenceDetector.register('gt', () => {
  // tab switching logic
});
```

**Hold key** (like `J` for faster scroll):
1. Add to `HOLD_KEYS` set
2. Handle in `handleHoldKeyDown`/`handleHoldKeyUp`

## Learning Notes
- will need to run on every keypress then filter through the used keypress letters
- smooth scrolling required keydown/keyup state tracking to avoid OS key repeat delay (~500ms)