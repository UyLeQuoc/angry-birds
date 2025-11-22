import * as THREE from 'three';

export class AssetLoader {
  constructor() {
    this.textureLoader = new THREE.TextureLoader();
    this.loadingManager = new THREE.LoadingManager();
    this.textures = new Map();
    this.materials = new Map();
    
    this.setupLoadingManager();
  }

  setupLoadingManager() {
    this.loadingManager.onProgress = (url, loaded, total) => {
      const progress = (loaded / total) * 100;
      const progressBar = document.getElementById('loading-progress');
      if (progressBar) {
        progressBar.style.width = `${progress}%`;
      }
    };
  }

  async loadAssets() {
    // Create procedural textures
    this.createProceduralTextures();
    
    // Load any external assets (placeholder for now)
    return Promise.resolve();
  }

  createProceduralTextures() {
    // Wood texture
    const woodCanvas = document.createElement('canvas');
    woodCanvas.width = 256;
    woodCanvas.height = 256;
    const woodCtx = woodCanvas.getContext('2d');
    
    const woodGradient = woodCtx.createLinearGradient(0, 0, 256, 0);
    woodGradient.addColorStop(0, '#8B4513');
    woodGradient.addColorStop(0.5, '#A0522D');
    woodGradient.addColorStop(1, '#8B4513');
    woodCtx.fillStyle = woodGradient;
    woodCtx.fillRect(0, 0, 256, 256);
    
    // Add wood grain
    for (let i = 0; i < 20; i++) {
      woodCtx.strokeStyle = `rgba(0, 0, 0, ${Math.random() * 0.2})`;
      woodCtx.lineWidth = Math.random() * 3;
      woodCtx.beginPath();
      woodCtx.moveTo(0, Math.random() * 256);
      woodCtx.lineTo(256, Math.random() * 256);
      woodCtx.stroke();
    }
    
    const woodTexture = new THREE.CanvasTexture(woodCanvas);
    this.textures.set('wood', woodTexture);
    
    // Stone texture
    const stoneCanvas = document.createElement('canvas');
    stoneCanvas.width = 256;
    stoneCanvas.height = 256;
    const stoneCtx = stoneCanvas.getContext('2d');
    
    stoneCtx.fillStyle = '#808080';
    stoneCtx.fillRect(0, 0, 256, 256);
    
    // Add noise
    for (let i = 0; i < 1000; i++) {
      stoneCtx.fillStyle = `rgba(${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 100}, 0.3)`;
      stoneCtx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
    }
    
    const stoneTexture = new THREE.CanvasTexture(stoneCanvas);
    this.textures.set('stone', stoneTexture);
    
    // Glass texture (semi-transparent)
    const glassCanvas = document.createElement('canvas');
    glassCanvas.width = 256;
    glassCanvas.height = 256;
    const glassCtx = glassCanvas.getContext('2d');
    
    glassCtx.fillStyle = '#ADD8E6';
    glassCtx.fillRect(0, 0, 256, 256);
    
    // Add highlights
    glassCtx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    glassCtx.fillRect(10, 10, 100, 100);
    
    const glassTexture = new THREE.CanvasTexture(glassCanvas);
    this.textures.set('glass', glassTexture);
    
    // Ground texture - Beautiful grass
    const groundCanvas = document.createElement('canvas');
    groundCanvas.width = 512;
    groundCanvas.height = 512;
    const groundCtx = groundCanvas.getContext('2d');
    
    // Base dirt color
    groundCtx.fillStyle = '#6B5839';
    groundCtx.fillRect(0, 0, 512, 512);
    
    // Add varied grass patches
    for (let i = 0; i < 800; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const size = Math.random() * 4 + 2;
      
      // Different shades of green
      const greenShades = ['#4A8B3A', '#5A9B4A', '#3A7A2A', '#6BAA5A'];
      groundCtx.fillStyle = greenShades[Math.floor(Math.random() * greenShades.length)];
      groundCtx.globalAlpha = Math.random() * 0.6 + 0.4;
      
      // Random grass blade shapes
      if (Math.random() > 0.5) {
        groundCtx.fillRect(x, y, size, size);
      } else {
        groundCtx.beginPath();
        groundCtx.arc(x, y, size / 2, 0, Math.PI * 2);
        groundCtx.fill();
      }
    }
    
    // Add small flowers
    groundCtx.globalAlpha = 1;
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      
      // Flower colors
      const flowerColors = ['#FFD700', '#FF69B4', '#FF4444', '#FFFFFF'];
      groundCtx.fillStyle = flowerColors[Math.floor(Math.random() * flowerColors.length)];
      
      groundCtx.beginPath();
      groundCtx.arc(x, y, 2, 0, Math.PI * 2);
      groundCtx.fill();
    }
    
    // Add dirt patches for variety
    groundCtx.globalAlpha = 0.3;
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      groundCtx.fillStyle = '#5A4A2A';
      groundCtx.fillRect(x, y, Math.random() * 10 + 5, Math.random() * 10 + 5);
    }
    
    groundCtx.globalAlpha = 1;
    
    const groundTexture = new THREE.CanvasTexture(groundCanvas);
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(10, 10);
    this.textures.set('ground', groundTexture);
  }

  getTexture(name) {
    return this.textures.get(name);
  }

  getMaterial(name, options = {}) {
    const key = `${name}_${JSON.stringify(options)}`;
    
    if (this.materials.has(key)) {
      return this.materials.get(key);
    }

    const texture = this.getTexture(name);
    let material;

    if (name === 'glass') {
      material = new THREE.MeshPhongMaterial({
        color: 0xADD8E6,
        map: texture,
        transparent: true,
        opacity: 0.6,
        shininess: 100,
        ...options
      });
    } else {
      material = new THREE.MeshPhongMaterial({
        map: texture,
        ...options
      });
    }

    this.materials.set(key, material);
    return material;
  }

  dispose() {
    this.textures.forEach(texture => texture.dispose());
    this.materials.forEach(material => material.dispose());
    this.textures.clear();
    this.materials.clear();
  }
}

