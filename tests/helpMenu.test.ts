import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { HelpMenu } from '../src/helpMenu';
import { CommandDefinition } from '../src/commandDefinitions';

describe('HelpMenu', () => {
  let helpMenu: HelpMenu;
  const mockCommands: CommandDefinition[] = [
    { key: 'j', description: 'Scroll down', category: 'Navigation' },
    { key: 'k', description: 'Scroll up', category: 'Navigation' },
    { key: '?', description: 'Show/hide help', category: 'Help' },
  ];

  beforeEach(() => {
    helpMenu = new HelpMenu(mockCommands);
  });

  afterEach(() => {
    helpMenu.hide();
  });

  describe('visibility', () => {
    it('is not visible by default', () => {
      expect(helpMenu.isVisible()).toBe(false);
    });

    it('is visible after show()', () => {
      helpMenu.show();
      expect(helpMenu.isVisible()).toBe(true);
    });

    it('is not visible after hide()', () => {
      helpMenu.show();
      helpMenu.hide();
      expect(helpMenu.isVisible()).toBe(false);
    });

    it('toggles visibility', () => {
      helpMenu.toggle();
      expect(helpMenu.isVisible()).toBe(true);
      helpMenu.toggle();
      expect(helpMenu.isVisible()).toBe(false);
    });
  });

  describe('DOM manipulation', () => {
    it('creates overlay element when shown', () => {
      helpMenu.show();
      const overlay = document.querySelector('[data-musophobia-help]');
      expect(overlay).not.toBeNull();
    });

    it('removes overlay element when hidden', () => {
      helpMenu.show();
      helpMenu.hide();
      const overlay = document.querySelector('[data-musophobia-help]');
      expect(overlay).toBeNull();
    });

    it('does not create duplicate overlays on multiple show() calls', () => {
      helpMenu.show();
      helpMenu.show();
      const overlays = document.querySelectorAll('[data-musophobia-help]');
      expect(overlays.length).toBe(1);
    });
  });

  describe('content display', () => {
    it('displays command keys', () => {
      helpMenu.show();
      const overlay = document.querySelector('[data-musophobia-help]');
      expect(overlay?.textContent).toContain('j');
      expect(overlay?.textContent).toContain('k');
    });

    it('displays command descriptions', () => {
      helpMenu.show();
      const overlay = document.querySelector('[data-musophobia-help]');
      expect(overlay?.textContent).toContain('Scroll down');
      expect(overlay?.textContent).toContain('Scroll up');
    });
  });

  describe('dismiss with Escape', () => {
    it('closes on Escape key press', () => {
      helpMenu.show();
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);
      expect(helpMenu.isVisible()).toBe(false);
    });

    it('does not respond to Escape when not visible', () => {
      const hideSpy = vi.spyOn(helpMenu, 'hide');
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);
      expect(hideSpy).not.toHaveBeenCalled();
    });
  });

  describe('dismiss with click outside', () => {
    it('closes when clicking on overlay background', () => {
      helpMenu.show();
      const overlay = document.querySelector('[data-musophobia-help]') as HTMLElement;
      overlay.click();
      expect(helpMenu.isVisible()).toBe(false);
    });

    it('does not close when clicking on modal content', () => {
      helpMenu.show();
      const modal = document.querySelector('[data-musophobia-help-modal]') as HTMLElement;
      modal.click();
      expect(helpMenu.isVisible()).toBe(true);
    });
  });
});
