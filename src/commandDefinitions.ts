export interface CommandDefinition {
  key: string;
  description: string;
  category: 'Navigation' | 'Links' | 'Help';
}

export const COMMAND_DEFINITIONS: CommandDefinition[] = [
  // Navigation - Continuous scroll
  { key: 'j', description: 'Scroll down', category: 'Navigation' },
  { key: 'k', description: 'Scroll up', category: 'Navigation' },
  { key: 'h', description: 'Scroll left', category: 'Navigation' },
  { key: 'l', description: 'Scroll right', category: 'Navigation' },
  // Navigation - Page jumps
  { key: 'd', description: 'Half page down', category: 'Navigation' },
  { key: 'u', description: 'Half page up', category: 'Navigation' },
  { key: 'gg', description: 'Go to top', category: 'Navigation' },
  { key: 'G', description: 'Go to bottom', category: 'Navigation' },
  // Links
  { key: 'f', description: 'Show link hints', category: 'Links' },
  { key: 'F', description: 'Show link hints (new tab)', category: 'Links' },
  // Help
  { key: '?', description: 'Show/hide help', category: 'Help' },
];
