import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LinkHints } from '../src/linkHints';

describe('LinkHints', () => {
  let linkHints: LinkHints;
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    linkHints = new LinkHints();

    // Mock viewport dimensions
    vi.stubGlobal('innerWidth', 1024);
    vi.stubGlobal('innerHeight', 768);
  });

  afterEach(() => {
    linkHints.deactivate();
    container.remove();
    vi.unstubAllGlobals();
  });

  function createVisibleLink(text: string): HTMLAnchorElement {
    const link = document.createElement('a');
    link.href = 'https://example.com';
    link.textContent = text;
    container.appendChild(link);
    vi.spyOn(link, 'getBoundingClientRect').mockReturnValue({
      top: 10,
      left: 10,
      bottom: 30,
      right: 110,
      width: 100,
      height: 20,
      x: 10,
      y: 10,
      toJSON: () => ({}),
    });
    return link;
  }

  function createVisibleButton(text: string): HTMLButtonElement {
    const button = document.createElement('button');
    button.textContent = text;
    container.appendChild(button);
    vi.spyOn(button, 'getBoundingClientRect').mockReturnValue({
      top: 50,
      left: 10,
      bottom: 80,
      right: 110,
      width: 100,
      height: 30,
      x: 10,
      y: 50,
      toJSON: () => ({}),
    });
    return button;
  }

  function createVisibleInput(): HTMLInputElement {
    const input = document.createElement('input');
    input.type = 'text';
    container.appendChild(input);
    vi.spyOn(input, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      left: 10,
      bottom: 130,
      right: 210,
      width: 200,
      height: 30,
      x: 10,
      y: 100,
      toJSON: () => ({}),
    });
    return input;
  }

  describe('activation', () => {
    it('is not active by default', () => {
      expect(linkHints.isActive()).toBe(false);
    });

    it('is active after activate()', () => {
      createVisibleLink('Example');
      linkHints.activate(false);
      expect(linkHints.isActive()).toBe(true);
    });

    it('creates overlay when activated', () => {
      createVisibleLink('Example');
      linkHints.activate(false);
      const overlay = document.querySelector('[data-musophobia-hints]');
      expect(overlay).not.toBeNull();
    });

    it('does not activate if no clickable elements', () => {
      linkHints.activate(false);
      expect(linkHints.isActive()).toBe(false);
    });
  });

  describe('deactivation', () => {
    it('is not active after deactivate()', () => {
      createVisibleLink('Example');
      linkHints.activate(false);
      linkHints.deactivate();
      expect(linkHints.isActive()).toBe(false);
    });

    it('removes overlay when deactivated', () => {
      createVisibleLink('Example');
      linkHints.activate(false);
      linkHints.deactivate();
      const overlay = document.querySelector('[data-musophobia-hints]');
      expect(overlay).toBeNull();
    });

    it('handles deactivate when not active', () => {
      // Should not throw
      expect(() => linkHints.deactivate()).not.toThrow();
    });
  });

  describe('hint display', () => {
    it('displays hint labels on clickable elements', () => {
      createVisibleLink('Example');
      linkHints.activate(false);

      const hintLabels = document.querySelectorAll('[data-musophobia-hint-label]');
      expect(hintLabels.length).toBe(1);
    });

    it('displays multiple hint labels for multiple elements', () => {
      createVisibleLink('Link 1');
      createVisibleButton('Button 1');

      linkHints.activate(false);

      const hintLabels = document.querySelectorAll('[data-musophobia-hint-label]');
      expect(hintLabels.length).toBe(2);
    });
  });

  describe('key handling', () => {
    it('consumes hint character keys when active', () => {
      createVisibleLink('Example');
      linkHints.activate(false);

      const consumed = linkHints.handleKey('s');
      expect(consumed).toBe(true);
    });

    it('does not consume non-hint keys', () => {
      createVisibleLink('Example');
      linkHints.activate(false);

      const consumed = linkHints.handleKey('x');
      expect(consumed).toBe(false);
    });

    it('handles Escape to deactivate', () => {
      createVisibleLink('Example');
      linkHints.activate(false);

      linkHints.handleKey('Escape');
      expect(linkHints.isActive()).toBe(false);
    });

    it('handles Backspace to delete typed character', () => {
      createVisibleLink('Link 1');
      createVisibleButton('Button 1');
      createVisibleInput();
      // Need more elements to get two-character hints
      for (let i = 0; i < 5; i++) {
        createVisibleLink(`Link ${i + 2}`);
      }

      linkHints.activate(false);

      // Type first character
      linkHints.handleKey('s');
      // Now backspace should restore all hints
      linkHints.handleKey('Backspace');

      const visibleHints = document.querySelectorAll('[data-musophobia-hint-label]');
      expect(visibleHints.length).toBeGreaterThan(1);
    });
  });

  describe('hint filtering', () => {
    it('filters hints as characters are typed', () => {
      // Create 8 elements to get two-character hints
      for (let i = 0; i < 8; i++) {
        createVisibleLink(`Link ${i}`);
      }

      linkHints.activate(false);
      const initialHints = document.querySelectorAll('[data-musophobia-hint-label]');
      expect(initialHints.length).toBe(8);

      // Type first character to filter
      linkHints.handleKey('s');

      const filteredHints = document.querySelectorAll(
        '[data-musophobia-hint-label]:not([style*="display: none"])'
      );
      // Should only show hints starting with 's'
      expect(filteredHints.length).toBeLessThan(8);
    });
  });

  describe('element activation', () => {
    it('clicks link when hint is matched', () => {
      const link = createVisibleLink('Example');
      const clickSpy = vi.spyOn(link, 'click');

      linkHints.activate(false);
      linkHints.handleKey('s'); // First hint

      expect(clickSpy).toHaveBeenCalled();
    });

    it('deactivates after clicking element', () => {
      createVisibleLink('Example');

      linkHints.activate(false);
      linkHints.handleKey('s');

      expect(linkHints.isActive()).toBe(false);
    });

    it('focuses input elements instead of clicking', () => {
      const input = createVisibleInput();
      const focusSpy = vi.spyOn(input, 'focus');

      linkHints.activate(false);
      linkHints.handleKey('s'); // First hint

      expect(focusSpy).toHaveBeenCalled();
    });

    it('opens link in new tab when in new tab mode', () => {
      const link = createVisibleLink('Example');
      const openSpy = vi.fn();
      vi.stubGlobal('open', openSpy);

      linkHints.activate(true); // new tab mode
      linkHints.handleKey('s');

      expect(openSpy).toHaveBeenCalledWith(link.href, '_blank');
    });

    it('focuses inputs normally even in new tab mode', () => {
      const input = createVisibleInput();
      const focusSpy = vi.spyOn(input, 'focus');
      const openSpy = vi.fn();
      vi.stubGlobal('open', openSpy);

      linkHints.activate(true); // new tab mode
      linkHints.handleKey('s');

      expect(focusSpy).toHaveBeenCalled();
      expect(openSpy).not.toHaveBeenCalled();
    });
  });

  describe('two-character hints', () => {
    it('requires two characters for larger element counts', () => {
      // Create 8 elements to trigger two-character hints
      for (let i = 0; i < 8; i++) {
        createVisibleLink(`Link ${i}`);
      }

      linkHints.activate(false);

      const hintLabels = document.querySelectorAll('[data-musophobia-hint-label]');
      const firstHint = hintLabels[0]?.textContent;
      expect(firstHint?.length).toBe(2);
    });

    it('activates element after typing both characters', () => {
      // Create 8 elements
      const links: HTMLAnchorElement[] = [];
      for (let i = 0; i < 8; i++) {
        const link = document.createElement('a');
        link.href = `https://example${i}.com`;
        link.textContent = `Link ${i}`;
        container.appendChild(link);
        vi.spyOn(link, 'getBoundingClientRect').mockReturnValue({
          top: 10 + i * 30,
          left: 10,
          bottom: 30 + i * 30,
          right: 110,
          width: 100,
          height: 20,
          x: 10,
          y: 10 + i * 30,
          toJSON: () => ({}),
        });
        links.push(link);
      }

      const clickSpy = vi.spyOn(links[0], 'click');

      linkHints.activate(false);

      // First hint should be 'ss'
      linkHints.handleKey('s');
      expect(linkHints.isActive()).toBe(true); // Still active, waiting for second char

      linkHints.handleKey('s');
      expect(clickSpy).toHaveBeenCalled();
      expect(linkHints.isActive()).toBe(false);
    });
  });

  describe('case insensitivity', () => {
    it('handles uppercase input as lowercase', () => {
      const link = createVisibleLink('Example');
      const clickSpy = vi.spyOn(link, 'click');

      linkHints.activate(false);
      linkHints.handleKey('S'); // Uppercase S

      expect(clickSpy).toHaveBeenCalled();
    });
  });
});
