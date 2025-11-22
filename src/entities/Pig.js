import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PhysicsBody } from '../physics/PhysicsBody.js';
import { HealthBar } from '../rendering/HealthBar.js';

export class Pig {
  constructor(position = { x: 0, y: 1, z: 0 }, size = 0.4, scene = null) {
    this.size = size;
    this.mesh = null;
    this.body = null;
    this.id = `pig_${Date.now()}_${Math.random()}`;
    this.isDefeated = false;
    this.health = 100;
    this.maxHealth = 100;
    this.animationTime = 0;
    this.hitTime = 0;
    this.scene = scene;
    this.healthBar = null;
    
    this.createMesh();
    this.createPhysicsBody(position);
    this.createHealthBar();
  }

  createMesh() {
    const group = new THREE.Group();
    
    // Body (sphere)
    const bodyGeometry = new THREE.SphereGeometry(this.size, 16, 16);
    const bodyMaterial = new THREE.MeshPhongMaterial({
      color: 0x90EE90,
      shininess: 30,
    });
    const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    bodyMesh.scale.y = 0.9; // Slightly flattened
    group.add(bodyMesh);

    // Snout
    const snoutGeometry = new THREE.SphereGeometry(this.size * 0.4, 12, 12);
    const snoutMaterial = new THREE.MeshPhongMaterial({ color: 0x7CCD7C });
    const snout = new THREE.Mesh(snoutGeometry, snoutMaterial);
    snout.position.set(0, 0, this.size * 0.8);
    snout.scale.z = 0.5;
    group.add(snout);

    // Nostrils
    const nostrilGeometry = new THREE.SphereGeometry(this.size * 0.08, 8, 8);
    const nostrilMaterial = new THREE.MeshPhongMaterial({ color: 0x228B22 });
    
    const leftNostril = new THREE.Mesh(nostrilGeometry, nostrilMaterial);
    leftNostril.position.set(-this.size * 0.15, 0, this.size * 1.0);
    group.add(leftNostril);
    
    const rightNostril = new THREE.Mesh(nostrilGeometry, nostrilMaterial);
    rightNostril.position.set(this.size * 0.15, 0, this.size * 1.0);
    group.add(rightNostril);

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(this.size * 0.15, 8, 8);
    const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFFFF });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-this.size * 0.3, this.size * 0.3, this.size * 0.7);
    group.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(this.size * 0.3, this.size * 0.3, this.size * 0.7);
    group.add(rightEye);

    // Pupils
    const pupilGeometry = new THREE.SphereGeometry(this.size * 0.08, 8, 8);
    const pupilMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
    
    const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    leftPupil.position.set(-this.size * 0.3, this.size * 0.3, this.size * 0.85);
    group.add(leftPupil);
    
    const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    rightPupil.position.set(this.size * 0.3, this.size * 0.3, this.size * 0.85);
    group.add(rightPupil);

    // Ears
    const earGeometry = new THREE.SphereGeometry(this.size * 0.2, 8, 8);
    const earMaterial = new THREE.MeshPhongMaterial({ color: 0x90EE90 });
    
    const leftEar = new THREE.Mesh(earGeometry, earMaterial);
    leftEar.position.set(-this.size * 0.7, this.size * 0.6, 0);
    leftEar.scale.set(0.5, 1, 0.3);
    group.add(leftEar);
    
    const rightEar = new THREE.Mesh(earGeometry, earMaterial);
    rightEar.position.set(this.size * 0.7, this.size * 0.6, 0);
    rightEar.scale.set(0.5, 1, 0.3);
    group.add(rightEar);

    this.mesh = group;
    this.mesh.userData.entity = this;
  }

  createPhysicsBody(position) {
    this.body = PhysicsBody.createSphere(this.size, 0.8, 'PIG');
    this.body.position.set(position.x, position.y, position.z);
    this.body.linearDamping = 0.5;
    this.body.angularDamping = 0.5;
    
    // Lock Z axis for 2D gameplay
    this.body.linearFactor = new CANNON.Vec3(1, 1, 0); // No Z movement
    this.body.angularFactor = new CANNON.Vec3(0, 0, 1); // Only Z rotation
    
    // Add collision event listener for force-based damage
    this.body.addEventListener('collide', (event) => {
      if (this.isDefeated) return;
      
      // Calculate impact force
      const relativeVelocity = event.contact.getImpactVelocityAlongNormal();
      const impactForce = Math.abs(relativeVelocity);
      
      // Apply damage based on force (lower threshold, higher damage multiplier)
      // Threshold: 2 (easier to damage), max damage at 10 (easier to kill)
      if (impactForce > 2) {
        const damage = Math.min((impactForce - 2) * 15, 100); // Scale: 0-100 damage (15x multiplier)
        this.takeDamage(damage);
      }
    });
  }

  createHealthBar() {
    if (this.scene) {
      this.healthBar = new HealthBar(this.maxHealth, this.size * 1.5);
      this.scene.add(this.healthBar.group);
    }
  }

  takeDamage(amount) {
    if (this.isDefeated) return false;
    
    this.health -= amount;
    this.hitTime = 0.3;
    
    // Update health bar
    if (this.healthBar) {
      this.healthBar.updateHealth(this.health, this.maxHealth);
    }
    
    if (this.health <= 0) {
      this.defeat();
      return true;
    }
    
    return false;
  }

  defeat() {
    this.isDefeated = true;
    this.isActive = false;
    
    // Turn red and shrink (animation will handle removal)
    if (this.mesh && this.mesh.children[0]) {
      this.mesh.children[0].material.color.setHex(0xFF6347);
    }
  }

  update(deltaTime) {
    if (this.isDefeated) return;
    
    // Sync mesh with physics
    if (this.body && this.mesh) {
      PhysicsBody.syncMesh(this.mesh, this.body);
    }

    // Update health bar position
    if (this.healthBar && this.healthBar.visible) {
      this.healthBar.updatePosition(this.mesh.position, { 
        x: 0, 
        y: this.size * 1.5, 
        z: 0 
      });
    }

    // Bounce animation
    this.animationTime += deltaTime;
    const bounce = Math.abs(Math.sin(this.animationTime * 2)) * 0.1 + 0.9;
    this.mesh.scale.y = bounce * 0.9; // Keep the flattened look
    this.mesh.scale.x = (2 - bounce) * 1.1; // Squash
    this.mesh.scale.z = (2 - bounce) * 1.1;

    // Hit flash
    if (this.hitTime > 0) {
      this.hitTime -= deltaTime;
      const flash = Math.floor(this.hitTime * 20) % 2;
      if (this.mesh.children[0]) {
        this.mesh.children[0].material.color.setHex(flash ? 0xFF0000 : 0x90EE90);
      }
    }

    // Check if fallen off world
    if (this.body.position.y < -10) {
      this.defeat();
    }

    // Check collision velocity for damage
    if (this.body.velocity.length() > 5) {
      this.takeDamage(10);
    }
  }

  dispose() {
    if (this.mesh) {
      this.mesh.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
    }
    
    if (this.healthBar) {
      if (this.scene) {
        this.scene.remove(this.healthBar.group);
      }
      this.healthBar.dispose();
    }
  }
}

