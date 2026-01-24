import { SmoothScroller } from './smoothScroll';
import { isInputElement } from './isInputElement';

// Tuning constants
const TAP_AMOUNT = 50;         // px per tap
const HOLD_VELOCITY = 800;     // px per second while holding
const LERP_FACTOR = 0.2;       // interpolation factor (higher = snappier)

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

let animating = false;
let lastTime = 0;

// Key sequence tracking for gg
let lastKeyTime = 0;
let lastKey = '';
const SEQUENCE_TIMEOUT = 500; // ms

function animate(currentTime: number) {
  const deltaMs = lastTime ? currentTime - lastTime : 16;
  lastTime = currentTime;

  verticalScroller.update(deltaMs);
  horizontalScroller.update(deltaMs);

  // Continue if either scroller is still holding or animating
  const vActive = verticalScroller.isHolding() || verticalScroller.isAnimating();
  const hActive = horizontalScroller.isHolding() || horizontalScroller.isAnimating();
  if (vActive || hActive) {
    requestAnimationFrame(animate);
  } else {
    animating = false;
    lastTime = 0;
  }
}

function startAnimating() {
  if (!animating) {
    animating = true;
    lastTime = 0;
    requestAnimationFrame(animate);
  }
}

document.addEventListener('keydown', (e) => {
  if (isInputElement(e.target as Element)) return;

  const now = Date.now();

  // Go to bottom (G = shift+g)
  if (e.key === 'G') {
    const bottom = document.documentElement.scrollHeight - window.innerHeight;
    verticalScroller.scrollTo(bottom);
    startAnimating();
    lastKey = '';
    return;
  }

  // Go to top (gg sequence)
  if (e.key === 'g') {
    if (lastKey === 'g' && now - lastKeyTime < SEQUENCE_TIMEOUT) {
      verticalScroller.scrollTo(0);
      startAnimating();
      lastKey = '';
    } else {
      lastKey = 'g';
      lastKeyTime = now;
    }
    return;
  }

  // Half page scroll (d/u)
  if (e.key === 'd' || e.key === 'u') {
    const direction = e.key === 'd' ? 1 : -1;
    verticalScroller.scrollBy(direction * window.innerHeight / 2);
    startAnimating();
    lastKey = '';
    return;
  }

  // Vertical line scroll (j/k)
  if (e.key === 'j' || e.key === 'k') {
    verticalScroller.keyDown(e.key);
    startAnimating();
    lastKey = '';
    return;
  }

  // Horizontal line scroll (h/l)
  if (e.key === 'h' || e.key === 'l') {
    horizontalScroller.keyDown(e.key);
    startAnimating();
    lastKey = '';
  }
});

document.addEventListener('keyup', (e) => {
  // Vertical scroll release (j/k)
  if (e.key === 'j' || e.key === 'k') {
    verticalScroller.keyUp(e.key);
    return;
  }

  // Horizontal scroll release (h/l)
  if (e.key === 'h' || e.key === 'l') {
    horizontalScroller.keyUp(e.key);
  }
});
