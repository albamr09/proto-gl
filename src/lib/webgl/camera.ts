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
    this.update();
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

  computeOrientation() {
    this.right = this.matrix.rightVector();
    this.up = this.matrix.upVector();
    this.normal = this.matrix.normalVector();
  }

  // Change camera position
  setInitialPosition(position: Vector) {
    this.initialPosition = position.copy();
  }

  // Change camera initial position for reset
  setPosition(position: Vector) {
    this.position = position.copy();
    this.update();
  }

  dolly(newSteps: number) {
    let newPosition;
    const normal = this.normal.normalize();

    const step = newSteps - this.steps;
    if (this.isTracking()) {
      newPosition = this.position.sum(normal.escalarProduct(step).negate());
    } else {
      newPosition = this.position.copy();
      newPosition.set(2, 0, this.position.at(2) + step);
    }

    this.steps = newSteps;
    this.setPosition(newPosition);
  }

  // Set initial values
  reset() {
    this.elevation = 0;
    this.azimuth = 0;
    this.setPosition(this.initialPosition);
  }

  // Updates camera transformation matrix
  update() {
    this.matrix = Matrix4.identity();
    // As you know the position of the camera
    // is obtained by moving the objects on the
    // world on the opposite direction
    // Ref: https://albamr09.github.io/src/Notes/ComputerScience/CG/RTGW/04.html#Camera-Vertex%20Transformations-The%20Model,%20View%20and%20Projection%20matrices-The%20View%20Matrix
    const negatedPosition = this.position.negate();

    if (this.isTracking()) {
      // When the camera is tracking, in order to "move the camera"
      // instead of everything else, we have to first rotate everything
      // with respect to the orgin (remember the camera is always on the origin)
      // and then we move the objects on the opposite direction to
      // where the camera is. This makes the illusion we are
      // "moving the camera"
      this.matrix = this.matrix.rotateVecDeg(
        new Vector([this.elevation, this.azimuth, 0])
      );
      this.matrix = this.matrix.translate(negatedPosition);
    } else {
      // On the other hand if you want the camera to not move, and move
      // the objects on the scene (or at least make it seem like so). You have
      // to inverse the computations. First you translate the objects, so now
      // the camera is the only thing at the origin (note the camera does not exist
      // but we are always at the origin). So when you now rotate the objects, these
      // are being rotated with respect to the origin, and it seems you
      // are moving the objects instead of the camera (the camera never moves!!,
      // i know sorry this does not make much sense)
      this.matrix = this.matrix.translate(negatedPosition);
      this.matrix = this.matrix.rotateVecDeg(
        new Vector([this.elevation, this.azimuth, 0])
      );
    }

    this.computeOrientation();
  }
}

export default Camera;
