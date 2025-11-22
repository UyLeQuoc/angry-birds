import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PhysicsBody } from '../physics/PhysicsBody.js';
import { BLOCK_TYPES, COLORS } from '../utils/Constants.js';
import { HealthBar } from '../rendering/HealthBar.js';

export class Block {
  constructor(type, position = { x: 0, y: 0, z: 0 }, assetLoader, scene) {
    this.type = type;
    this.config = BLOCK_TYPES[type];
    this.mesh = null;
    this.body = null;
    this.id = `block_${Date.now()}_${Math.random()}`;
    this.isDestroyed = false;
    this.health = this.config.hp;
    this.maxHealth = this.config.hp;
    this.assetLoader = assetLoader;
    this.hitTime = 0;
    this.scene = scene;
    this.healthBar = null;
    
    this.createMesh();
    this.createPhysicsBody(position);
    this.createHealthBar();
  }

  createMesh() {
    const { width, height, depth, material } = this.config;
    
    const geometry = new THREE.BoxGeometry(width, height, depth);
    
    let meshMaterial;
    if (this.assetLoader) {
      const textureName = material.toLowerCase();
      meshMaterial = this.assetLoader.getMaterial(textureName);
    } else {
      // Fallback colors
      const colorMap = {
        'WOOD': COLORS.WOOD,
        'STONE': COLORS.STONE,
        'GLASS': COLORS.GLASS,
      };
      meshMaterial = new THREE.MeshPhongMaterial({ 
        color: colorMap[material] || 0xFFFFFF 
      });
    }
    
    this.mesh = new THREE.Mesh(geometry, meshMaterial);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.userData.entity = this;
  }

  createPhysicsBody(position) {
    const { width, height, depth, material } = this.config;
    const mass = width * height * depth * (material === 'STONE' ? 2 : material === 'GLASS' ? 0.5 : 1);
    
    this.body = PhysicsBody.createBox(width, height, depth, mass, material);
    this.body.position.set(position.x, position.y, position.z);
    
    // Set to sleep initially to prevent falling
    this.body.sleep();
    this.body.allowSleep = true;
    this.body.sleepSpeedLimit = 0.05; // Reduced from 0.1 - blocks wake up less easily
    this.body.sleepTimeLimit = 0.05;   // Reduced - blocks sleep faster
    
    // Increase damping to prevent jitter
    this.body.linearDamping = 0.3;   // Added
    this.body.angularDamping = 0.3;  // Added
    
    // Lock Z axis for 2D gameplay
    this.body.linearFactor = new CANNON.Vec3(1, 1, 0); // No Z movement
    this.body.angularFactor = new CANNON.Vec3(0, 0, 1); // Only Z rotation
    
    if (position.rotation) {
      this.body.quaternion.setFromEuler(
        position.rotation.x || 0,
        position.rotation.y || 0,
        position.rotation.z || 0
      );
    }
  }

  createHealthBar() {
    if (this.scene) {
      this.healthBar = new HealthBar(this.maxHealth, this.config.width);
      this.scene.add(this.healthBar.group);
    }
  }

  takeDamage(amount) {
    if (this.isDestroyed) return false;
    
    this.health -= amount;
    this.hitTime = 0.2;
    
    // Update health bar
    if (this.healthBar) {
      this.healthBar.updateHealth(this.health, this.maxHealth);
    }
    
    if (this.health <= 0) {
      this.destroy();
      return true;
    }
    
    return false;
  }

  destroy() {
    this.isDestroyed = true;
  }

  update(deltaTime) {
    if (this.isDestroyed) return;
    
    // Sync mesh with physics
    if (this.body && this.mesh) {
      PhysicsBody.syncMesh(this.mesh, this.body);
    }

    // Update health bar position
    if (this.healthBar && this.healthBar.visible) {
      this.healthBar.updatePosition(this.mesh.position, { 
        x: 0, 
        y: this.config.height / 2 + 0.3, 
        z: 0 
      });
    }

    // Hit flash
    if (this.hitTime > 0) {
      this.hitTime -= deltaTime;
      const flash = Math.floor(this.hitTime * 20) % 2;
      if (flash && this.mesh.material) {
        this.mesh.material.emissive = new THREE.Color(0xFF0000);
        this.mesh.material.emissiveIntensity = 0.5;
      } else if (this.mesh.material) {
        this.mesh.material.emissive = new THREE.Color(0x000000);
        this.mesh.material.emissiveIntensity = 0;
      }
    }

    // Damage based on collision velocity
    const velocity = this.body.velocity.length();
    if (velocity > 8) {
      this.takeDamage(20);
    } else if (velocity > 5) {
      this.takeDamage(5);
    }

    // Check if fallen off world
    if (this.body.position.y < -10) {
      this.destroy();
    }
  }

  dispose() {
    if (this.mesh) {
      if (this.mesh.geometry) this.mesh.geometry.dispose();
      // Don't dispose material as it's shared from asset loader
    }
    
    if (this.healthBar) {
      if (this.scene) {
        this.scene.remove(this.healthBar.group);
      }
      this.healthBar.dispose();
    }
  }
}

