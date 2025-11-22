import gsap from 'gsap';
import { eventBus } from '../utils/EventBus.js';

export class CutsceneManager {
  constructor(camera, scene) {
    this.camera = camera;
    this.scene = scene;
    this.isPlaying = false;
    this.canSkip = true;
    this.skipCallback = null;
    this.overlay = null;
    
    this.createOverlay();
    this.setupSkipListener();
  }

  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 100;
      display: none;
      background: radial-gradient(circle at center, transparent 60%, rgba(0,0,0,0.3) 100%);
    `;
    
    // Title text container
    this.titleText = document.createElement('div');
    this.titleText.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 72px;
      font-weight: bold;
      text-shadow: 4px 4px 8px rgba(0,0,0,0.9);
      opacity: 0;
      white-space: nowrap;
      font-family: 'Arial Black', sans-serif;
      letter-spacing: 4px;
    `;
    this.overlay.appendChild(this.titleText);
    
    // Subtitle text
    this.subtitleText = document.createElement('div');
    this.subtitleText.style.cssText = `
      position: absolute;
      top: 60%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: rgba(255,255,255,0.9);
      font-size: 24px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
      opacity: 0;
      font-family: Arial, sans-serif;
    `;
    this.overlay.appendChild(this.subtitleText);
    
    const skipText = document.createElement('div');
    skipText.textContent = 'Click to skip';
    skipText.style.cssText = `
      position: absolute;
      bottom: 30px;
      right: 30px;
      color: rgba(255,255,255,0.8);
      font-size: 18px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
      animation: pulse 2s infinite;
      font-family: Arial, sans-serif;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { opacity: 0.4; }
        50% { opacity: 1; }
      }
      @keyframes slideIn {
        from { transform: translate(-50%, -60%); opacity: 0; }
        to { transform: translate(-50%, -50%); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    this.overlay.appendChild(skipText);
    document.body.appendChild(this.overlay);
  }

  setupSkipListener() {
    const skipHandler = () => {
      if (this.isPlaying && this.canSkip && this.skipCallback) {
        this.skipCallback();
      }
    };
    
    document.addEventListener('click', skipHandler);
    document.addEventListener('touchstart', skipHandler);
  }

  async playOpeningCutscene() {
    return new Promise((resolve) => {
      this.isPlaying = true;
      this.canSkip = true;
      this.overlay.style.display = 'block';
      
      const timeline = gsap.timeline({
        onComplete: () => {
          this.isPlaying = false;
          this.overlay.style.display = 'none';
          resolve();
        }
      });
      
      this.skipCallback = () => {
        timeline.kill();
        this.isPlaying = false;
        this.overlay.style.display = 'none';
        resolve();
      };
      
      // Save original camera position
      const originalPosition = this.camera.position.clone();
      const originalRotation = this.camera.rotation.clone();
      
      // Pan across peaceful land
      timeline.to(this.camera.position, {
        x: -15,
        y: 8,
        z: 20,
        duration: 2,
        ease: 'power1.inOut',
      });
      
      timeline.to(this.camera.rotation, {
        y: -0.3,
        duration: 2,
        ease: 'power1.inOut',
      }, '<');
      
      // Show text: "Once upon a time..."
      timeline.call(() => {
        this.showText('Once upon a time, in a peaceful land...', 2);
      });
      
      timeline.to({}, { duration: 2.5 });
      
      // Pan to eggs area
      timeline.to(this.camera.position, {
        x: -8,
        y: 3,
        z: 10,
        duration: 2,
        ease: 'power1.inOut',
      });
      
      // Show text: "The pigs stole the eggs!"
      timeline.call(() => {
        this.showText('The pigs stole the eggs! 🥚', 2);
      });
      
      timeline.to({}, { duration: 2.5 });
      
      // Zoom to angry bird face
      timeline.to(this.camera.position, {
        x: -8,
        y: 2,
        z: 5,
        duration: 1.5,
        ease: 'power2.in',
      });
      
      timeline.call(() => {
        this.showText('The birds are ANGRY! 😠', 1.5);
      });
      
      timeline.to({}, { duration: 2 });
      
      // Restore camera position
      timeline.to(this.camera.position, {
        x: originalPosition.x,
        y: originalPosition.y,
        z: originalPosition.z,
        duration: 1,
        ease: 'power1.inOut',
      });
      
      timeline.to(this.camera.rotation, {
        x: originalRotation.x,
        y: originalRotation.y,
        z: originalRotation.z,
        duration: 1,
        ease: 'power1.inOut',
      }, '<');
    });
  }

  async playLevelStartCutscene(levelData) {
    return new Promise((resolve) => {
      this.isPlaying = true;
      this.canSkip = true;
      this.overlay.style.display = 'block';
      
      const timeline = gsap.timeline({
        onComplete: () => {
          this.isPlaying = false;
          this.overlay.style.display = 'none';
          resolve();
        }
      });
      
      this.skipCallback = () => {
        timeline.kill();
        this.isPlaying = false;
        this.overlay.style.display = 'none';
        resolve();
      };
      
      const originalPosition = this.camera.position.clone();
      const originalRotation = this.camera.rotation.clone();
      
      // Pan across the level
      timeline.to(this.camera.position, {
        x: 5,
        y: 8,
        z: 15,
        duration: 2,
        ease: 'power1.inOut',
      });
      
      timeline.to(this.camera.rotation, {
        x: -0.3,
        duration: 2,
        ease: 'power1.inOut',
      }, '<');
      
      // Show level text
      timeline.call(() => {
        this.showText(`Level ${levelData.levelNumber}`, 2);
      });
      
      timeline.to({}, { duration: 2 });
      
      // Restore camera
      timeline.to(this.camera.position, {
        x: originalPosition.x,
        y: originalPosition.y,
        z: originalPosition.z,
        duration: 1,
        ease: 'power1.inOut',
      });
      
      timeline.to(this.camera.rotation, {
        x: originalRotation.x,
        y: originalRotation.y,
        z: originalRotation.z,
        duration: 1,
        ease: 'power1.inOut',
      }, '<');
    });
  }

  async playWinCutscene() {
    return new Promise((resolve) => {
      this.isPlaying = true;
      this.canSkip = true;
      this.overlay.style.display = 'block';
      
      const timeline = gsap.timeline({
        onComplete: () => {
          this.isPlaying = false;
          this.overlay.style.display = 'none';
          this.titleText.style.opacity = 0;
          this.subtitleText.style.opacity = 0;
          resolve();
        }
      });
      
      this.skipCallback = () => {
        timeline.kill();
        this.isPlaying = false;
        this.overlay.style.display = 'none';
        this.titleText.style.opacity = 0;
        this.subtitleText.style.opacity = 0;
        resolve();
      };
      
      // Zoom out with bounce
      timeline.to(this.camera.position, {
        y: '+=3',
        z: '+=5',
        duration: 1.5,
        ease: 'back.out(1.2)',
      });
      
      // Show victory text with scale animation
      this.titleText.textContent = '🎉 VICTORY! 🎉';
      this.subtitleText.textContent = 'Level Complete!';
      
      timeline.to(this.titleText, {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: 'elastic.out(1, 0.5)',
      });
      
      timeline.to(this.subtitleText, {
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out',
      }, '-=0.3');
      
      timeline.to({}, { duration: 1.5 });
    });
  }

  async playLoseCutscene() {
    return new Promise((resolve) => {
      this.isPlaying = true;
      this.canSkip = true;
      this.overlay.style.display = 'block';
      
      const timeline = gsap.timeline({
        onComplete: () => {
          this.isPlaying = false;
          this.overlay.style.display = 'none';
          this.titleText.style.opacity = 0;
          this.subtitleText.style.opacity = 0;
          resolve();
        }
      });
      
      this.skipCallback = () => {
        timeline.kill();
        this.isPlaying = false;
        this.overlay.style.display = 'none';
        this.titleText.style.opacity = 0;
        this.subtitleText.style.opacity = 0;
        resolve();
      };
      
      // Shake camera harder
      timeline.to(this.camera.position, {
        x: '+=0.3',
        y: '+=0.2',
        duration: 0.08,
        repeat: 8,
        yoyo: true,
      });
      
      // Slow motion zoom
      timeline.to(this.camera.position, {
        z: '+=2',
        duration: 1,
        ease: 'power1.out',
      });
      
      // Show defeat text with fade in
      this.titleText.textContent = '😢 DEFEAT 😢';
      this.titleText.style.color = '#ff6b6b';
      this.subtitleText.textContent = 'Try Again!';
      
      timeline.to(this.titleText, {
        opacity: 1,
        duration: 1,
        ease: 'power2.out',
      });
      
      timeline.to(this.subtitleText, {
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out',
      }, '-=0.5');
      
      timeline.to({}, { duration: 1.5 });
    });
  }

  showText(text, duration) {
    const textElement = document.createElement('div');
    textElement.textContent = text;
    textElement.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 48px;
      color: white;
      text-shadow: 4px 4px 8px rgba(0,0,0,0.8);
      font-weight: bold;
      text-align: center;
      pointer-events: none;
    `;
    
    this.overlay.appendChild(textElement);
    
    gsap.from(textElement, {
      scale: 0,
      opacity: 0,
      duration: 0.5,
      ease: 'back.out',
    });
    
    gsap.to(textElement, {
      scale: 0,
      opacity: 0,
      duration: 0.5,
      delay: duration - 0.5,
      ease: 'back.in',
      onComplete: () => {
        this.overlay.removeChild(textElement);
      }
    });
  }

  dispose() {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
  }
}

