import { SmoothScroller } from './smoothScroll';
import { AnimationLoop } from './animationLoop';
import { KeyHandler } from './keyHandler';
import { HelpMenu } from './helpMenu';
import { LinkHints } from './linkHints';
import { COMMAND_DEFINITIONS } from './commandDefinitions';

// Tuning constants
const TAP_AMOUNT = 50;
const HOLD_VELOCITY = 800;
const LERP_FACTOR = 0.2;

// Create scrollers
const verticalScroller = new SmoothScroller({
  scrollTo: (y) => window.scrollTo(window.scrollX, y),
  getScroll: () => window.scrollY,
  tapAmount: TAP_AMOUNT,
  holdVelocity: HOLD_VELOCITY,
  lerpFactor: LERP_FACTOR,
});

const horizontalScroller = new SmoothScroller({
  scrollTo: (x) => window.scrollTo(x, window.scrollY),
  getScroll: () => window.scrollX,
  tapAmount: TAP_AMOUNT,
  holdVelocity: HOLD_VELOCITY,
  lerpFactor: LERP_FACTOR,
});

// Create animation loop
const animationLoop = new AnimationLoop();
animationLoop.register((deltaMs) => {
  verticalScroller.update(deltaMs);
  horizontalScroller.update(deltaMs);
  return (
    verticalScroller.isHolding() ||
    verticalScroller.isAnimating() ||
    horizontalScroller.isHolding() ||
    horizontalScroller.isAnimating()
  );
});

// Create help menu
const helpMenu = new HelpMenu(COMMAND_DEFINITIONS);

// Create link hints
const linkHints = new LinkHints();

// Create key handler
const keyHandler = new KeyHandler({
  verticalScroller,
  horizontalScroller,
  animationLoop,
  linkHints,
  onHelpToggle: () => helpMenu.toggle(),
  isHelpVisible: () => helpMenu.isVisible(),
});

// Attach event listeners
document.addEventListener('keydown', (e) => keyHandler.handleKeyDown(e));
document.addEventListener('keyup', (e) => keyHandler.handleKeyUp(e));
