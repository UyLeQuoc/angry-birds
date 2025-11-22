import * as THREE from 'three';

export class TrajectoryLine {
  constructor(scene) {
    this.scene = scene;
    this.line = null;
    this.dots = [];
    this.visible = false;
    
    this.createLine();
  }

  createLine() {
    // Create line
    const lineGeometry = new THREE.BufferGeometry();
    const lineMaterial = new THREE.LineDashedMaterial({
      color: 0xFFFFFF,
      linewidth: 2,
      dashSize: 0.2,
      gapSize: 0.1,
      transparent: true,
      opacity: 0.6,
    });
    
    this.line = new THREE.Line(lineGeometry, lineMaterial);
    this.line.visible = false;
    this.scene.add(this.line);
    
    // Create dots along trajectory
    const dotGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const dotMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      transparent: true,
      opacity: 0.8,
    });
    
    for (let i = 0; i < 30; i++) {
      const dot = new THREE.Mesh(dotGeometry, dotMaterial.clone());
      dot.visible = false;
      this.scene.add(dot);
      this.dots.push(dot);
    }
  }

  update(points) {
    if (!points || points.length === 0) {
      this.hide();
      return;
    }
    
    this.show();
    
    // Update line
    this.line.geometry.setFromPoints(points);
    this.line.computeLineDistances();
    
    // Update dots
    this.dots.forEach((dot, index) => {
      if (index < points.length) {
        dot.position.copy(points[index]);
        dot.visible = true;
        
        // Fade out dots along trajectory
        const opacity = 1 - (index / points.length);
        dot.material.opacity = opacity * 0.8;
      } else {
        dot.visible = false;
      }
    });
  }

  show() {
    this.visible = true;
    this.line.visible = true;
  }

  hide() {
    this.visible = false;
    this.line.visible = false;
    this.dots.forEach(dot => {
      dot.visible = false;
    });
  }

  dispose() {
    this.scene.remove(this.line);
    this.line.geometry.dispose();
    this.line.material.dispose();
    
    this.dots.forEach(dot => {
      this.scene.remove(dot);
      dot.geometry.dispose();
      dot.material.dispose();
    });
    
    this.dots = [];
  }
}

