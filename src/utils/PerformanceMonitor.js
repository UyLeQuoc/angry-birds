/**
 * Performance monitoring utility
 * Tracks FPS and provides performance stats
 */
export class PerformanceMonitor {
  constructor() {
    this.fps = 60;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fpsUpdateInterval = 1000; // Update FPS every second
    this.enabled = false;
    this.displayElement = null;
  }

  enable(showDisplay = false) {
    this.enabled = true;
    
    if (showDisplay) {
      this.createDisplay();
    }
  }

  disable() {
    this.enabled = false;
    
    if (this.displayElement) {
      this.displayElement.remove();
      this.displayElement = null;
    }
  }

  createDisplay() {
    this.displayElement = document.createElement('div');
    this.displayElement.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      background: rgba(0, 0, 0, 0.7);
      color: #0f0;
      padding: 10px;
      font-family: monospace;
      font-size: 14px;
      border-radius: 5px;
      z-index: 10000;
      pointer-events: none;
    `;
    document.body.appendChild(this.displayElement);
  }

  update() {
    if (!this.enabled) return;
    
    this.frameCount++;
    const currentTime = performance.now();
    const elapsed = currentTime - this.lastTime;
    
    if (elapsed >= this.fpsUpdateInterval) {
      this.fps = Math.round((this.frameCount * 1000) / elapsed);
      this.frameCount = 0;
      this.lastTime = currentTime;
      
      if (this.displayElement) {
        this.displayElement.textContent = `FPS: ${this.fps}`;
      }
    }
  }

  getFPS() {
    return this.fps;
  }
}

