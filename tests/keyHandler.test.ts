import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { KeyHandler } from '../src/keyHandler';
import { SmoothScroller } from '../src/smoothScroll';
import { AnimationLoop } from '../src/animationLoop';
import { LinkHints } from '../src/linkHints';

describe('KeyHandler', () => {
  let keyHandler: KeyHandler;
  let verticalScroller: SmoothScroller;
  let horizontalScroller: SmoothScroller;
  let animationLoop: AnimationLoop;
  let mockScrollTo: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();

    mockScrollTo = vi.fn();

    verticalScroller = new SmoothScroller({
      scrollTo: mockScrollTo,
      getScroll: () => 0,
      tapAmount: 50,
      holdVelocity: 800,
      lerpFactor: 0.2,
    });

    horizontalScroller = new SmoothScroller({
      scrollTo: mockScrollTo,
      getScroll: () => 0,
      tapAmount: 50,
      holdVelocity: 800,
      lerpFactor: 0.2,
    });

    animationLoop = new AnimationLoop();
    vi.spyOn(animationLoop, 'start');

    keyHandler = new KeyHandler({
      verticalScroller,
      horizontalScroller,
      animationLoop,
    });

    // Mock document properties for scroll commands
    vi.stubGlobal('document', {
      documentElement: { scrollHeight: 2000 },
    });
    vi.stubGlobal('window', { innerHeight: 800 });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  function createKeyEvent(
    key: string,
    target: Element | null = null,
    preventDefault = vi.fn()
  ): KeyboardEvent {
    return {
      key,
      target: target ?? { tagName: 'DIV' },
      preventDefault,
    } as unknown as KeyboardEvent;
  }

  describe('single key commands', () => {
    it('handles G (go to bottom)', () => {
      keyHandler.handleKeyDown(createKeyEvent('G'));

      // bottom = scrollHeight - innerHeight = 2000 - 800 = 1200
      expect(verticalScroller.getTarget()).toBe(1200);
      expect(animationLoop.start).toHaveBeenCalled();
    });

    it('handles d (half page down)', () => {
      keyHandler.handleKeyDown(createKeyEvent('d'));

      // half page = innerHeight / 2 = 400
      expect(verticalScroller.getTarget()).toBe(400);
      expect(animationLoop.start).toHaveBeenCalled();
    });

    it('handles u (half page up)', () => {
      keyHandler.handleKeyDown(createKeyEvent('u'));

      expect(verticalScroller.getTarget()).toBe(-400);
      expect(animationLoop.start).toHaveBeenCalled();
    });
  });

  describe('sequence commands', () => {
    it('handles gg (go to top)', () => {
      keyHandler.handleKeyDown(createKeyEvent('g'));
      keyHandler.handleKeyDown(createKeyEvent('g'));

      expect(verticalScroller.getTarget()).toBe(0);
      expect(animationLoop.start).toHaveBeenCalled();
    });

    it('does not trigger gg if timeout expires', () => {
      keyHandler.handleKeyDown(createKeyEvent('g'));
      vi.advanceTimersByTime(600);
      keyHandler.handleKeyDown(createKeyEvent('g'));

      // Should not have scrolled to 0 (gg not triggered)
      expect(verticalScroller.getTarget()).toBe(0); // Still at initial
      expect(animationLoop.start).not.toHaveBeenCalled();
    });
  });

  describe('hold keys (vertical)', () => {
    it('handles j (scroll down)', () => {
      keyHandler.handleKeyDown(createKeyEvent('j'));

      expect(verticalScroller.isHolding()).toBe(true);
      expect(verticalScroller.getTarget()).toBe(50); // tapAmount
      expect(animationLoop.start).toHaveBeenCalled();
    });

    it('handles k (scroll up)', () => {
      keyHandler.handleKeyDown(createKeyEvent('k'));

      expect(verticalScroller.isHolding()).toBe(true);
      expect(verticalScroller.getTarget()).toBe(-50);
      expect(animationLoop.start).toHaveBeenCalled();
    });

    it('releases j on keyUp', () => {
      keyHandler.handleKeyDown(createKeyEvent('j'));
      keyHandler.handleKeyUp(createKeyEvent('j'));

      expect(verticalScroller.isHolding()).toBe(false);
    });

    it('releases k on keyUp', () => {
      keyHandler.handleKeyDown(createKeyEvent('k'));
      keyHandler.handleKeyUp(createKeyEvent('k'));

      expect(verticalScroller.isHolding()).toBe(false);
    });
  });

  describe('hold keys (horizontal)', () => {
    it('handles h (scroll left)', () => {
      keyHandler.handleKeyDown(createKeyEvent('h'));

      expect(horizontalScroller.isHolding()).toBe(true);
      expect(horizontalScroller.getTarget()).toBe(-50);
      expect(animationLoop.start).toHaveBeenCalled();
    });

    it('handles l (scroll right)', () => {
      keyHandler.handleKeyDown(createKeyEvent('l'));

      expect(horizontalScroller.isHolding()).toBe(true);
      expect(horizontalScroller.getTarget()).toBe(50);
      expect(animationLoop.start).toHaveBeenCalled();
    });

    it('releases h on keyUp', () => {
      keyHandler.handleKeyDown(createKeyEvent('h'));
      keyHandler.handleKeyUp(createKeyEvent('h'));

      expect(horizontalScroller.isHolding()).toBe(false);
    });

    it('releases l on keyUp', () => {
      keyHandler.handleKeyDown(createKeyEvent('l'));
      keyHandler.handleKeyUp(createKeyEvent('l'));

      expect(horizontalScroller.isHolding()).toBe(false);
    });
  });

  describe('input element filtering', () => {
    it('ignores keydown in input elements', () => {
      const inputElement = { tagName: 'INPUT' } as Element;
      keyHandler.handleKeyDown(createKeyEvent('j', inputElement));

      expect(verticalScroller.isHolding()).toBe(false);
      expect(animationLoop.start).not.toHaveBeenCalled();
    });

    it('ignores keydown in textarea elements', () => {
      const textareaElement = { tagName: 'TEXTAREA' } as Element;
      keyHandler.handleKeyDown(createKeyEvent('j', textareaElement));

      expect(verticalScroller.isHolding()).toBe(false);
      expect(animationLoop.start).not.toHaveBeenCalled();
    });

    it('ignores keydown in contenteditable elements', () => {
      const editableElement = {
        tagName: 'DIV',
        isContentEditable: true,
      } as unknown as Element;
      keyHandler.handleKeyDown(createKeyEvent('j', editableElement));

      expect(verticalScroller.isHolding()).toBe(false);
      expect(animationLoop.start).not.toHaveBeenCalled();
    });

    it('blurs input element on Escape key', () => {
      const blur = vi.fn();
      const inputElement = { tagName: 'INPUT', blur } as unknown as Element;
      const preventDefault = vi.fn();

      keyHandler.handleKeyDown(createKeyEvent('Escape', inputElement, preventDefault));

      expect(blur).toHaveBeenCalled();
      expect(preventDefault).toHaveBeenCalled();
    });

    it('blurs textarea element on Escape key', () => {
      const blur = vi.fn();
      const textareaElement = { tagName: 'TEXTAREA', blur } as unknown as Element;
      const preventDefault = vi.fn();

      keyHandler.handleKeyDown(createKeyEvent('Escape', textareaElement, preventDefault));

      expect(blur).toHaveBeenCalled();
      expect(preventDefault).toHaveBeenCalled();
    });

    it('blurs contenteditable element on Escape key', () => {
      const blur = vi.fn();
      const editableElement = {
        tagName: 'DIV',
        isContentEditable: true,
        blur,
      } as unknown as Element;
      const preventDefault = vi.fn();

      keyHandler.handleKeyDown(createKeyEvent('Escape', editableElement, preventDefault));

      expect(blur).toHaveBeenCalled();
      expect(preventDefault).toHaveBeenCalled();
    });
  });

  describe('getAvailableCommands', () => {
    it('returns all available commands', () => {
      const commands = keyHandler.getAvailableCommands();

      expect(commands).toContainEqual({ key: 'j', description: 'Scroll down' });
      expect(commands).toContainEqual({ key: 'k', description: 'Scroll up' });
      expect(commands).toContainEqual({ key: 'h', description: 'Scroll left' });
      expect(commands).toContainEqual({ key: 'l', description: 'Scroll right' });
      expect(commands).toContainEqual({ key: 'd', description: 'Half page down' });
      expect(commands).toContainEqual({ key: 'u', description: 'Half page up' });
      expect(commands).toContainEqual({ key: 'gg', description: 'Go to top' });
      expect(commands).toContainEqual({ key: 'G', description: 'Go to bottom' });
      expect(commands).toContainEqual({ key: '?', description: 'Show/hide help' });
    });
  });

  describe('unknown keys', () => {
    it('ignores unknown keys', () => {
      keyHandler.handleKeyDown(createKeyEvent('x'));

      expect(verticalScroller.isHolding()).toBe(false);
      expect(horizontalScroller.isHolding()).toBe(false);
      expect(animationLoop.start).not.toHaveBeenCalled();
    });
  });

  describe('link hints integration', () => {
    it('calls preventDefault when link hints handles a key', () => {
      const linkHints = new LinkHints();
      vi.spyOn(linkHints, 'isActive').mockReturnValue(true);
      vi.spyOn(linkHints, 'handleKey').mockReturnValue(true);

      const handler = new KeyHandler({
        verticalScroller,
        horizontalScroller,
        animationLoop,
        linkHints,
      });

      const preventDefault = vi.fn();
      handler.handleKeyDown(createKeyEvent('s', null, preventDefault));

      expect(linkHints.handleKey).toHaveBeenCalledWith('s');
      expect(preventDefault).toHaveBeenCalled();
    });

    it('does not call preventDefault when link hints does not handle key', () => {
      const linkHints = new LinkHints();
      vi.spyOn(linkHints, 'isActive').mockReturnValue(true);
      vi.spyOn(linkHints, 'handleKey').mockReturnValue(false);

      const handler = new KeyHandler({
        verticalScroller,
        horizontalScroller,
        animationLoop,
        linkHints,
      });

      const preventDefault = vi.fn();
      handler.handleKeyDown(createKeyEvent('x', null, preventDefault));

      expect(preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('help command', () => {
    it('calls onHelpToggle when ? is pressed', () => {
      const onHelpToggle = vi.fn();
      const handler = new KeyHandler({
        verticalScroller,
        horizontalScroller,
        animationLoop,
        onHelpToggle,
      });

      handler.handleKeyDown(createKeyEvent('?'));
      expect(onHelpToggle).toHaveBeenCalled();
    });

    it('blocks other commands when help is visible', () => {
      const isHelpVisible = vi.fn().mockReturnValue(true);
      const onHelpToggle = vi.fn();
      const handler = new KeyHandler({
        verticalScroller,
        horizontalScroller,
        animationLoop,
        onHelpToggle,
        isHelpVisible,
      });

      handler.handleKeyDown(createKeyEvent('j'));
      expect(verticalScroller.isHolding()).toBe(false);
      expect(animationLoop.start).not.toHaveBeenCalled();
    });

    it('allows ? when help is visible', () => {
      const isHelpVisible = vi.fn().mockReturnValue(true);
      const onHelpToggle = vi.fn();
      const handler = new KeyHandler({
        verticalScroller,
        horizontalScroller,
        animationLoop,
        onHelpToggle,
        isHelpVisible,
      });

      handler.handleKeyDown(createKeyEvent('?'));
      expect(onHelpToggle).toHaveBeenCalled();
    });
  });
});
