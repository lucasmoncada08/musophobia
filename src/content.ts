import { SmoothScroller } from './smoothScroll';
import { isInputElement } from './isInputElement';

// Tuning constants
const TAP_AMOUNT = 50;         // px per tap
const HOLD_VELOCITY = 800;     // px per second while holding
const LERP_FACTOR = 0.2;       // interpolation factor (higher = snappier)

const scroller = new SmoothScroller({
  scrollTo: (y) => window.scrollTo(0, y),
  getScrollY: () => window.scrollY,
  tapAmount: TAP_AMOUNT,
  holdVelocity: HOLD_VELOCITY,
  lerpFactor: LERP_FACTOR,
});

let animating = false;
let lastTime = 0;

function animate(currentTime: number) {
  const deltaMs = lastTime ? currentTime - lastTime : 16;
  lastTime = currentTime;

  scroller.update(deltaMs);

  // Continue if still holding or still animating toward target
  if (scroller.isHolding() || scroller.isAnimating()) {
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

  // Half page scroll (d/u)
  if (e.key === 'd' || e.key === 'u') {
    const direction = e.key === 'd' ? 1 : -1;
    scroller.scrollBy(direction * window.innerHeight / 2);
    startAnimating();
    return;
  }

  // Line scroll (j/k)
  if (e.key === 'j' || e.key === 'k') {
    scroller.keyDown(e.key);
    startAnimating();
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key !== 'j' && e.key !== 'k') return;

  scroller.keyUp(e.key);
});
