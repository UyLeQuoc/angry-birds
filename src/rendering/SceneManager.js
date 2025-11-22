import * as THREE from 'three';
import skyVertexShader from '../shaders/sky.vert?raw';
import skyFragmentShader from '../shaders/sky.frag?raw';
import { CloudManager } from './CloudManager.js';

export class SceneManager {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.skyMaterial = null;
    this.parallaxLayers = [];
    this.cloudManager = null;
    this.initialize();
  }

  initialize() {
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x87CEEB, 50, 200);

    // Create camera
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
    this.camera.position.set(0, 5, 15);
    this.camera.lookAt(0, 3, 0);

    // Create renderer
    const canvas = document.getElementById('game-canvas');
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Setup lights
    this.setupLights();

    // Create shader background
    this.createShaderBackground();

    // Create parallax layers
    this.createParallaxLayers();

    // Create cloud manager
    this.cloudManager = new CloudManager(this.scene);

    // Create sun
    this.createSun();

    // Handle window resize
    window.addEventListener('resize', () => this.onResize());
  }

  setupLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    
    // Shadow settings
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -30;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = -30;
    
    this.scene.add(directionalLight);
  }

  createShaderBackground() {
    const geometry = new THREE.PlaneGeometry(200, 100);
    
    this.skyMaterial = new THREE.ShaderMaterial({
      vertexShader: skyVertexShader,
      fragmentShader: skyFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColorTop: { value: new THREE.Color(0x87CEEB) },
        uColorBottom: { value: new THREE.Color(0xE0F6FF) },
      },
      side: THREE.DoubleSide,
    });

    const skyMesh = new THREE.Mesh(geometry, this.skyMaterial);
    skyMesh.position.set(0, 10, -30);
    skyMesh.renderOrder = -1;
    this.scene.add(skyMesh);
  }

  createSun() {
    // Sun group
    const sunGroup = new THREE.Group();
    
    // Main sun sphere
    const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
    const sunMaterial = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0xFFF4E6) },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor;
        varying vec2 vUv;
        varying vec3 vNormal;
        
        void main() {
          // Bright center, subtle edge darkening
          float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
          vec3 color = uColor * (0.9 + fresnel * 0.1);
          
          // Slight pulsing
          float pulse = 0.95 + sin(uTime * 2.0) * 0.05;
          color *= pulse;
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
    
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sunGroup.add(sun);
    
    // Glow layers (multiple for softer effect)
    for (let i = 1; i <= 3; i++) {
      const glowSize = 2 + i * 0.8;
      const glowGeometry = new THREE.SphereGeometry(glowSize, 32, 32);
      const glowMaterial = new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.BackSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uIntensity: { value: 0.3 / i },
        },
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform float uIntensity;
          varying vec3 vNormal;
          
          void main() {
            float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
            vec3 glowColor = vec3(1.0, 0.9, 0.7); // Warm yellow-orange
            
            // Subtle shimmer
            float shimmer = 0.95 + sin(uTime * 3.0 + float(${i})) * 0.05;
            
            gl_FragColor = vec4(glowColor, intensity * uIntensity * shimmer);
          }
        `,
      });
      
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      sunGroup.add(glow);
    }
    
    // Corona (outer glow ring)
    const coronaGeometry = new THREE.RingGeometry(3, 5, 32);
    const coronaMaterial = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        varying vec2 vUv;
        
        void main() {
          // Radial gradient from center
          float dist = length(vUv - 0.5) * 2.0;
          float alpha = smoothstep(1.0, 0.0, dist) * 0.15;
          
          // Rotating rays effect
          float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
          float rays = sin(angle * 8.0 + uTime) * 0.5 + 0.5;
          alpha *= 0.7 + rays * 0.3;
          
          vec3 color = vec3(1.0, 0.95, 0.8);
          gl_FragColor = vec4(color, alpha);
        }
      `,
    });
    
    const corona = new THREE.Mesh(coronaGeometry, coronaMaterial);
    sunGroup.add(corona);
    
    // Position sun (top right of sky)
    sunGroup.position.set(15, 15, -25);
    sunGroup.renderOrder = -2; // Behind sky shader
    
    this.scene.add(sunGroup);
    this.sun = sunGroup;
    this.sunMaterials = [sunMaterial, ...sunGroup.children.slice(1).map(child => child.material)];
  }

  createParallaxLayers() {
    // Distant snow-capped mountains (most realistic)
    const distantMountainsGeometry = this.createRealisticMountainGeometry(120, 18);
    
    // Gradient material for mountains (darker at base, lighter at peak)
    const distantMountainsMaterial = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      uniforms: {
        uColorBase: { value: new THREE.Color(0x5B7A99) },
        uColorPeak: { value: new THREE.Color(0xB8C9D9) },
        uColorSnow: { value: new THREE.Color(0xE8F0F8) },
        uHeight: { value: 18 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying float vHeight;
        void main() {
          vUv = uv;
          vHeight = position.y;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColorBase;
        uniform vec3 uColorPeak;
        uniform vec3 uColorSnow;
        uniform float uHeight;
        varying vec2 vUv;
        varying float vHeight;
        void main() {
          float heightFactor = vHeight / uHeight;
          vec3 color;
          
          if (heightFactor > 0.7) {
            // Snow on peaks
            float snowMix = (heightFactor - 0.7) / 0.3;
            color = mix(uColorPeak, uColorSnow, snowMix);
          } else if (heightFactor > 0.3) {
            // Middle transition
            float midMix = (heightFactor - 0.3) / 0.4;
            color = mix(uColorBase, uColorPeak, midMix);
          } else {
            // Base
            color = uColorBase;
          }
          
          gl_FragColor = vec4(color, 0.5);
        }
      `,
    });
    
    const distantMountains = new THREE.Mesh(distantMountainsGeometry, distantMountainsMaterial);
    distantMountains.position.set(0, 2, -35);
    distantMountains.userData.parallaxSpeed = 0.05;
    this.scene.add(distantMountains);
    this.parallaxLayers.push(distantMountains);

    // Far hills with detailed terrain
    const farHillsGeometry = this.createDetailedHillGeometry(95, 12);
    const farHillsMaterial = new THREE.MeshLambertMaterial({
      color: 0x5A9B4A,
      transparent: true,
      opacity: 0.7,
      flatShading: true, // For faceted look
    });
    const farHills = new THREE.Mesh(farHillsGeometry, farHillsMaterial);
    farHills.position.set(0, -1, -22);
    farHills.userData.parallaxSpeed = 0.12;
    farHills.receiveShadow = true;
    this.scene.add(farHills);
    this.parallaxLayers.push(farHills);

    // Near hills with grass texture
    const nearHillsGeometry = this.createDetailedHillGeometry(75, 10);
    const nearHillsMaterial = new THREE.MeshLambertMaterial({
      color: 0x4A8B3A,
      transparent: true,
      opacity: 0.85,
      flatShading: true,
    });
    const nearHills = new THREE.Mesh(nearHillsGeometry, nearHillsMaterial);
    nearHills.position.set(0, -0.5, -12);
    nearHills.userData.parallaxSpeed = 0.2;
    nearHills.receiveShadow = true;
    this.scene.add(nearHills);
    this.parallaxLayers.push(nearHills);
    
    // Foreground detailed bushes
    const bushesGeometry = this.createDetailedBushGeometry(55, 4);
    const bushesMaterial = new THREE.MeshLambertMaterial({
      color: 0x3A7A2A,
      transparent: true,
      opacity: 0.9,
      flatShading: true,
    });
    const bushes = new THREE.Mesh(bushesGeometry, bushesMaterial);
    bushes.position.set(0, -0.2, -5);
    bushes.userData.parallaxSpeed = 0.35;
    this.scene.add(bushes);
    this.parallaxLayers.push(bushes);
  }

  createRealisticMountainGeometry(width, height) {
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2, 0);
    
    const segments = 80; // Much more detail
    const peaks = [];
    
    // Generate random peaks
    for (let i = 0; i < 5; i++) {
      peaks.push({
        position: 0.15 + i * 0.15 + (Math.random() - 0.5) * 0.1,
        height: 0.6 + Math.random() * 0.4,
        sharpness: 2 + Math.random() * 3,
      });
    }
    
    for (let i = 0; i <= segments; i++) {
      const x = (-width / 2) + (width / segments) * i;
      const t = i / segments;
      
      let y = 0;
      
      // Combine multiple peaks
      peaks.forEach(peak => {
        const dist = Math.abs(t - peak.position);
        const peakHeight = Math.pow(Math.max(0, 1 - dist * peak.sharpness), 2) * height * peak.height;
        y = Math.max(y, peakHeight);
      });
      
      // Add noise for rocky texture
      const noise = 
        Math.sin(t * Math.PI * 20) * height * 0.02 +
        Math.sin(t * Math.PI * 40 + 1.5) * height * 0.015 +
        Math.sin(t * Math.PI * 60 + 3) * height * 0.01;
      
      y += noise;
      
      shape.lineTo(x, y);
    }
    
    shape.lineTo(width / 2, 0);
    shape.lineTo(-width / 2, 0);

    const geometry = new THREE.ShapeGeometry(shape);
    return geometry;
  }

  createDetailedHillGeometry(width, height) {
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2, 0);
    
    const segments = 60; // Higher detail
    
    for (let i = 0; i <= segments; i++) {
      const x = (-width / 2) + (width / segments) * i;
      const t = i / segments;
      
      // Smooth rolling hills with varied frequencies
      const y = 
        Math.sin(t * Math.PI * 2 + 0.5) * height * 0.3 +
        Math.sin(t * Math.PI * 3.5) * height * 0.2 +
        Math.sin(t * Math.PI * 5 + 2) * height * 0.15 +
        Math.sin(t * Math.PI * 8) * height * 0.08 +
        height * 0.4;
      
      // Add small terrain variations
      const detail = 
        Math.sin(t * Math.PI * 25) * height * 0.03 +
        Math.sin(t * Math.PI * 40 + 1) * height * 0.02;
      
      shape.lineTo(x, y + detail);
    }
    
    shape.lineTo(width / 2, 0);
    shape.lineTo(-width / 2, 0);

    const geometry = new THREE.ShapeGeometry(shape);
    return geometry;
  }

  createDetailedBushGeometry(width, height) {
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2, 0);
    
    const segments = 80; // Very detailed for foreground
    
    for (let i = 0; i <= segments; i++) {
      const x = (-width / 2) + (width / segments) * i;
      const t = i / segments;
      
      // Multiple layers of bumps for bush texture
      const y = 
        Math.abs(Math.sin(t * Math.PI * 12 + 0.3)) * height * 0.35 +
        Math.abs(Math.sin(t * Math.PI * 18 + 1.2)) * height * 0.25 +
        Math.abs(Math.sin(t * Math.PI * 25 + 2.1)) * height * 0.18 +
        Math.abs(Math.sin(t * Math.PI * 35)) * height * 0.12 +
        height * 0.2;
      
      shape.lineTo(x, y);
    }
    
    shape.lineTo(width / 2, 0);
    shape.lineTo(-width / 2, 0);

    const geometry = new THREE.ShapeGeometry(shape);
    return geometry;
  }

  updateParallax(cameraX) {
    this.parallaxLayers.forEach(layer => {
      layer.position.x = -cameraX * layer.userData.parallaxSpeed;
    });
  }

  update(deltaTime, time) {
    if (this.skyMaterial) {
      this.skyMaterial.uniforms.uTime.value = time;
    }
    
    // Update sun animations
    if (this.sunMaterials) {
      this.sunMaterials.forEach(material => {
        if (material.uniforms.uTime) {
          material.uniforms.uTime.value = time;
        }
      });
    }
    
    // Subtle sun rotation
    if (this.sun) {
      this.sun.rotation.z = time * 0.05;
    }
    
    // Update clouds
    if (this.cloudManager) {
      this.cloudManager.update(deltaTime);
    }
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  add(object) {
    this.scene.add(object);
  }

  remove(object) {
    this.scene.remove(object);
  }

  getCamera() {
    return this.camera;
  }

  getScene() {
    return this.scene;
  }

  dispose() {
    this.renderer.dispose();
    
    // Dispose clouds
    if (this.cloudManager) {
      this.cloudManager.dispose();
    }
    
    this.scene.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
  }
}

