import * as THREE from 'three';

export class HealthBar {
  constructor(maxHealth, size = 0.5) {
    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;
    this.size = size;
    this.visible = false;
    
    this.create();
  }

  create() {
    this.group = new THREE.Group();
    
    // Black background/shadow for contrast
    const shadowGeometry = new THREE.PlaneGeometry(this.size + 0.04, 0.14);
    const shadowMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x000000,
      transparent: true,
      opacity: 0.5,
      depthTest: false,
    });
    const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
    shadow.position.z = -0.01;
    this.group.add(shadow);
    
    // Background (dark red)
    const bgGeometry = new THREE.PlaneGeometry(this.size, 0.1);
    const bgMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x8B0000,
      transparent: true,
      opacity: 0.9,
      depthTest: false,
    });
    this.background = new THREE.Mesh(bgGeometry, bgMaterial);
    this.group.add(this.background);
    
    // Foreground (bright green - actual health)
    const fgGeometry = new THREE.PlaneGeometry(this.size, 0.1);
    const fgMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x00FF00,
      transparent: true,
      opacity: 1.0,
      depthTest: false,
    });
    this.foreground = new THREE.Mesh(fgGeometry, fgMaterial);
    this.foreground.position.z = 0.01; // Slightly in front
    this.group.add(this.foreground);
    
    // White border for better visibility
    const borderGeometry = new THREE.PlaneGeometry(this.size + 0.02, 0.12);
    const borderEdges = new THREE.EdgesGeometry(borderGeometry);
    const borderMaterial = new THREE.LineBasicMaterial({ 
      color: 0xFFFFFF,
      linewidth: 3,
      depthTest: false,
    });
    this.border = new THREE.LineSegments(borderEdges, borderMaterial);
    this.border.position.z = 0.02;
    this.group.add(this.border);
    
    this.group.renderOrder = 999; // Render on top
    this.group.visible = false;
  }

  updateHealth(current, max = this.maxHealth) {
    this.currentHealth = current;
    this.maxHealth = max;
    
    const healthPercent = Math.max(0, Math.min(1, current / max));
    
    // Scale foreground
    this.foreground.scale.x = healthPercent;
    
    // Move to keep left-aligned
    this.foreground.position.x = -(this.size / 2) * (1 - healthPercent);
    
    // Color based on health
    if (healthPercent > 0.6) {
      this.foreground.material.color.setHex(0x00FF00); // Green
    } else if (healthPercent > 0.3) {
      this.foreground.material.color.setHex(0xFFAA00); // Orange
    } else {
      this.foreground.material.color.setHex(0xFF0000); // Red
    }
    
    // Show bar when damaged
    if (healthPercent < 1.0) {
      this.show();
    }
  }

  show() {
    this.visible = true;
    this.group.visible = true;
  }

  hide() {
    this.visible = false;
    this.group.visible = false;
  }

  updatePosition(entityPosition, offset = { x: 0, y: 0.8, z: 0 }) {
    this.group.position.set(
      entityPosition.x + offset.x,
      entityPosition.y + offset.y,
      entityPosition.z + offset.z
    );
    
    // Always face camera (billboard effect)
    this.group.rotation.set(0, 0, 0);
  }

  dispose() {
    this.background.geometry.dispose();
    this.background.material.dispose();
    this.foreground.geometry.dispose();
    this.foreground.material.dispose();
    this.border.geometry.dispose();
    this.border.material.dispose();
  }
}

