import { Angle } from "../math/angle.js";
import { Matrix4 } from "../math/matrix.js";
import { Vector } from "../math/vector.js";

export enum CAMERA_TYPE {
  TRACKING = "Tracking",
  ORBITING = "Orbiting",
}

class Camera {
  public type: CAMERA_TYPE;
  private matrix: Matrix4;
  private position: Vector;
  private initialPosition: Vector;
  private steps: number;
  // Perspective Camera
  private fov: number;
  private minZ: number;
  private maxZ: number;
  // Rotation vectors
  public up: Vector;
  public right: Vector;
  public normal: Vector;
  // Rotation X
  public elevation: number;
  // Rotation Y
  public azimuth: number;

  constructor(type: CAMERA_TYPE) {
    this.type = type;
    this.matrix = Matrix4.identity();
    // Rotation Y Axis
    this.up = new Vector([0, 0, 0]);
    // Rotation X Axis
    this.right = new Vector([0, 0, 0]);
    // Rotation Z Axis
    this.normal = new Vector([0, 0, 0]);

    // Perspective camera parameters
    this.fov = 45;
    this.minZ = 0.1;
    this.maxZ = 10000;

    // Rotation parameters
    this.elevation = 0;
    this.azimuth = 0;
    // Translation parameter
    this.position = new Vector([0, 0, 0]);
    this.initialPosition = new Vector([0, 0, 0]);
    this.steps = 0;
  }

  isOrbiting() {
    return this.type === CAMERA_TYPE.ORBITING;
  }

  isTracking() {
    return this.type === CAMERA_TYPE.TRACKING;
  }

  setType(type: CAMERA_TYPE) {
    this.type = type;
  }

  // Obtain model-view transform
  getViewTransform() {
    return this.matrix.copy() as Matrix4;
  }

  // Sets the rotation on Y axis
  setAzimuth(azimuth: number) {
    // Compute rotation difference
    const diffAzimuth = azimuth - this.azimuth;
    // Update rotation angle constrained on [0, 360]
    this.azimuth = Angle.safeDegAngle(this.azimuth + diffAzimuth);
    this.update();
  }

  // Sets the rotation on X axis
  setElevation(elevation: number) {
    // Compute rotation difference
    const diffElevation = elevation - this.elevation;
    // Update rotation angle constrained on [0, 360]
    this.elevation = Angle.safeDegAngle(this.elevation + diffElevation);
    this.update();
  }

  // TODO: what is going on here
  computeOrientation() {
    const right = new Vector([1, 0, 0, 0]);
    this.right = new Vector(this.matrix.multiply(right).elements.slice(0, 3));

    const up = new Vector([0, 1, 0, 0]);
    this.up = new Vector(this.matrix.multiply(up).elements.slice(0, 3));

    const normal = new Vector([0, 0, 1, 0]);
    this.normal = new Vector(this.matrix.multiply(normal).elements.slice(0, 3));
  }

  // Change camera position
  setInitialPosition(position: Vector) {
    this.initialPosition = position;
  }

  // Change camera initial position for reset
  setPosition(position: Vector) {
    this.position = position;
    this.update();
  }

  // TODO: what is going on here
  dolly(newSteps: number) {
    const newPosition = new Vector([0, 0, 0]);
    const normal = this.normal.normalize();

    const step = newSteps - this.steps;
    if (this.isTracking()) {
      newPosition.set(0, 0, this.position.at(0) + step * normal.at(0));
      newPosition.set(1, 0, this.position.at(1) + step * normal.at(1));
      newPosition.set(2, 0, this.position.at(2) + step * normal.at(2));
    } else {
      newPosition.set(0, 0, this.position.at(0));
      newPosition.set(1, 0, this.position.at(1));
      newPosition.set(2, 0, this.position.at(2) + step);
    }

    this.steps = newSteps;
    this.setPosition(newPosition);
  }

  // Set initial values
  reset() {
    this.elevation = 0;
    this.azimuth = 0;
    this.position = this.initialPosition;
  }

  // Updates camera transformation matrix
  update() {
    this.matrix = Matrix4.identity();

    if (this.isTracking()) {
      // Rotate
      this.matrix = this.matrix.rotateVecDeg(
        new Vector([this.elevation, this.azimuth, 0])
      );
      // Translate to new camera position
      this.matrix = this.matrix.translate(this.position);
    } else {
      // Translate to new camera position
      this.matrix = this.matrix.translate(this.position);
      // Rotate
      this.matrix = this.matrix.rotateVecDeg(
        new Vector([this.elevation, this.azimuth, 0])
      );
    }

    // TODO: how should the translation be coded with positive or negative values?
    this.computeOrientation();
  }
}

export default Camera;
