import * as THREE from 'three';
import { GAME_CONFIG } from '../utils/Constants.js';

export class Slingshot {
  constructor(position = { x: -8, y: 0, z: 0 }) {
    this.position = position;
    this.mesh = null;
    this.rubberBands = [];
    this.currentBird = null;
    this.isDragging = false;
    this.dragPosition = { x: 0, y: 0, z: 0 };
    
    this.create();
  }

  create() {
    const group = new THREE.Group();
    
    // Base
    const baseGeometry = new THREE.CylinderGeometry(0.5, 0.6, 0.3, 16);
    const baseMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.15;
    base.castShadow = true;
    group.add(base);
    
    // Left post
    const postGeometry = new THREE.CylinderGeometry(0.1, 0.12, 2, 8);
    const postMaterial = new THREE.MeshPhongMaterial({ color: 0x654321 });
    
    const leftPost = new THREE.Mesh(postGeometry, postMaterial);
    leftPost.position.set(-0.35, 1.3, 0);
    leftPost.rotation.z = -0.1;
    leftPost.castShadow = true;
    group.add(leftPost);
    
    // Right post
    const rightPost = new THREE.Mesh(postGeometry, postMaterial);
    rightPost.position.set(0.35, 1.3, 0);
    rightPost.rotation.z = 0.1;
    rightPost.castShadow = true;
    group.add(rightPost);
    
    // Y-shaped top connector
    const connectorGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.8, 8);
    const connector = new THREE.Mesh(connectorGeometry, postMaterial);
    connector.position.set(0, 2.2, 0);
    connector.rotation.z = Math.PI / 2;
    group.add(connector);
    
    group.position.set(this.position.x, this.position.y, this.position.z);
    this.mesh = group;
    
