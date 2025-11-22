import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PhysicsBody } from '../physics/PhysicsBody.js';
import { BIRD_TYPES } from '../utils/Constants.js';

export class Bird {
  constructor(type = 'RED', position = { x: 0, y: 1, z: 0 }) {
    this.type = type;
    this.config = BIRD_TYPES[type];
    this.mesh = null;
    this.body = null;
    this.id = `bird_${Date.now()}_${Math.random()}`;
    this.isLaunched = false;
    this.isActive = false;
    this.abilityUsed = false;
    this.animationTime = 0;
    this.eyeBlinkTime = 0;
    this.eyeBlinkDuration = 0;
    
    this.createMesh();
    this.createPhysicsBody(position);
  }

  createMesh() {
    const group = new THREE.Group();
    
    // Main body with better shading
    const bodyGeometry = new THREE.SphereGeometry(this.config.radius, 32, 32);
    const bodyMaterial = new THREE.MeshPhongMaterial({
      color: this.config.color,
      shininess: 60,
      specular: 0x444444,
      flatShading: false,
    });
    const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    group.add(bodyMesh);
    
    // Belly (lighter colored)
    const bellyColor = new THREE.Color(this.config.color).lerp(new THREE.Color(0xFFFFFF), 0.4);
    const bellyGeometry = new THREE.SphereGeometry(this.config.radius * 0.7, 24, 24);
    const bellyMaterial = new THREE.MeshPhongMaterial({
      color: bellyColor,
      shininess: 50,
    });
    const belly = new THREE.Mesh(bellyGeometry, bellyMaterial);
    belly.position.set(0, -this.config.radius * 0.2, this.config.radius * 0.5);
    belly.scale.set(0.9, 0.8, 0.6);
    group.add(belly);

    // Eyes (larger and more expressive)
    const eyeGeometry = new THREE.SphereGeometry(this.config.radius * 0.25, 16, 16);
    const eyeMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xFFFFFF,
      shininess: 100,
    });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-this.config.radius * 0.35, this.config.radius * 0.25, this.config.radius * 0.75);
    leftEye.scale.set(1, 1, 0.8);
    group.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(this.config.radius * 0.35, this.config.radius * 0.25, this.config.radius * 0.75);
    rightEye.scale.set(1, 1, 0.8);
    group.add(rightEye);
    
    // Eye outlines (dark rings)
    const eyeRingGeometry = new THREE.TorusGeometry(this.config.radius * 0.25, this.config.radius * 0.04, 8, 16);
    const eyeRingMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
    
    const leftEyeRing = new THREE.Mesh(eyeRingGeometry, eyeRingMaterial);
    leftEyeRing.position.copy(leftEye.position);
    leftEyeRing.position.z += 0.01;
    leftEyeRing.rotation.y = Math.PI / 2;
    group.add(leftEyeRing);
    
    const rightEyeRing = new THREE.Mesh(eyeRingGeometry, eyeRingMaterial);
    rightEyeRing.position.copy(rightEye.position);
    rightEyeRing.position.z += 0.01;
    rightEyeRing.rotation.y = Math.PI / 2;
    group.add(rightEyeRing);

    // Pupils (larger)
    const pupilGeometry = new THREE.SphereGeometry(this.config.radius * 0.12, 12, 12);
    const pupilMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
    
    const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    leftPupil.position.set(-this.config.radius * 0.35, this.config.radius * 0.25, this.config.radius * 0.95);
    group.add(leftPupil);
    
    const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    rightPupil.position.set(this.config.radius * 0.35, this.config.radius * 0.25, this.config.radius * 0.95);
    group.add(rightPupil);
    
    // Highlights in eyes
    const highlightGeometry = new THREE.SphereGeometry(this.config.radius * 0.05, 8, 8);
    const highlightMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    
    const leftHighlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
    leftHighlight.position.set(-this.config.radius * 0.32, this.config.radius * 0.32, this.config.radius * 1.0);
    group.add(leftHighlight);
    
    const rightHighlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
    rightHighlight.position.set(this.config.radius * 0.38, this.config.radius * 0.32, this.config.radius * 1.0);
    group.add(rightHighlight);

    // Better beak (more triangular)
    const beakGeometry = new THREE.ConeGeometry(this.config.radius * 0.25, this.config.radius * 0.5, 4);
    const beakMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xFFA500,
      shininess: 40,
    });
    const beak = new THREE.Mesh(beakGeometry, beakMaterial);
    beak.rotation.x = Math.PI / 2;
    beak.rotation.z = Math.PI / 4; // Rotate to make diamond shape
    beak.position.set(0, -this.config.radius * 0.1, this.config.radius * 0.85);
    group.add(beak);

    // Eyebrows (for angry look)
    if (this.type === 'RED') {
      const eyebrowGeometry = new THREE.BoxGeometry(this.config.radius * 0.55, 0.08, 0.06);
      const eyebrowMaterial = new THREE.MeshPhongMaterial({ color: 0x8B0000 });
      
      const leftEyebrow = new THREE.Mesh(eyebrowGeometry, eyebrowMaterial);
      leftEyebrow.position.set(-this.config.radius * 0.35, this.config.radius * 0.52, this.config.radius * 0.7);
      leftEyebrow.rotation.z = -0.4;
      group.add(leftEyebrow);
      
      const rightEyebrow = new THREE.Mesh(eyebrowGeometry, eyebrowMaterial);
      rightEyebrow.position.set(this.config.radius * 0.35, this.config.radius * 0.52, this.config.radius * 0.7);
      rightEyebrow.rotation.z = 0.4;
      group.add(rightEyebrow);
    }
    
    // Add crest/feathers for YELLOW bird
    if (this.type === 'YELLOW') {
      const crestGeometry = new THREE.ConeGeometry(this.config.radius * 0.15, this.config.radius * 0.4, 4);
      const crestMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xFFD700,
        shininess: 50,
      });
      const crest = new THREE.Mesh(crestGeometry, crestMaterial);
      crest.position.set(0, this.config.radius * 0.8, 0);
      crest.rotation.z = Math.PI / 4;
      group.add(crest);
    }
    
    // Add fuse for BOMB bird
    if (this.type === 'BOMB') {
      const fuseGeometry = new THREE.CylinderGeometry(0.03, 0.03, this.config.radius * 0.4, 8);
      const fuseMaterial = new THREE.MeshPhongMaterial({ color: 0x654321 });
      const fuse = new THREE.Mesh(fuseGeometry, fuseMaterial);
      fuse.position.set(0, this.config.radius * 1.2, 0);
      group.add(fuse);
      
      // Spark at tip
      const sparkGeometry = new THREE.SphereGeometry(0.06, 8, 8);
      const sparkMaterial = new THREE.MeshBasicMaterial({ color: 0xFF4500 });
      const spark = new THREE.Mesh(sparkGeometry, sparkMaterial);
      spark.position.set(0, this.config.radius * 1.4, 0);
      group.add(spark);
    }

    this.mesh = group;
    this.mesh.userData.entity = this;
  }

  createPhysicsBody(position) {
    this.body = PhysicsBody.createSphere(this.config.radius, 1, 'BIRD');
    this.body.position.set(position.x, position.y, position.z);
    this.body.linearDamping = 0.1;
    this.body.angularDamping = 0.5;
    this.body.sleepSpeedLimit = 0.5;
    this.body.sleepTimeLimit = 1;
    this.body.allowSleep = true;
    
    // Lock Z axis to keep 2D gameplay in 3D world
    this.body.linearFactor = new CANNON.Vec3(1, 1, 0); // No Z movement
    this.body.angularFactor = new CANNON.Vec3(0, 0, 1); // Only Z rotation
  }

  launch(velocity) {
    this.isLaunched = true;
    this.isActive = true;
    this.body.velocity.set(velocity.x, velocity.y, velocity.z);
    this.body.wakeUp();
  }

  useAbility() {
    if (this.abilityUsed || !this.isActive) return null;
    
    this.abilityUsed = true;
    
    switch (this.config.ability) {
      case 'split':
        return { type: 'split', count: 3 };
      case 'explode':
        return { type: 'explode', radius: 3, force: 10 };
      case 'dash':
        return { type: 'dash', multiplier: 2 };
      default:
        return null;
    }
  }

  update(deltaTime) {
    // Sync mesh with physics
    if (this.body && this.mesh) {
      // If not launched (in slingshot), force exact position sync
      if (!this.isLaunched) {
        this.mesh.position.copy(this.body.position);
        this.mesh.quaternion.copy(this.body.quaternion);
      } else {
        PhysicsBody.syncMesh(this.mesh, this.body);
      }
    }

    // Idle animation (bob up and down slightly)
    if (!this.isLaunched) {
      this.animationTime += deltaTime;
      const offset = Math.sin(this.animationTime * 2) * 0.05;
      this.mesh.position.y += offset;
    }

    // Squash and stretch during launch - VERY SUBTLE to keep bird visible
    if (this.isLaunched && this.isActive) {
      const speed = this.body.velocity.length();
      
      if (speed > 0.5) {
        // MINIMAL stretch - bird must stay visible!
        const stretchFactor = Math.min(speed * 0.02, 0.1); // Reduced from 0.05
        
        // Keep scale close to 1.0
        this.mesh.scale.set(
          1.0 - stretchFactor * 0.1,  // Very subtle
          1.0 + stretchFactor * 0.2,  // Very subtle
          1.0 - stretchFactor * 0.1   // Very subtle
        );
        
        // Don't rotate in Z - keep bird facing forward in 2D plane
        this.mesh.rotation.z = 0;
      } else {
        // Reset scale when slow
        this.mesh.scale.set(1, 1, 1);
        this.mesh.rotation.z = 0;
      }
    } else if (!this.isLaunched) {
      // Ensure scale is normal when not launched
      this.mesh.scale.set(1, 1, 1);
      this.mesh.rotation.z = 0;
    }

    // Eye blink animation
    this.eyeBlinkTime += deltaTime;
    if (this.eyeBlinkTime > 3 + Math.random() * 2) {
      this.eyeBlinkTime = 0;
      this.eyeBlinkDuration = 0.2;
    }
    
    if (this.eyeBlinkDuration > 0) {
      this.eyeBlinkDuration -= deltaTime;
      // Scale eyes vertically to simulate blink
      if (this.mesh.children[1] && this.mesh.children[2]) {
        this.mesh.children[1].scale.y = 0.1;
        this.mesh.children[2].scale.y = 0.1;
      }
    } else {
      if (this.mesh.children[1] && this.mesh.children[2]) {
        this.mesh.children[1].scale.y = 1;
        this.mesh.children[2].scale.y = 1;
      }
    }
  }

  isAsleep() {
    return this.body && PhysicsBody.isAsleep(this.body);
  }

  useAbility() {
    if (this.abilityUsed || !this.isActive) return null;
    
    this.abilityUsed = true;
    
    switch (this.type) {
      case 'BLUE':
        // Split into 3 birds
        return {
          type: 'split',
          count: 3,
          spread: 1.5  // Spread angle
        };
        
      case 'BOMB':
        // Explode
        return {
          type: 'explode',
          radius: 3,
          force: 15
        };
        
      case 'YELLOW':
        // Speed boost
        const currentVelocity = this.body.velocity.clone();
        currentVelocity.normalize().scale(20);  // Boost to speed 20
        this.body.velocity.copy(currentVelocity);
        return {
          type: 'boost'
        };
        
      default:
        return null;
    }
  }

  reset(position) {
    this.isLaunched = false;
    this.isActive = false;
    this.abilityUsed = false;
    PhysicsBody.setPosition(this.body, position.x, position.y, position.z);
    this.mesh.scale.set(1, 1, 1);
    this.mesh.rotation.set(0, 0, 0);
  }

  dispose() {
    if (this.mesh) {
      this.mesh.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
    }
  }
}

