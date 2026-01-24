import { SmoothScroller } from './smoothScroll';
import { KeySequenceDetector } from './keySequence';
import { AnimationLoop } from './animationLoop';
import { isInputElement } from './isInputElement';

export interface KeyHandlerConfig {
  verticalScroller: SmoothScroller;
  horizontalScroller: SmoothScroller;
  animationLoop: AnimationLoop;
  sequenceTimeout?: number;
}

const HOLD_KEYS = new Set(['j', 'k', 'h', 'l']);

export class KeyHandler {
  private verticalScroller: SmoothScroller;
  private horizontalScroller: SmoothScroller;
  private animationLoop: AnimationLoop;
  private sequenceDetector: KeySequenceDetector;
  private commands = new Map<string, () => void>();

  constructor(config: KeyHandlerConfig) {
    this.verticalScroller = config.verticalScroller;
    this.horizontalScroller = config.horizontalScroller;
    this.animationLoop = config.animationLoop;
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
    if (isInputElement(e.target as Element)) return;

    const key = e.key;

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
    return [
      { key: 'j', description: 'Scroll down' },
      { key: 'k', description: 'Scroll up' },
      { key: 'h', description: 'Scroll left' },
      { key: 'l', description: 'Scroll right' },
      { key: 'd', description: 'Half page down' },
      { key: 'u', description: 'Half page up' },
      { key: 'gg', description: 'Go to top' },
      { key: 'G', description: 'Go to bottom' },
    ];
  }
}
