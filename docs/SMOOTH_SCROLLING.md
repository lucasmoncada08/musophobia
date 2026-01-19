# How Smooth Scrolling Works

This document explains the smooth scrolling implementation and why it's more complex than a simple approach.

## The Naive Approach (What Didn't Work)

The simplest approach to smooth scrolling would be:

```ts
// On each keydown event, scroll by a fixed amount with CSS smooth behavior
window.scrollBy({ top: 60, behavior: 'smooth' })
```

**Problems:**
1. **Animations queue up** - rapid keypresses stack multiple animations, causing erratic behavior
2. **No control over timing** - browser controls the animation, inconsistent feel

The next attempt was using `requestAnimationFrame` with linear interpolation (lerp):

```ts
// On keydown, add to target
target += 60;

// Each frame, lerp toward target
function tick(lerpFactor) {
  currentPosition = currentPosition + (target - currentPosition) * lerpFactor;
  window.scrollTo(0, currentPosition);
}
```

**This works for tapping**, but has a critical problem with **holding keys**.

## The OS Key Repeat Problem

When you hold a key, the operating system doesn't immediately send repeated `keydown` events. There's a delay:

```
keydown → [~500ms delay] → keydown(repeat) → keydown(repeat) → ... → keyup
```

This means if you just listen to `keydown` events:
- First press: immediate response
- Holding: **~500ms of nothing**, then sudden burst of events

This creates a "stuck" feeling when transitioning from tap to hold.

## The Solution: Track Key State

Instead of relying on `keydown` events to drive scrolling, we track whether the key is currently held:

```ts
// src/smoothScroll.ts:32-44
keyDown(key: string): void {
  const direction = key === 'j' ? 1 : key === 'k' ? -1 : 0;
  if (direction === 0) return;

  this.initialize();

  // If changing direction or starting fresh, give initial nudge
  if (this.heldDirection !== direction) {
    this.target += direction * this.config.tapAmount;
  }

  this.heldDirection = direction;  // Mark as held
}

// src/smoothScroll.ts:46-54
keyUp(key: string): void {
  // ...
  if (this.heldDirection === direction) {
    this.heldDirection = 0;  // Mark as released
  }
}
```

Now the animation loop checks `heldDirection` every frame:

```ts
// src/smoothScroll.ts:57-71
update(deltaMs: number): void {
  // While key is held, continuously add to target
  if (this.heldDirection !== 0) {
    const deltaSeconds = deltaMs / 1000;
    this.target += this.heldDirection * this.config.holdVelocity * deltaSeconds;
  }

  // Interpolate toward target
  this.currentPosition =
    this.currentPosition + (this.target - this.currentPosition) * this.config.lerpFactor;

  this.config.scrollTo(this.currentPosition);
}
```

## How It All Fits Together

### The Two Key Concepts

1. **Target** - where we want to scroll to (absolute pixel position)
2. **Current Position** - where we are right now (animated toward target)

### Single Tap Flow

```
1. keydown('j')
   → heldDirection = 1
   → target += 50 (tapAmount)

2. Animation loop runs
   → currentPosition lerps toward target
   → scrollTo(currentPosition)

3. keyup('j') (happens quickly)
   → heldDirection = 0

4. Animation continues
   → currentPosition keeps lerping toward target
   → Eventually converges, animation stops
```

### Hold Flow

```
1. keydown('j')
   → heldDirection = 1
   → target += 50 (initial nudge)

2. Animation loop runs (every ~16ms)
   → target += 800 * 0.016 = 12.8px (velocity * deltaTime)
   → currentPosition lerps toward target
   → scrollTo(currentPosition)

3. Loop continues while held
   → target keeps increasing
   → currentPosition chases it
   → Smooth continuous scroll!

4. keyup('j')
   → heldDirection = 0
   → target stops increasing

5. Animation continues
   → currentPosition catches up to final target
   → Smooth deceleration to stop
```

## The Animation Loop

The animation loop in `content.ts` manages timing:

```ts
// src/content.ts:20-32
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
```

Key points:
- `requestAnimationFrame` provides the current timestamp
- We calculate `deltaMs` (time since last frame) for frame-rate independent animation
- Loop continues while key is held OR while still animating toward target
- Stops when both conditions are false (saves CPU)

## Tuning Parameters

```ts
const TAP_AMOUNT = 50;         // px per tap - the "nudge" distance
const HOLD_VELOCITY = 800;     // px/second - continuous scroll speed
const LERP_FACTOR = 0.2;       // 0-1, higher = snappier, lower = smoother
```

### Lerp Factor Explained

Each frame: `position = position + (target - position) * lerpFactor`

- With `lerpFactor = 0.2`, we move 20% of the remaining distance each frame
- This creates an "ease-out" effect - fast start, gradual slow-down
- Higher values (0.3-0.5) feel snappier but choppier
- Lower values (0.1-0.15) feel smoother but laggy

## Summary

The complexity comes from two requirements that conflict:

1. **Taps should feel responsive** - immediate feedback on keypress
2. **Holds should scroll continuously** - no waiting for OS key repeat

The solution is to:
- Track key state (`keydown`/`keyup`) instead of relying on OS repeat events
- Use a velocity-based system for holding (add to target each frame)
- Use lerp for smooth animation (currentPosition chases target)
- Give an initial "nudge" on keydown for responsive taps
