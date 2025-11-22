import * as THREE from 'three';

export class CloudManager {
  constructor(scene) {
    this.scene = scene;
    this.clouds = [];
    this.cloudCount = 8;
    this.createClouds();
  }

  createClouds() {
    for (let i = 0; i < this.cloudCount; i++) {
      const cloud = this.createCloud();
      
      // Random position
      cloud.position.set(
        Math.random() * 60 - 30,  // x: -30 to 30
        5 + Math.random() * 8,     // y: 5 to 13
        -30 - Math.random() * 10   // z: -30 to -40 (far away)
      );
      
      // Random speed
      cloud.userData.speed = 0.5 + Math.random() * 1.0; // 0.5 to 1.5
      cloud.userData.startX = cloud.position.x;
      
      this.scene.add(cloud);
      this.clouds.push(cloud);
    }
  }

  createCloud() {
    const cloudGroup = new THREE.Group();
    
    // Create cloud using multiple spheres
    const sphereCount = 3 + Math.floor(Math.random() * 3); // 3-5 spheres
    const cloudMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      transparent: true,
      opacity: 0.7 + Math.random() * 0.2,
      fog: false
    });
    
    for (let i = 0; i < sphereCount; i++) {
      const radius = 1 + Math.random() * 1.5;
      const geometry = new THREE.SphereGeometry(radius, 8, 8);
      const sphere = new THREE.Mesh(geometry, cloudMaterial);
      
      // Random position within cloud group
      sphere.position.set(
        (i - sphereCount / 2) * 1.5,
        Math.random() * 0.5,
        Math.random() * 0.5
      );
      
      // Random scale
      const scale = 0.8 + Math.random() * 0.4;
      sphere.scale.set(scale, scale * 0.7, scale);
      
      cloudGroup.add(sphere);
    }
    
    // Random overall scale
    const overallScale = 0.6 + Math.random() * 0.8;
    cloudGroup.scale.set(overallScale, overallScale, overallScale);
    
    return cloudGroup;
  }

  update(deltaTime) {
    this.clouds.forEach(cloud => {
      // Move cloud to the right
      cloud.position.x += cloud.userData.speed * deltaTime;
      
      // Reset to left when off screen
      if (cloud.position.x > 35) {
        cloud.position.x = -35;
      }
      
      // Subtle bobbing animation
      cloud.position.y += Math.sin(Date.now() * 0.0005 + cloud.userData.startX) * 0.002;
    });
  }

  dispose() {
    this.clouds.forEach(cloud => {
      cloud.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
      this.scene.remove(cloud);
    });
    this.clouds = [];
  }
}

