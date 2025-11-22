import * as CANNON from 'cannon-es';
import { MATERIALS } from '../utils/Constants.js';

export class PhysicsBody {
  static createBox(width, height, depth, mass = 1, material = 'WOOD') {
    const shape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2));
    const body = new CANNON.Body({
      mass,
      shape,
      linearDamping: 0.3,
      angularDamping: 0.3,
    });
    
    return body;
  }

  static createSphere(radius, mass = 1, material = 'BIRD') {
    const shape = new CANNON.Sphere(radius);
    const body = new CANNON.Body({
      mass,
      shape,
      linearDamping: 0.1,
      angularDamping: 0.1,
    });
    
    return body;
  }

  static createCylinder(radius, height, mass = 1, material = 'WOOD') {
    const shape = new CANNON.Cylinder(radius, radius, height, 8);
    const body = new CANNON.Body({
      mass,
      shape,
      linearDamping: 0.3,
      angularDamping: 0.3,
    });
    
    return body;
  }

  static createPlane() {
    const shape = new CANNON.Plane();
    const body = new CANNON.Body({
      mass: 0, // Static
      shape,
    });
    
    // Rotate to be horizontal
    body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    
    return body;
  }

  static syncMesh(mesh, body) {
    mesh.position.copy(body.position);
    mesh.quaternion.copy(body.quaternion);
  }

  static setPosition(body, x, y, z) {
    body.position.set(x, y, z);
    body.velocity.set(0, 0, 0);
    body.angularVelocity.set(0, 0, 0);
  }

  static setVelocity(body, x, y, z) {
    body.velocity.set(x, y, z);
  }

  static isAsleep(body) {
    return body.sleepState === CANNON.Body.SLEEPING;
  }

  static wakeUp(body) {
    body.wakeUp();
  }

  static putToSleep(body) {
    body.sleep();
  }
}

