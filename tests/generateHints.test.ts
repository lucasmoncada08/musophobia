import { describe, it, expect } from 'vitest';
import { generateHints } from '../src/generateHints';

describe('generateHints', () => {
  describe('basic generation', () => {
    it('returns empty array for count of 0', () => {
      expect(generateHints(0)).toEqual([]);
    });

    it('generates single-character hints for small counts', () => {
      const hints = generateHints(3);
      expect(hints).toHaveLength(3);
      expect(hints[0]).toBe('s');
      expect(hints[1]).toBe('a');
      expect(hints[2]).toBe('d');
    });

    it('generates hints for count equal to character set size', () => {
      const hints = generateHints(7);
      expect(hints).toHaveLength(7);
      expect(hints).toEqual(['s', 'a', 'd', 'f', 'j', 'k', 'l']);
    });
  });

  describe('multi-character hints', () => {
    it('generates two-character hints when count exceeds character set', () => {
      const hints = generateHints(8);
      expect(hints).toHaveLength(8);
      // Should use two-character hints for all when count > 7
      expect(hints[0]).toBe('ss');
      expect(hints[7]).toBe('as');
    });

    it('generates consistent two-character hints for larger counts', () => {
      const hints = generateHints(49);
      expect(hints).toHaveLength(49);
      // All hints should be unique
      const uniqueHints = new Set(hints);
      expect(uniqueHints.size).toBe(49);
      // All should be two characters
      hints.forEach((hint) => {
        expect(hint.length).toBe(2);
      });
    });
  });

  describe('uniqueness', () => {
    it('all hints are unique for any count', () => {
      for (const count of [1, 5, 7, 10, 30, 49]) {
        const hints = generateHints(count);
        const uniqueHints = new Set(hints);
        expect(uniqueHints.size).toBe(count);
      }
    });
  });

  describe('character set', () => {
    it('only uses home row characters', () => {
      const hints = generateHints(49);
      const allowedChars = new Set(['s', 'a', 'd', 'f', 'j', 'k', 'l']);
      hints.forEach((hint) => {
        for (const char of hint) {
          expect(allowedChars.has(char)).toBe(true);
        }
      });
    });
  });
});
