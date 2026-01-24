type SequenceCallback = () => void;

export interface KeySequenceDetectorConfig {
  timeout: number;
}

export class KeySequenceDetector {
  private sequences = new Map<string, SequenceCallback>();
  private buffer = '';
  private lastKeyTime = 0;
  private timeout: number;

  constructor(config: KeySequenceDetectorConfig) {
    this.timeout = config.timeout;
  }

  register(sequence: string, callback: SequenceCallback): void {
    this.sequences.set(sequence, callback);
  }

  handleKey(key: string): boolean {
    const now = Date.now();

    if (now - this.lastKeyTime > this.timeout) {
      this.buffer = '';
    }

    this.buffer += key;
    this.lastKeyTime = now;

    const callback = this.sequences.get(this.buffer);
    if (callback) {
      callback();
      this.buffer = '';
      return true;
    }

    const hasPrefix = Array.from(this.sequences.keys()).some((seq) =>
      seq.startsWith(this.buffer)
    );

    if (!hasPrefix) {
      this.buffer = '';
    }

    return hasPrefix;
  }

  reset(): void {
    this.buffer = '';
  }

  getSequences(): string[] {
    return Array.from(this.sequences.keys());
  }
}
