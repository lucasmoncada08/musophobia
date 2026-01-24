import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AnimationLoop } from '../src/animationLoop';

describe('AnimationLoop', () => {
  let rafCallbacks: ((time: number) => void)[] = [];
  let time = 0;

  beforeEach(() => {
    rafCallbacks = [];
    time = 0;
    vi.stubGlobal('requestAnimationFrame', vi.fn((cb: (time: number) => void) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function runFrame(deltaMs: number = 16) {
    time += deltaMs;
    const callbacks = [...rafCallbacks];
    rafCallbacks = [];
    callbacks.forEach((cb) => cb(time));
  }

  it('calls registered callback with deltaMs on each frame', () => {
    const loop = new AnimationLoop();
    const callback = vi.fn(() => false);

    loop.register(callback);
    loop.start();

    runFrame(16);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(16);
  });

  it('continues animation while callback returns true', () => {
    const loop = new AnimationLoop();
    let callCount = 0;
    const callback = vi.fn(() => {
      callCount++;
      return callCount < 3;
    });

    loop.register(callback);
    loop.start();

    runFrame(16);
    runFrame(16);
    runFrame(16);

    expect(callback).toHaveBeenCalledTimes(3);
  });

  it('stops animation when callback returns false', () => {
    const loop = new AnimationLoop();
    const callback = vi.fn(() => false);

    loop.register(callback);
    loop.start();

    runFrame(16);
    runFrame(16); // Should not trigger callback again

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('does not start multiple loops when start is called twice', () => {
    const loop = new AnimationLoop();
    const callback = vi.fn(() => true);

    loop.register(callback);
    loop.start();
    loop.start();

    expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
  });

  it('can restart after stopping', () => {
    const loop = new AnimationLoop();
    let shouldContinue = false;
    const callback = vi.fn(() => shouldContinue);

    loop.register(callback);
    loop.start();
    runFrame(16); // Stops because shouldContinue is false

    shouldContinue = true;
    loop.start();
    runFrame(16);

    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('supports multiple callbacks', () => {
    const loop = new AnimationLoop();
    const callback1 = vi.fn(() => false);
    const callback2 = vi.fn(() => false);

    loop.register(callback1);
    loop.register(callback2);
    loop.start();

    runFrame(16);

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  it('continues if any callback returns true', () => {
    const loop = new AnimationLoop();
    const callback1 = vi.fn(() => false);
    const callback2 = vi.fn(() => true);

    loop.register(callback1);
    loop.register(callback2);
    loop.start();

    runFrame(16);
    runFrame(16);

    expect(callback1).toHaveBeenCalledTimes(2);
    expect(callback2).toHaveBeenCalledTimes(2);
  });

  it('uses 16ms default for first frame', () => {
    const loop = new AnimationLoop();
    const callback = vi.fn(() => false);

    loop.register(callback);
    loop.start();

    // First frame with time=0 should use default 16ms
    rafCallbacks[0](0);

    expect(callback).toHaveBeenCalledWith(16);
  });
});
