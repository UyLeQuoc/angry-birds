import * as THREE from 'three';
import particleVertexShader from '../shaders/particle.vert?raw';
import particleFragmentShader from '../shaders/particle.frag?raw';

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.systems = [];
  }

  createExplosion(position, color = 0xFFAA00, count = 30) {
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = [];
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);

    const colorObj = new THREE.Color(color);

    for (let i = 0; i < count; i++) {
      // Random position at origin
      positions[i * 3] = position.x;
      positions[i * 3 + 1] = position.y;
      positions[i * 3 + 2] = position.z;

      // Random velocity (reduced speed: 2-5 → 1-2.5)
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 1 + Math.random() * 1.5; // Reduced from 2-5 to 1-2.5
      
      velocities.push({
        x: Math.sin(phi) * Math.cos(theta) * speed,
        y: Math.sin(phi) * Math.sin(theta) * speed,
        z: Math.cos(phi) * speed,
      });

      // Smaller size (10-30 → 6-18)
      sizes[i] = 6 + Math.random() * 12; // Reduced from 10-30 to 6-18

      // Color with variation (more subtle)
      colors[i * 3] = colorObj.r + (Math.random() - 0.5) * 0.15;
      colors[i * 3 + 1] = colorObj.g + (Math.random() - 0.5) * 0.15;
      colors[i * 3 + 2] = colorObj.b + (Math.random() - 0.5) * 0.15;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    particles.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.ShaderMaterial({
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(particles, material);
    this.scene.add(particleSystem);

    this.systems.push({
      mesh: particleSystem,
      velocities,
      life: 1.0,
      maxLife: 1.0,
    });
  }

  createTrail(position, color = 0xFFFFFF) {
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(3);
    const sizes = new Float32Array(1);
    const colors = new Float32Array(3);

    positions[0] = position.x;
    positions[1] = position.y;
    positions[2] = position.z;

    sizes[0] = 15;

    const colorObj = new THREE.Color(color);
    colors[0] = colorObj.r;
    colors[1] = colorObj.g;
    colors[2] = colorObj.b;

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    particles.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.ShaderMaterial({
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(particles, material);
    this.scene.add(particleSystem);

    this.systems.push({
      mesh: particleSystem,
      velocities: [{ x: 0, y: -0.5, z: 0 }],
      life: 0.5,
      maxLife: 0.5,
    });
  }

  createStarBurst(position, count = 10) {
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = [];
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = position.x;
      positions[i * 3 + 1] = position.y;
      positions[i * 3 + 2] = position.z;

      const angle = (i / count) * Math.PI * 2;
      const speed = 3;
      velocities.push({
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed,
        z: 0,
      });

      sizes[i] = 30;

      // Yellow star
      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = 0.8 + Math.random() * 0.2;
      colors[i * 3 + 2] = 0.0;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    particles.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.ShaderMaterial({
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(particles, material);
    this.scene.add(particleSystem);

    this.systems.push({
      mesh: particleSystem,
      velocities,
      life: 1.5,
      maxLife: 1.5,
    });
  }

  update(deltaTime) {
    for (let i = this.systems.length - 1; i >= 0; i--) {
      const system = this.systems[i];
      system.life -= deltaTime;

      if (system.life <= 0) {
        this.scene.remove(system.mesh);
        system.mesh.geometry.dispose();
        system.mesh.material.dispose();
        this.systems.splice(i, 1);
        continue;
      }

      // Update particles
      const positions = system.mesh.geometry.attributes.position.array;
      const sizes = system.mesh.geometry.attributes.size.array;
      
      for (let j = 0; j < system.velocities.length; j++) {
        positions[j * 3] += system.velocities[j].x * deltaTime;
        positions[j * 3 + 1] += system.velocities[j].y * deltaTime;
        positions[j * 3 + 2] += system.velocities[j].z * deltaTime;

        // Apply gravity
        system.velocities[j].y -= 9.8 * deltaTime;

        // Fade out
        const lifeRatio = system.life / system.maxLife;
        sizes[j] *= 0.98;
      }

      system.mesh.geometry.attributes.position.needsUpdate = true;
      system.mesh.geometry.attributes.size.needsUpdate = true;

      // Fade material
      const opacity = system.life / system.maxLife;
      system.mesh.material.opacity = opacity;
    }
  }

  clear() {
    this.systems.forEach(system => {
      this.scene.remove(system.mesh);
      system.mesh.geometry.dispose();
      system.mesh.material.dispose();
    });
    this.systems = [];
  }
}

