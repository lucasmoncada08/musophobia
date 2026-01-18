import { describe, it, expect } from 'vitest';
import { getScrollAmount } from '../src/scroll';

describe('getScrollAmount', () => {
  it('returns positive amount for j key (scroll down)', () => {
    expect(getScrollAmount('j')).toBe(50);
  });

  it('returns negative amount for k key (scroll up)', () => {
    expect(getScrollAmount('k')).toBe(-50);
  });
});
