import * as CANNON from 'cannon-es';
import { PHYSICS, MATERIALS } from '../utils/Constants.js';

export class PhysicsWorld {
  constructor() {
    this.world = null;
    this.bodies = new Map();
    this.materials = new Map();
    this.contactMaterials = new Map();
    this.initialize();
  }

  initialize() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, PHYSICS.GRAVITY, 0);
    this.world.broadphase = new CANNON.NaiveBroadphase();
    this.world.solver.iterations = 10;
    this.world.allowSleep = true;
    
    // Create physics materials
    this.createMaterials();
    this.setupContactMaterials();
  }

  createMaterials() {
    Object.entries(MATERIALS).forEach(([name, props]) => {
      const material = new CANNON.Material(name);
      this.materials.set(name, material);
    });
  }

  setupContactMaterials() {
    const materials = Array.from(this.materials.values());
    
    materials.forEach((mat1) => {
      materials.forEach((mat2) => {
        const contactMaterial = new CANNON.ContactMaterial(mat1, mat2, {
          friction: 0.4,
          restitution: 0.3,
        });
        this.world.addContactMaterial(contactMaterial);
      });
    });
  }

  addBody(id, body, material = 'GROUND') {
    if (this.materials.has(material)) {
      body.material = this.materials.get(material);
    }
    
    this.world.addBody(body);
    this.bodies.set(id, body);
    return body;
  }

  removeBody(id) {
    const body = this.bodies.get(id);
    if (body) {
      this.world.removeBody(body);
      this.bodies.delete(id);
    }
  }

  getBody(id) {
    return this.bodies.get(id);
  }

  update(deltaTime) {
    this.world.step(PHYSICS.TIME_STEP, deltaTime, PHYSICS.MAX_SUB_STEPS);
  }

  clear() {
    this.bodies.forEach((body) => {
      this.world.removeBody(body);
    });
    this.bodies.clear();
  }

  raycast(from, to) {
    const result = new CANNON.RaycastResult();
    this.world.raycastClosest(
      new CANNON.Vec3(from.x, from.y, from.z),
      new CANNON.Vec3(to.x, to.y, to.z),
      {},
      result
    );
    return result.hasHit ? result : null;
  }

  applyImpulse(id, impulse, worldPoint = null) {
    const body = this.bodies.get(id);
    if (body) {
      if (worldPoint) {
        body.applyImpulse(
          new CANNON.Vec3(impulse.x, impulse.y, impulse.z),
          new CANNON.Vec3(worldPoint.x, worldPoint.y, worldPoint.z)
        );
      } else {
        body.applyImpulse(new CANNON.Vec3(impulse.x, impulse.y, impulse.z));
      }
    }
  }

  dispose() {
    this.clear();
    this.world = null;
  }
}

