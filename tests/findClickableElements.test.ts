import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { findClickableElements } from '../src/findClickableElements';

describe('findClickableElements', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    // Mock viewport dimensions
    vi.stubGlobal('innerWidth', 1024);
    vi.stubGlobal('innerHeight', 768);
  });

  afterEach(() => {
    container.remove();
    vi.unstubAllGlobals();
  });

  function mockBoundingRect(element: HTMLElement, rect: Partial<DOMRect>): void {
    vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
      top: 0,
      left: 0,
      bottom: 100,
      right: 100,
      width: 100,
      height: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
      ...rect,
    });
  }

  describe('link detection', () => {
    it('finds anchor elements with href', () => {
      const link = document.createElement('a');
      link.href = 'https://example.com';
      link.textContent = 'Example';
      container.appendChild(link);
      mockBoundingRect(link, { top: 10, left: 10, width: 100, height: 20 });

      const elements = findClickableElements();
      expect(elements).toContain(link);
    });

    it('ignores anchor elements without href', () => {
      const link = document.createElement('a');
      link.textContent = 'No link';
      container.appendChild(link);
      mockBoundingRect(link, { top: 10, left: 10, width: 100, height: 20 });

      const elements = findClickableElements();
      expect(elements).not.toContain(link);
    });
  });

  describe('button detection', () => {
    it('finds button elements', () => {
      const button = document.createElement('button');
      button.textContent = 'Click me';
      container.appendChild(button);
      mockBoundingRect(button, { top: 10, left: 10, width: 100, height: 30 });

      const elements = findClickableElements();
      expect(elements).toContain(button);
    });

    it('finds input type=button', () => {
      const input = document.createElement('input');
      input.type = 'button';
      input.value = 'Button';
      container.appendChild(input);
      mockBoundingRect(input, { top: 10, left: 10, width: 100, height: 30 });

      const elements = findClickableElements();
      expect(elements).toContain(input);
    });

    it('finds input type=submit', () => {
      const input = document.createElement('input');
      input.type = 'submit';
      container.appendChild(input);
      mockBoundingRect(input, { top: 10, left: 10, width: 100, height: 30 });

      const elements = findClickableElements();
      expect(elements).toContain(input);
    });
  });

  describe('form input detection', () => {
    it('finds text inputs', () => {
      const input = document.createElement('input');
      input.type = 'text';
      container.appendChild(input);
      mockBoundingRect(input, { top: 10, left: 10, width: 200, height: 30 });

      const elements = findClickableElements();
      expect(elements).toContain(input);
    });

    it('finds password inputs', () => {
      const input = document.createElement('input');
      input.type = 'password';
      container.appendChild(input);
      mockBoundingRect(input, { top: 10, left: 10, width: 200, height: 30 });

      const elements = findClickableElements();
      expect(elements).toContain(input);
    });

    it('finds textareas', () => {
      const textarea = document.createElement('textarea');
      container.appendChild(textarea);
      mockBoundingRect(textarea, { top: 10, left: 10, width: 200, height: 100 });

      const elements = findClickableElements();
      expect(elements).toContain(textarea);
    });

    it('finds select elements', () => {
      const select = document.createElement('select');
      container.appendChild(select);
      mockBoundingRect(select, { top: 10, left: 10, width: 200, height: 30 });

      const elements = findClickableElements();
      expect(elements).toContain(select);
    });

    it('finds checkboxes', () => {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      container.appendChild(checkbox);
      mockBoundingRect(checkbox, { top: 10, left: 10, width: 20, height: 20 });

      const elements = findClickableElements();
      expect(elements).toContain(checkbox);
    });

    it('finds radio buttons', () => {
      const radio = document.createElement('input');
      radio.type = 'radio';
      container.appendChild(radio);
      mockBoundingRect(radio, { top: 10, left: 10, width: 20, height: 20 });

      const elements = findClickableElements();
      expect(elements).toContain(radio);
    });
  });

  describe('ARIA role detection', () => {
    it('finds elements with role=button', () => {
      const div = document.createElement('div');
      div.setAttribute('role', 'button');
      div.textContent = 'Custom Button';
      container.appendChild(div);
      mockBoundingRect(div, { top: 10, left: 10, width: 100, height: 30 });

      const elements = findClickableElements();
      expect(elements).toContain(div);
    });

    it('finds elements with role=link', () => {
      const span = document.createElement('span');
      span.setAttribute('role', 'link');
      span.textContent = 'Custom Link';
      container.appendChild(span);
      mockBoundingRect(span, { top: 10, left: 10, width: 100, height: 20 });

      const elements = findClickableElements();
      expect(elements).toContain(span);
    });
  });

  describe('tabindex detection', () => {
    it('finds elements with tabindex >= 0', () => {
      const div = document.createElement('div');
      div.tabIndex = 0;
      div.textContent = 'Focusable';
      container.appendChild(div);
      mockBoundingRect(div, { top: 10, left: 10, width: 100, height: 30 });

      const elements = findClickableElements();
      expect(elements).toContain(div);
    });

    it('ignores elements with tabindex < 0', () => {
      const div = document.createElement('div');
      div.tabIndex = -1;
      div.textContent = 'Not focusable';
      container.appendChild(div);
      mockBoundingRect(div, { top: 10, left: 10, width: 100, height: 30 });

      const elements = findClickableElements();
      expect(elements).not.toContain(div);
    });
  });

  describe('summary element detection', () => {
    it('finds summary elements', () => {
      const details = document.createElement('details');
      const summary = document.createElement('summary');
      summary.textContent = 'Click to expand';
      details.appendChild(summary);
      container.appendChild(details);
      mockBoundingRect(summary, { top: 10, left: 10, width: 200, height: 30 });

      const elements = findClickableElements();
      expect(elements).toContain(summary);
    });
  });

  describe('visibility filtering', () => {
    it('excludes elements outside viewport (above)', () => {
      const link = document.createElement('a');
      link.href = 'https://example.com';
      container.appendChild(link);
      mockBoundingRect(link, { top: -200, bottom: -100, left: 10, width: 100, height: 100 });

      const elements = findClickableElements();
      expect(elements).not.toContain(link);
    });

    it('excludes elements outside viewport (below)', () => {
      const link = document.createElement('a');
      link.href = 'https://example.com';
      container.appendChild(link);
      mockBoundingRect(link, { top: 900, bottom: 1000, left: 10, width: 100, height: 100 });

      const elements = findClickableElements();
      expect(elements).not.toContain(link);
    });

    it('excludes elements outside viewport (left)', () => {
      const link = document.createElement('a');
      link.href = 'https://example.com';
      container.appendChild(link);
      mockBoundingRect(link, { top: 10, left: -200, right: -100, width: 100, height: 100 });

      const elements = findClickableElements();
      expect(elements).not.toContain(link);
    });

    it('excludes elements outside viewport (right)', () => {
      const link = document.createElement('a');
      link.href = 'https://example.com';
      container.appendChild(link);
      mockBoundingRect(link, { top: 10, left: 1200, right: 1300, width: 100, height: 100 });

      const elements = findClickableElements();
      expect(elements).not.toContain(link);
    });

    it('excludes elements with zero dimensions', () => {
      const link = document.createElement('a');
      link.href = 'https://example.com';
      container.appendChild(link);
      mockBoundingRect(link, { top: 10, left: 10, width: 0, height: 0 });

      const elements = findClickableElements();
      expect(elements).not.toContain(link);
    });

    it('includes partially visible elements', () => {
      const link = document.createElement('a');
      link.href = 'https://example.com';
      container.appendChild(link);
      mockBoundingRect(link, { top: -50, bottom: 50, left: 10, right: 110, width: 100, height: 100 });

      const elements = findClickableElements();
      expect(elements).toContain(link);
    });
  });

  describe('hidden element filtering', () => {
    it('excludes elements with display: none', () => {
      const link = document.createElement('a');
      link.href = 'https://example.com';
      link.style.display = 'none';
      container.appendChild(link);

      const elements = findClickableElements();
      expect(elements).not.toContain(link);
    });

    it('excludes elements with visibility: hidden', () => {
      const link = document.createElement('a');
      link.href = 'https://example.com';
      link.style.visibility = 'hidden';
      container.appendChild(link);

      const elements = findClickableElements();
      expect(elements).not.toContain(link);
    });
  });

  describe('no duplicates', () => {
    it('does not return duplicate elements', () => {
      // An element that matches multiple selectors
      const button = document.createElement('button');
      button.setAttribute('role', 'button');
      button.tabIndex = 0;
      container.appendChild(button);
      mockBoundingRect(button, { top: 10, left: 10, width: 100, height: 30 });

      const elements = findClickableElements();
      const buttonOccurrences = elements.filter((el) => el === button);
      expect(buttonOccurrences.length).toBe(1);
    });
  });
});
