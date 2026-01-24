import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { KeySequenceDetector } from '../src/keySequence';

describe('KeySequenceDetector', () => {
  let detector: KeySequenceDetector;

  beforeEach(() => {
    vi.useFakeTimers();
    detector = new KeySequenceDetector({ timeout: 500 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('sequence detection', () => {
    it('triggers callback when sequence is completed', () => {
      const callback = vi.fn();
      detector.register('gg', callback);

      detector.handleKey('g');
      expect(callback).not.toHaveBeenCalled();

      detector.handleKey('g');
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('handles single character sequences', () => {
      const callback = vi.fn();
      detector.register('G', callback);

      detector.handleKey('G');
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('handles longer sequences', () => {
      const callback = vi.fn();
      detector.register('abc', callback);

      detector.handleKey('a');
      detector.handleKey('b');
      expect(callback).not.toHaveBeenCalled();

      detector.handleKey('c');
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('timeout behavior', () => {
    it('resets buffer after timeout', () => {
      const callback = vi.fn();
      detector.register('gg', callback);

      detector.handleKey('g');
      vi.advanceTimersByTime(600); // Past timeout
      detector.handleKey('g');

      expect(callback).not.toHaveBeenCalled();
    });

    it('completes sequence within timeout', () => {
      const callback = vi.fn();
      detector.register('gg', callback);

      detector.handleKey('g');
      vi.advanceTimersByTime(400); // Within timeout
      detector.handleKey('g');

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('return values', () => {
    it('returns true when key is part of a sequence prefix', () => {
      detector.register('gg', vi.fn());

      expect(detector.handleKey('g')).toBe(true);
    });

    it('returns true when sequence is completed', () => {
      detector.register('gg', vi.fn());

      detector.handleKey('g');
      expect(detector.handleKey('g')).toBe(true);
    });

    it('returns false when key is not part of any sequence', () => {
      detector.register('gg', vi.fn());

      expect(detector.handleKey('x')).toBe(false);
    });

    it('returns false after non-matching key clears buffer', () => {
      detector.register('gg', vi.fn());

      detector.handleKey('g');
      expect(detector.handleKey('x')).toBe(false);
    });
  });

  describe('multiple sequences', () => {
    it('handles multiple different sequences', () => {
      const ggCallback = vi.fn();
      const gtCallback = vi.fn();
      detector.register('gg', ggCallback);
      detector.register('gt', gtCallback);

      detector.handleKey('g');
      detector.handleKey('t');

      expect(gtCallback).toHaveBeenCalledTimes(1);
      expect(ggCallback).not.toHaveBeenCalled();
    });

    it('distinguishes between sequences with same prefix', () => {
      const ggCallback = vi.fn();
      const gtCallback = vi.fn();
      detector.register('gg', ggCallback);
      detector.register('gt', gtCallback);

      detector.handleKey('g');
      detector.handleKey('g');

      expect(ggCallback).toHaveBeenCalledTimes(1);
      expect(gtCallback).not.toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('clears the buffer when reset is called', () => {
      const callback = vi.fn();
      detector.register('gg', callback);

      detector.handleKey('g');
      detector.reset();
      detector.handleKey('g');

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('getSequences', () => {
    it('returns all registered sequences', () => {
      detector.register('gg', vi.fn());
      detector.register('gt', vi.fn());
      detector.register('G', vi.fn());

      const sequences = detector.getSequences();

      expect(sequences).toContain('gg');
      expect(sequences).toContain('gt');
      expect(sequences).toContain('G');
      expect(sequences).toHaveLength(3);
    });
  });
});
