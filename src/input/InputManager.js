import * as THREE from 'three';

export class InputManager {
  constructor(camera, canvas) {
    this.camera = camera;
    this.canvas = canvas;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.mouseDown = false;
    this.callbacks = {
      onDragStart: null,
      onDrag: null,
      onDragEnd: null,
      onClick: null,
    };
    
    this.initialize();
  }

  initialize() {
    // Mouse events
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    
    // Touch events
    this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
    this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
    this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    
    // Prevent context menu
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  updateMousePosition(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  }

  getWorldPosition(distance = 10) {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    // Cast ray to z=0 plane (where the game is played)
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const target = new THREE.Vector3();
    
    this.raycaster.ray.intersectPlane(plane, target);
    
    // If intersection found, return it, otherwise use distance method
    if (target.x !== 0 || target.y !== 0) {
      return target;
    }
    
    // Fallback: Get point at specific distance from camera
    const direction = this.raycaster.ray.direction.clone();
    const position = this.raycaster.ray.origin.clone().add(
      direction.multiplyScalar(distance)
    );
    
    return position;
  }

  handleMouseDown(e) {
    this.updateMousePosition(e.clientX, e.clientY);
    this.mouseDown = true;
    this.dragStartPos = { x: this.mouse.x, y: this.mouse.y };
    this.hasMoved = false;
    
    if (this.callbacks.onDragStart) {
      const worldPos = this.getWorldPosition();
      this.callbacks.onDragStart(worldPos);
    }
  }

  handleMouseMove(e) {
    this.updateMousePosition(e.clientX, e.clientY);
    
    if (this.mouseDown) {
      // Check if mouse moved significantly
      const dx = this.mouse.x - this.dragStartPos.x;
      const dy = this.mouse.y - this.dragStartPos.y;
      if (Math.sqrt(dx * dx + dy * dy) > 0.01) {
        this.hasMoved = true;
      }
      
      if (this.callbacks.onDrag) {
        const worldPos = this.getWorldPosition();
        this.callbacks.onDrag(worldPos);
      }
    }
  }

  handleMouseUp(e) {
    this.updateMousePosition(e.clientX, e.clientY);
    
    if (this.mouseDown) {
      this.mouseDown = false;
      const worldPos = this.getWorldPosition();
      
      // If didn't move much, it's a click
      if (!this.hasMoved && this.callbacks.onClick) {
        this.callbacks.onClick(worldPos);
      } else if (this.callbacks.onDragEnd) {
        this.callbacks.onDragEnd(worldPos);
      }
    }
  }

  handleTouchStart(e) {
    e.preventDefault();
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      this.updateMousePosition(touch.clientX, touch.clientY);
      this.mouseDown = true;
      this.dragStartPos = { x: this.mouse.x, y: this.mouse.y };
      this.hasMoved = false;
      
      if (this.callbacks.onDragStart) {
        const worldPos = this.getWorldPosition();
        this.callbacks.onDragStart(worldPos);
      }
    }
  }

  handleTouchMove(e) {
    e.preventDefault();
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      this.updateMousePosition(touch.clientX, touch.clientY);
      
      if (this.mouseDown) {
        // Check if touch moved significantly
        const dx = this.mouse.x - this.dragStartPos.x;
        const dy = this.mouse.y - this.dragStartPos.y;
        if (Math.sqrt(dx * dx + dy * dy) > 0.01) {
          this.hasMoved = true;
        }
        
        if (this.callbacks.onDrag) {
          const worldPos = this.getWorldPosition();
          this.callbacks.onDrag(worldPos);
        }
      }
    }
  }

  handleTouchEnd(e) {
    if (this.mouseDown) {
      this.mouseDown = false;
      const worldPos = this.getWorldPosition();
      
      // If didn't move much, it's a tap (click)
      if (!this.hasMoved && this.callbacks.onClick) {
        this.callbacks.onClick(worldPos);
      } else if (this.callbacks.onDragEnd) {
        this.callbacks.onDragEnd(worldPos);
      }
    }
  }

  on(event, callback) {
    if (event === 'dragStart') {
      this.callbacks.onDragStart = callback;
    } else if (event === 'drag') {
      this.callbacks.onDrag = callback;
    } else if (event === 'dragEnd') {
      this.callbacks.onDragEnd = callback;
    } else if (event === 'click') {
      this.callbacks.onClick = callback;
    }
  }

  dispose() {
    // Remove event listeners
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp);
    this.canvas.removeEventListener('touchstart', this.handleTouchStart);
    this.canvas.removeEventListener('touchmove', this.handleTouchMove);
    this.canvas.removeEventListener('touchend', this.handleTouchEnd);
  }
}

