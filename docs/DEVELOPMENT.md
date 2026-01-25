# Project Name
Musophobia

# Project Goal
I want to create an edge browser extension that will mirror the vimium c extension. This extension is blocked on my work machine and I want to use this functionality in a safe, secure way. 

## Requirements
I would like to implement the features in the following order of priority:
- [x] navigating the page; smooth scrolling, top and bottom of page, half page scrolls, left/right scrolls
- [x] help menu popup for users to see shortcuts
- [x] enable the click button on screen using f functionality
- [ ] url based functionality; reload page, copy url, open clipboard url in a current/new tab
- [ ] navigating and using tabs; new tab, close/restore tab, duplicate tab, left/right tab, go to first/last tab 
- [ ] enable history shortcuts; back and forward
- [ ] musophobia search bar; search open tabs, open url current/new tab

## Current Slice
**What:** url based functionality
**Why:** allows users to interact with urls using keyboard
**Done when:** user can reload page, copy url, open clipboard url in current/new tab

## Next Steps (Ordered)
1. url based functionality; reload page, copy url, open clipboard url in a current/new tab

## Completed
- Help menu popup (press ? to show/hide, Escape or click outside to dismiss)
- Link hints (press f for current tab, F for new tab, type hint chars to click)


## Learning Notes
- will need to run on every keypress then filter through the used keypress letters
- smooth scrolling required keydown/keyup state tracking to avoid OS key repeat delay (~500ms)

### Design Patterns Used
- **Command Pattern**: `KeyHandler` uses a command map to decouple key bindings from actions
- **Observer Pattern**: `AnimationLoop` registers callbacks that are notified each frame
- **Strategy Pattern**: Different scroll behaviors (vertical/horizontal) share the same `SmoothScroller` interface
- **Facade Pattern**: `content.ts` provides a simple entry point that wires together complex subsystems