interface SmoothScrollerConfig {
  scrollTo: (position: number) => void;
  getScroll: () => number;
  /** Minimum scroll distance for a single tap (px) */
  tapAmount: number;
  /** Scroll velocity while holding key (px per second) */
  holdVelocity: number;
  /** Interpolation factor per frame (0-1, higher = snappier) */
  lerpFactor: number;
}

export class SmoothScroller {
  private config: SmoothScrollerConfig;
  private target: number = 0;
  private currentPosition: number = 0;
  private initialized: boolean = false;
  private heldDirection: -1 | 0 | 1 = 0;

  constructor(config: SmoothScrollerConfig) {
    this.config = config;
  }

  private initialize(): void {
    if (!this.initialized) {
      const scroll = this.config.getScroll();
      this.currentPosition = scroll;
      this.target = scroll;
      this.initialized = true;
    }
  }

  private getDirection(key: string): -1 | 0 | 1 {
    // Positive: j (down), l (right)
    // Negative: k (up), h (left)
    if (key === 'j' || key === 'l') return 1;
    if (key === 'k' || key === 'h') return -1;
    return 0;
  }

  keyDown(key: string): void {
    const direction = this.getDirection(key);
    if (direction === 0) return;

    this.initialize();

    // If changing direction or starting fresh, give initial nudge
    if (this.heldDirection !== direction) {
      this.target += direction * this.config.tapAmount;
    }

    this.heldDirection = direction;
  }

  keyUp(key: string): void {
    const direction = this.getDirection(key);
    if (direction === 0) return;

    // Only clear if releasing the currently held direction
    if (this.heldDirection === direction) {
      this.heldDirection = 0;
    }
  }

  scrollBy(amount: number): void {
    this.initialize();
    this.target += amount;
  }

  scrollTo(position: number): void {
    this.initialize();
    this.target = position;
  }

  /** Call every frame with time since last frame in milliseconds */
  update(deltaMs: number): void {
    if (!this.initialized) return;

    // While key is held, continuously add to target
    if (this.heldDirection !== 0) {
      const deltaSeconds = deltaMs / 1000;
      this.target += this.heldDirection * this.config.holdVelocity * deltaSeconds;
    }

    // Interpolate toward target
    this.currentPosition =
      this.currentPosition + (this.target - this.currentPosition) * this.config.lerpFactor;

    this.config.scrollTo(this.currentPosition);
  }

  getTarget(): number {
    return this.target;
  }

  getCurrentPosition(): number {
    return this.currentPosition;
  }

  isAnimating(): boolean {
    return Math.abs(this.target - this.currentPosition) > 0.5;
  }

  isHolding(): boolean {
    return this.heldDirection !== 0;
  }
}
