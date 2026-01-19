# Project Name
Musophobia

# Project Goal
I want to create an edge browser extension that will mirror the vimium c extension. This extension is blocked on my work machine and I want to use this functionality in a safe, secure way. 

## Requirements
I would like to implement the features in the following order of priority:
- [ ] navigating the page; smooth scrolling, top and bottom of page, half page scrolls, left/right scrolls
- [ ] help menu popup for users to see shortcuts
- [ ] enable the click button on screen using f functionality
- [ ] url based functionality; reload page, copy url, open clipboard url in a current/new tab
- [ ] navigating and using tabs; new tab, close/restore tab, duplicate tab, left/right tab, go to first/last tab 
- [ ] enable history shortcuts; back and forward
- [ ] musophobia search bar; search open tabs, open url current/new tab

## Current Slice
**What:** half page scrolls (d/u keys)
**Why:** allows faster navigation through long pages
**Done when:** user can press d to scroll down half a viewport, u to scroll up half a viewport

## Next Steps (Ordered)
1. half page scrolls (d/u)
2. top and bottom of page shortcut (gg/G)
3. left and right scrolls (h/l)

## Completed
- [x] smooth scrolling with j/k (see `docs/SMOOTH_SCROLLING.md` for implementation details)

## Learning Notes
- will need to run on every keypress then filter through the used keypress letters
- smooth scrolling required keydown/keyup state tracking to avoid OS key repeat delay (~500ms)