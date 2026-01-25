import { findClickableElements } from './findClickableElements';
import { generateHints } from './generateHints';

const HINT_CHARS = new Set(['s', 'a', 'd', 'f', 'j', 'k', 'l']);

const styles = {
  overlay: {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    pointerEvents: 'none',
    zIndex: '2147483646',
  },
  hintLabel: {
    position: 'absolute',
    backgroundColor: '#f0e130',
    color: '#000',
    padding: '1px 4px',
    borderRadius: '3px',
    fontSize: '12px',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
    border: '1px solid #c0b020',
    zIndex: '2147483647',
  },
} as const;

function applyStyles(element: HTMLElement, styleObj: Record<string, string>): void {
  Object.assign(element.style, styleObj);
}

function isTextInput(element: HTMLElement): boolean {
  if (element.tagName === 'TEXTAREA') return true;
  if (element.tagName === 'SELECT') return true;
  if (element.tagName === 'INPUT') {
    const inputType = (element as HTMLInputElement).type.toLowerCase();
    const textTypes = ['text', 'password', 'email', 'search', 'tel', 'url', 'number', 'date'];
    return textTypes.includes(inputType);
  }
  return false;
}

export class LinkHints {
  private active = false;
  private newTabMode = false;
  private overlay: HTMLElement | null = null;
  private hints: Map<string, { element: HTMLElement; label: HTMLElement }> = new Map();
  private typedChars = '';

  activate(newTab: boolean): void {
    if (this.active) return;

    const elements = findClickableElements();
    if (elements.length === 0) return;

    this.newTabMode = newTab;
    this.active = true;
    this.typedChars = '';

    this.createOverlay(elements);
  }

  deactivate(): void {
    if (!this.active) return;

    this.active = false;
    this.newTabMode = false;
    this.typedChars = '';
    this.hints.clear();
    this.removeOverlay();
  }

  isActive(): boolean {
    return this.active;
  }

  handleKey(key: string): boolean {
    if (!this.active) return false;

    // Handle Escape
    if (key === 'Escape') {
      this.deactivate();
      return true;
    }

    // Handle Backspace
    if (key === 'Backspace') {
      if (this.typedChars.length > 0) {
        this.typedChars = this.typedChars.slice(0, -1);
        this.updateHintVisibility();
      }
      return true;
    }

    // Convert to lowercase for case insensitivity
    const lowerKey = key.toLowerCase();

    // Check if it's a valid hint character
    if (!HINT_CHARS.has(lowerKey)) {
      return false;
    }

    this.typedChars += lowerKey;
    this.updateHintVisibility();

    // Check for exact match
    const match = this.hints.get(this.typedChars);
    if (match) {
      this.activateElement(match.element);
      this.deactivate();
      return true;
    }

    // Check if there are any remaining matches
    const hasMatches = Array.from(this.hints.keys()).some((hint) =>
      hint.startsWith(this.typedChars)
    );

    if (!hasMatches) {
      // No matches, deactivate
      this.deactivate();
    }

    return true;
  }

  private createOverlay(elements: HTMLElement[]): void {
    this.overlay = document.createElement('div');
    this.overlay.setAttribute('data-musophobia-hints', '');
    applyStyles(this.overlay, styles.overlay);

    const hintStrings = generateHints(elements.length);

    elements.forEach((element, index) => {
      const hintString = hintStrings[index];
      const label = this.createHintLabel(element, hintString);
      this.overlay!.appendChild(label);
      this.hints.set(hintString, { element, label });
    });

    document.body.appendChild(this.overlay);
  }

  private createHintLabel(element: HTMLElement, hintString: string): HTMLElement {
    const label = document.createElement('span');
    label.setAttribute('data-musophobia-hint-label', '');
    label.textContent = hintString;
    applyStyles(label, styles.hintLabel);

    // Position the label near the element
    const rect = element.getBoundingClientRect();
    label.style.left = `${rect.left}px`;
    label.style.top = `${rect.top}px`;

    return label;
  }

  private removeOverlay(): void {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
  }

  private updateHintVisibility(): void {
    for (const [hintString, { label }] of this.hints) {
      if (hintString.startsWith(this.typedChars)) {
        label.style.display = '';
      } else {
        label.style.display = 'none';
      }
    }
  }

  private activateElement(element: HTMLElement): void {
    if (isTextInput(element)) {
      element.focus();
      return;
    }

    // For links in new tab mode, open in new tab
    if (this.newTabMode && element.tagName === 'A') {
      const href = (element as HTMLAnchorElement).href;
      window.open(href, '_blank');
      return;
    }

    // Default: click the element
    element.click();
  }
}
