type UpdateCallback = (deltaMs: number) => boolean;

export class AnimationLoop {
  private animating = false;
  private lastTime = 0;
  private callbacks: UpdateCallback[] = [];

  register(callback: UpdateCallback): void {
    this.callbacks.push(callback);
  }

  start(): void {
    if (this.animating) return;
    this.animating = true;
    this.lastTime = 0;
    requestAnimationFrame((t) => this.tick(t));
  }

  private tick(currentTime: number): void {
    const deltaMs = this.lastTime ? currentTime - this.lastTime : 16;
    this.lastTime = currentTime;

    const active = this.callbacks.some((cb) => cb(deltaMs));

    if (active) {
      requestAnimationFrame((t) => this.tick(t));
    } else {
      this.animating = false;
      this.lastTime = 0;
    }
  }
}
