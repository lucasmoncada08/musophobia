import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { SmoothScroller } from '../src/smoothScroll';

describe('SmoothScroller', () => {
  let scroller: SmoothScroller;
  let mockScrollTo: Mock<(y: number) => void>;

  const TAP_AMOUNT = 100;
  const HOLD_VELOCITY = 800;
  const LERP_FACTOR = 0.2;

  beforeEach(() => {
    mockScrollTo = vi.fn<(y: number) => void>();
    scroller = new SmoothScroller({
      scrollTo: mockScrollTo,
      getScroll: () => 0,
      tapAmount: TAP_AMOUNT,
      holdVelocity: HOLD_VELOCITY,
      lerpFactor: LERP_FACTOR,
    });
  });

  describe('single tap (keyDown + immediate keyUp)', () => {
    it('sets target to tap amount when j is pressed', () => {
      scroller.keyDown('j');
      expect(scroller.getTarget()).toBe(TAP_AMOUNT);
    });

    it('sets target to negative tap amount when k is pressed', () => {
      scroller.keyDown('k');
      expect(scroller.getTarget()).toBe(-TAP_AMOUNT);
    });

    it('ignores non-scroll keys', () => {
      scroller.keyDown('a');
      expect(scroller.getTarget()).toBe(0);
    });

    it('stops holding when key is released', () => {
      scroller.keyDown('j');
      expect(scroller.isHolding()).toBe(true);

      scroller.keyUp('j');
      expect(scroller.isHolding()).toBe(false);
    });
  });

  describe('multiple rapid taps', () => {
    it('accumulates target for multiple j taps', () => {
      scroller.keyDown('j');
      scroller.keyUp('j');
      scroller.keyDown('j');
      scroller.keyUp('j');
      scroller.keyDown('j');
      scroller.keyUp('j');
      expect(scroller.getTarget()).toBe(TAP_AMOUNT * 3);
    });

    it('handles direction changes correctly', () => {
      scroller.keyDown('j');
      scroller.keyUp('j');
      scroller.keyDown('j');
      scroller.keyUp('j');
      scroller.keyDown('k');
      scroller.keyUp('k');
      expect(scroller.getTarget()).toBe(TAP_AMOUNT); // 100 + 100 - 100
    });
  });

  describe('holding key (continuous scroll)', () => {
    it('adds velocity-based scroll while key is held', () => {
      scroller.keyDown('j');

      // Simulate 100ms of holding
      scroller.update(100);

      // Initial tap + 100ms of velocity: 100 + (800 * 0.1) = 180
      expect(scroller.getTarget()).toBe(TAP_AMOUNT + HOLD_VELOCITY * 0.1);
    });

    it('stops adding to target after keyUp', () => {
      scroller.keyDown('j');
      scroller.update(100); // 100ms held

      const targetBeforeRelease = scroller.getTarget();

      scroller.keyUp('j');
      scroller.update(100); // another 100ms, but not held

      expect(scroller.getTarget()).toBe(targetBeforeRelease);
    });

    it('continues scrolling while key is held', () => {
      scroller.keyDown('j');

      scroller.update(100);
      const target1 = scroller.getTarget();

      scroller.update(100);
      const target2 = scroller.getTarget();

      expect(target2).toBeGreaterThan(target1);
    });
  });

  describe('animation (interpolation)', () => {
    it('interpolates toward target each update', () => {
      scroller.keyDown('j');
      scroller.keyUp('j');

      // Target is 100, position starts at 0
      // After update: position = 0 + (100 - 0) * 0.2 = 20
      scroller.update(16);

      expect(mockScrollTo).toHaveBeenCalled();
      const scrolledTo = mockScrollTo.mock.calls[0][0];
      expect(scrolledTo).toBeCloseTo(TAP_AMOUNT * LERP_FACTOR, 1);
    });

    it('reports animating while position differs from target', () => {
      scroller.keyDown('j');
      scroller.keyUp('j');

      expect(scroller.isAnimating()).toBe(true);
    });

    it('reports not animating when position reaches target', () => {
      scroller.keyDown('j');
      scroller.keyUp('j');

      // Run many updates to converge
      for (let i = 0; i < 100; i++) {
        scroller.update(16);
      }

      expect(scroller.isAnimating()).toBe(false);
    });
  });

  describe('scrollBy (half page scrolls)', () => {
    it('adds positive amount to target when scrolling down', () => {
      scroller.scrollBy(500);
      expect(scroller.getTarget()).toBe(500);
    });

    it('adds negative amount to target when scrolling up', () => {
      scroller.scrollBy(-500);
      expect(scroller.getTarget()).toBe(-500);
    });

    it('accumulates multiple scrollBy calls', () => {
      scroller.scrollBy(300);
      scroller.scrollBy(300);
      scroller.scrollBy(-100);
      expect(scroller.getTarget()).toBe(500);
    });

    it('uses smooth animation after scrollBy', () => {
      scroller.scrollBy(100);

      // Should animate toward target
      expect(scroller.isAnimating()).toBe(true);

      scroller.update(16);
      expect(mockScrollTo).toHaveBeenCalled();
      const scrolledTo = mockScrollTo.mock.calls[0][0];
      expect(scrolledTo).toBeCloseTo(100 * LERP_FACTOR, 1);
    });

    it('works with existing scroll position', () => {
      const scrollingScroller = new SmoothScroller({
        scrollTo: mockScrollTo,
        getScroll: () => 1000,
        tapAmount: TAP_AMOUNT,
        holdVelocity: HOLD_VELOCITY,
        lerpFactor: LERP_FACTOR,
      });

      scrollingScroller.scrollBy(500);
      expect(scrollingScroller.getTarget()).toBe(1500);
    });
  });

  describe('scrollTo (absolute position)', () => {
    it('sets target to absolute position', () => {
      scroller.scrollTo(1000);
      expect(scroller.getTarget()).toBe(1000);
    });

    it('sets target to zero for top of page', () => {
      // Simulate being scrolled down first
      scroller.scrollBy(500);
      expect(scroller.getTarget()).toBe(500);

      scroller.scrollTo(0);
      expect(scroller.getTarget()).toBe(0);
    });

    it('uses smooth animation after scrollTo', () => {
      scroller.scrollTo(100);

      expect(scroller.isAnimating()).toBe(true);

      scroller.update(16);
      expect(mockScrollTo).toHaveBeenCalled();
    });

    it('works when already scrolled', () => {
      const scrollingScroller = new SmoothScroller({
        scrollTo: mockScrollTo,
        getScroll: () => 500,
        tapAmount: TAP_AMOUNT,
        holdVelocity: HOLD_VELOCITY,
        lerpFactor: LERP_FACTOR,
      });

      scrollingScroller.scrollTo(0);
      expect(scrollingScroller.getTarget()).toBe(0);
    });
  });

  describe('relative to page scroll position', () => {
    it('initializes from current scroll position', () => {
      const scrollingScroller = new SmoothScroller({
        scrollTo: mockScrollTo,
        getScroll: () => 500,
        tapAmount: TAP_AMOUNT,
        holdVelocity: HOLD_VELOCITY,
        lerpFactor: LERP_FACTOR,
      });

      scrollingScroller.keyDown('j');
      scrollingScroller.keyUp('j');

      // Target should be 500 + 100 = 600
      expect(scrollingScroller.getTarget()).toBe(600);

      // Run updates to converge
      for (let i = 0; i < 100; i++) {
        scrollingScroller.update(16);
      }

      // Should have scrolled to near 600
      const lastCall = mockScrollTo.mock.calls[mockScrollTo.mock.calls.length - 1];
      expect(lastCall[0]).toBeCloseTo(600, 0);
    });
  });
});
