import { SmoothScroller } from './smoothScroll';
import { KeySequenceDetector } from './keySequence';
import { AnimationLoop } from './animationLoop';
import { isInputElement } from './isInputElement';
import { COMMAND_DEFINITIONS } from './commandDefinitions';
import { LinkHints } from './linkHints';

export interface KeyHandlerConfig {
  verticalScroller: SmoothScroller;
  horizontalScroller: SmoothScroller;
  animationLoop: AnimationLoop;
  linkHints?: LinkHints;
  sequenceTimeout?: number;
  onHelpToggle?: () => void;
  isHelpVisible?: () => boolean;
}

const HOLD_KEYS = new Set(['j', 'k', 'h', 'l']);

export class KeyHandler {
  private verticalScroller: SmoothScroller;
  private horizontalScroller: SmoothScroller;
  private animationLoop: AnimationLoop;
  private linkHints?: LinkHints;
  private sequenceDetector: KeySequenceDetector;
  private commands = new Map<string, () => void>();
  private onHelpToggle?: () => void;
  private isHelpVisible: () => boolean;

  constructor(config: KeyHandlerConfig) {
    this.verticalScroller = config.verticalScroller;
    this.horizontalScroller = config.horizontalScroller;
    this.animationLoop = config.animationLoop;
    this.linkHints = config.linkHints;
    this.onHelpToggle = config.onHelpToggle;
    this.isHelpVisible = config.isHelpVisible ?? (() => false);
    this.sequenceDetector = new KeySequenceDetector({
      timeout: config.sequenceTimeout ?? 500,
    });

    this.registerCommands();
    this.registerSequences();
  }

  private registerCommands(): void {
    this.commands.set('G', () => {
      const bottom = document.documentElement.scrollHeight - window.innerHeight;
      this.verticalScroller.scrollTo(bottom);
      this.animationLoop.start();
    });

    this.commands.set('d', () => {
      this.verticalScroller.scrollBy(window.innerHeight / 2);
      this.animationLoop.start();
    });

    this.commands.set('u', () => {
      this.verticalScroller.scrollBy(-window.innerHeight / 2);
      this.animationLoop.start();
    });
  }

  private registerSequences(): void {
    this.sequenceDetector.register('gg', () => {
      this.verticalScroller.scrollTo(0);
      this.animationLoop.start();
    });
  }

  handleKeyDown(e: KeyboardEvent): void {
    const key = e.key;

    // Allow Escape to blur input elements
    if (isInputElement(e.target as Element)) {
      if (key === 'Escape') {
        (e.target as HTMLElement).blur();
        e.preventDefault();
      }
      return;
    }

    // Always allow ? to toggle help
    if (key === '?' && this.onHelpToggle) {
      this.onHelpToggle();
      return;
    }

    // Block all other commands when help is visible
    if (this.isHelpVisible()) return;

    // Delegate to link hints if active
    if (this.linkHints?.isActive()) {
      if (this.linkHints.handleKey(key)) {
        e.preventDefault();
        return;
      }
    }

    // Handle link hints activation
    if (key === 'f' && this.linkHints) {
      this.linkHints.activate(false);
      return;
    }
    if (key === 'F' && this.linkHints) {
      this.linkHints.activate(true);
      return;
    }

    if (this.sequenceDetector.handleKey(key)) return;

    const command = this.commands.get(key);
    if (command) {
      command();
      return;
    }

    if (HOLD_KEYS.has(key)) {
      this.handleHoldKeyDown(key);
    }
  }

  handleKeyUp(e: KeyboardEvent): void {
    if (HOLD_KEYS.has(e.key)) {
      this.handleHoldKeyUp(e.key);
    }
  }

  private handleHoldKeyDown(key: string): void {
    if (key === 'j' || key === 'k') {
      this.verticalScroller.keyDown(key);
    } else {
      this.horizontalScroller.keyDown(key);
    }
    this.animationLoop.start();
  }

  private handleHoldKeyUp(key: string): void {
    if (key === 'j' || key === 'k') {
      this.verticalScroller.keyUp(key);
    } else {
      this.horizontalScroller.keyUp(key);
    }
  }

  getAvailableCommands(): { key: string; description: string }[] {
    return COMMAND_DEFINITIONS.map(({ key, description }) => ({ key, description }));
  }
}
