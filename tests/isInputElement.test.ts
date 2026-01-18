import { describe, it, expect } from 'vitest';
import { isInputElement } from '../src/isInputElement';

describe('isInputElement', () => {
  it('returns true for input elements', () => {
    const input = document.createElement('input');
    expect(isInputElement(input)).toBe(true);
  });

  it('returns true for textarea elements', () => {
    const textarea = document.createElement('textarea');
    expect(isInputElement(textarea)).toBe(true);
  });

  it('returns false for div elements', () => {
    const div = document.createElement('div');
    expect(isInputElement(div)).toBe(false);
  });

  it('returns true for contentEditable elements', () => {
    const div = document.createElement('div');
    div.contentEditable = 'true';
    expect(isInputElement(div)).toBe(true);
  });
});