    // Create rubber bands (lines)
    this.createRubberBands();
  }

  createRubberBands() {
    // Left rubber band
    const leftBandGeometry = new THREE.BufferGeometry();
    const leftBandMaterial = new THREE.LineBasicMaterial({ 
      color: 0x333333, 
      linewidth: 3 
    });
    const leftBand = new THREE.Line(leftBandGeometry, leftBandMaterial);
    this.mesh.add(leftBand);
    this.rubberBands.push(leftBand);
    
    // Right rubber band
    const rightBandGeometry = new THREE.BufferGeometry();
    const rightBandMaterial = new THREE.LineBasicMaterial({ 
      color: 0x333333, 
      linewidth: 3 
    });
    const rightBand = new THREE.Line(rightBandGeometry, rightBandMaterial);
    this.mesh.add(rightBand);
    this.rubberBands.push(rightBand);
    
    this.updateRubberBands({ x: 0, y: 1, z: 0 });
  }

  updateRubberBands(birdPosition) {
    const leftAnchor = new THREE.Vector3(-0.35, 2.2, 0);
    const rightAnchor = new THREE.Vector3(0.35, 2.2, 0);
    const birdPos = new THREE.Vector3(
      birdPosition.x - this.position.x,
      birdPosition.y - this.position.y,
      birdPosition.z - this.position.z
    );
    
    // Update left band
    const leftPoints = [leftAnchor, birdPos];
    this.rubberBands[0].geometry.setFromPoints(leftPoints);
    
    // Update right band
    const rightPoints = [rightAnchor, birdPos];
    this.rubberBands[1].geometry.setFromPoints(rightPoints);
  }

  loadBird(bird) {
    // Prevent loading if already has a bird
    if (this.currentBird && this.currentBird !== bird) {
      return;
    }
    
    this.currentBird = bird;
    this.isDragging = false; // Reset drag state
    
    const loadPosition = {
      x: this.position.x,
      y: this.position.y + 1,
      z: this.position.z
    };
    
    if (bird && bird.body) {
      // Show the bird (was hidden initially)
      bird.mesh.visible = true;
      
      // Position at slingshot first
      bird.body.position.set(loadPosition.x, loadPosition.y, loadPosition.z);
      
      // Stop all motion completely
      bird.body.velocity.set(0, 0, 0);
      bird.body.angularVelocity.set(0, 0, 0);
      bird.body.force.set(0, 0, 0);
      bird.body.torque.set(0, 0, 0);
      
      // Set to kinematic (type 2) for manual position control
      bird.body.mass = 0;
      bird.body.invMass = 0;
      bird.body.updateMassProperties();
      bird.body.type = 2; // KINEMATIC
      bird.body.collisionResponse = false;
      
      // Keep awake for immediate response to dragging
      bird.body.allowSleep = false;
      bird.body.wakeUp();
      
      // Reset bird state
      bird.isLaunched = false;
      bird.isActive = false;
      
      // Reset visual
      bird.mesh.scale.set(1, 1, 1);
      bird.mesh.rotation.set(0, 0, 0);
    }
    
    // Update rubber bands to slingshot position
    this.updateRubberBands(loadPosition);
  }

  startDrag() {
    this.isDragging = true;
  }

  updateDrag(worldPosition) {
    if (!this.isDragging || !this.currentBird) return;
    
    const slingshotPos = new THREE.Vector3(
      this.position.x,
      this.position.y + 1,
      this.position.z
    );
    
    const dragVector = new THREE.Vector3(
      worldPosition.x,
      worldPosition.y,
      worldPosition.z
    ).sub(slingshotPos);
    
    // Limit drag distance
    const distance = dragVector.length();
    if (distance > GAME_CONFIG.SLINGSHOT_MAX_DISTANCE) {
      dragVector.normalize().multiplyScalar(GAME_CONFIG.SLINGSHOT_MAX_DISTANCE);
    }
    
    // Only allow pulling back
    if (dragVector.x > 0) {
      dragVector.x = 0;
    }
    
    this.dragPosition = {
      x: slingshotPos.x + dragVector.x,
      y: slingshotPos.y + dragVector.y,
      z: slingshotPos.z + dragVector.z
    };
    
    // Update bird position - kinematic body moves directly
    if (this.currentBird && this.currentBird.body) {
      this.currentBird.body.position.set(
        this.dragPosition.x,
        this.dragPosition.y,
        this.dragPosition.z
      );
      // Force stop any physics movement
      this.currentBird.body.velocity.set(0, 0, 0);
      this.currentBird.body.angularVelocity.set(0, 0, 0);
    }
    
    // Update rubber bands
    this.updateRubberBands(this.dragPosition);
  }

  endDrag() {
    if (!this.isDragging || !this.currentBird) return null;
    
    this.isDragging = false;
    
    const slingshotPos = new THREE.Vector3(
      this.position.x,
      this.position.y + 1,
      this.position.z
    );
    
    const dragPos = new THREE.Vector3(
      this.dragPosition.x,
      this.dragPosition.y,
      this.dragPosition.z
    );
    
    // Calculate launch velocity
    const launchVector = slingshotPos.sub(dragPos);
    const velocity = launchVector.multiplyScalar(GAME_CONFIG.SLINGSHOT_FORCE_MULTIPLIER);
    
    // Convert bird back to DYNAMIC body for physics simulation
    if (this.currentBird && this.currentBird.body) {
      this.currentBird.body.mass = 1;
      this.currentBird.body.invMass = 1;
      this.currentBird.body.updateMassProperties();
      
      this.currentBird.body.type = 1; // Dynamic
      this.currentBird.body.collisionResponse = true;
      this.currentBird.body.allowSleep = true;
      this.currentBird.body.wakeUp();
    }
    
    const bird = this.currentBird;
    this.currentBird = null;
    
    // Reset rubber bands
    this.updateRubberBands({ 
      x: this.position.x, 
      y: this.position.y + 1, 
      z: this.position.z 
    });
    
    return { bird, velocity };
  }

  calculateTrajectory(steps = 30) {
    if (!this.isDragging) return [];
    
    const slingshotPos = new THREE.Vector3(
      this.position.x,
      this.position.y + 1,
      this.position.z
    );
    
    const dragPos = new THREE.Vector3(
      this.dragPosition.x,
      this.dragPosition.y,
      this.dragPosition.z
    );
    
    const launchVector = slingshotPos.sub(dragPos);
    const velocity = launchVector.multiplyScalar(GAME_CONFIG.SLINGSHOT_FORCE_MULTIPLIER);
    
    const points = [];
    const timeStep = 0.1;
    let pos = new THREE.Vector3(this.dragPosition.x, this.dragPosition.y, this.dragPosition.z);
    let vel = velocity.clone();
    
    for (let i = 0; i < steps; i++) {
      points.push(pos.clone());
      vel.y += -9.82 * timeStep;
      pos.add(vel.clone().multiplyScalar(timeStep));
      
      if (pos.y < 0) break;
    }
    
    return points;
  }

  reset() {
    this.isDragging = false;
    this.currentBird = null;
    this.updateRubberBands({ 
      x: this.position.x, 
      y: this.position.y + 1, 
      z: this.position.z 
    });
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

