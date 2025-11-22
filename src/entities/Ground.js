import * as THREE from 'three';
import { PhysicsBody } from '../physics/PhysicsBody.js';

export class Ground {
  constructor(assetLoader) {
    this.mesh = null;
    this.body = null;
    this.assetLoader = assetLoader;
    
    this.create();
  }

  create() {
    // Create visual mesh
    const geometry = new THREE.PlaneGeometry(200, 200);
    
    let material;
    if (this.assetLoader) {
      material = this.assetLoader.getMaterial('ground');
    } else {
      material = new THREE.MeshPhongMaterial({ 
        color: 0x8B7355,
        shininess: 5,
      });
    }
    
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.position.y = 0;
    this.mesh.receiveShadow = true;
    
    // Create physics body
    this.body = PhysicsBody.createPlane();
    this.body.position.y = 0;
  }

  dispose() {
    if (this.mesh) {
      if (this.mesh.geometry) this.mesh.geometry.dispose();
      // Don't dispose material as it's shared from asset loader
    }
  }
}

