import { CommandDefinition } from './commandDefinitions';

const styles = {
  overlay: {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    zIndex: '2147483647',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  modal: {
    backgroundColor: '#1a1a1a',
    borderRadius: '8px',
    padding: '24px',
    maxWidth: '400px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
  },
  title: {
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '16px',
    borderBottom: '1px solid #333',
    paddingBottom: '12px',
  },
  category: {
    color: '#888',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginTop: '16px',
    marginBottom: '8px',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
  },
  key: {
    backgroundColor: '#333',
    color: '#fff',
    padding: '4px 8px',
    borderRadius: '4px',
    fontFamily: 'monospace',
    fontSize: '14px',
    minWidth: '24px',
    textAlign: 'center',
  },
  description: {
    color: '#ccc',
    fontSize: '14px',
  },
} as const;

function applyStyles(element: HTMLElement, styleObj: Record<string, string>): void {
  Object.assign(element.style, styleObj);
}

export class HelpMenu {
  private visible = false;
  private overlay: HTMLElement | null = null;
  private commands: CommandDefinition[];
  private escapeHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor(commands: CommandDefinition[]) {
    this.commands = commands;
  }

  show(): void {
    if (this.visible) return;
    this.visible = true;
    this.createOverlay();
    this.attachEscapeHandler();
  }

  hide(): void {
    if (!this.visible) return;
    this.visible = false;
    this.removeOverlay();
    this.detachEscapeHandler();
  }

  toggle(): void {
    if (this.visible) {
      this.hide();
    } else {
      this.show();
    }
  }

  isVisible(): boolean {
    return this.visible;
  }

  private createOverlay(): void {
    this.overlay = document.createElement('div');
    this.overlay.setAttribute('data-musophobia-help', '');
    applyStyles(this.overlay, styles.overlay);

    const modal = document.createElement('div');
    modal.setAttribute('data-musophobia-help-modal', '');
    applyStyles(modal, styles.modal);

    // Prevent clicks on modal from closing
    modal.addEventListener('click', (e) => e.stopPropagation());

    // Click on overlay closes menu
    this.overlay.addEventListener('click', () => this.hide());

    const title = document.createElement('div');
    applyStyles(title, styles.title);
    title.textContent = 'Keyboard Shortcuts';
    modal.appendChild(title);

    // Group commands by category
    const grouped = this.groupByCategory();

    for (const [category, commands] of Object.entries(grouped)) {
      const categoryEl = document.createElement('div');
      applyStyles(categoryEl, styles.category);
      categoryEl.textContent = category;
      modal.appendChild(categoryEl);

      for (const cmd of commands) {
        const row = document.createElement('div');
        applyStyles(row, styles.row);

        const keyEl = document.createElement('span');
        applyStyles(keyEl, styles.key);
        keyEl.textContent = cmd.key;

        const descEl = document.createElement('span');
        applyStyles(descEl, styles.description);
        descEl.textContent = cmd.description;

        row.appendChild(keyEl);
        row.appendChild(descEl);
        modal.appendChild(row);
      }
    }

    this.overlay.appendChild(modal);
    document.body.appendChild(this.overlay);
  }

  private removeOverlay(): void {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
  }

  private groupByCategory(): Record<string, CommandDefinition[]> {
    const grouped: Record<string, CommandDefinition[]> = {};
    for (const cmd of this.commands) {
      const category = cmd.category;
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(cmd);
    }
    return grouped;
  }

  private attachEscapeHandler(): void {
    this.escapeHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.hide();
      }
    };
    document.addEventListener('keydown', this.escapeHandler);
  }

  private detachEscapeHandler(): void {
    if (this.escapeHandler) {
      document.removeEventListener('keydown', this.escapeHandler);
      this.escapeHandler = null;
    }
  }
}
