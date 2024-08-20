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

  /**
   * Obtains the axis vectors using the transformation matrix
   * The right vector: X axis
   * The up vector: Y axis
   * The normal vector: Z axis
   */
  computeOrientation() {
    this.right = this.matrix.rightVector();
    this.up = this.matrix.upVector();
    this.normal = this.matrix.normalVector();
  }

  // Change camera position
  setInitialPosition(position: Vector) {
    this.initialPosition = position.copy();
  }

  getPosition() {
    return this.position.copy();
  }

  // Change camera initial position for reset
  setPosition(position: Vector) {
    this.position = position.copy();
    this.update();
  }

  // Moves backwards/towards on the space newSpace units
  dolly(newSteps: number) {
    let newPosition;
    const normal = this.normal.normalize();

    const step = newSteps - this.steps;
    if (this.isTracking()) {
      // For the tracking camera we moves forward/backward like walking with a flashlight
      // pointing to a direction. Therefore we need to know which way the flashlight
      // is pointing (normal vector).
      // We multiply the direction the camera
      // is pointing (Z axis) by the step (the distance we advance)
      const directedStep = normal.escalarProduct(step);
      // Note that, as we have said that translations work the other way around
      // in order to move forward we have to substract and viceversa
      // Therefore we negate the direction of the directedStep vector
      // and we sum this vector to the position
      newPosition = this.position.sum(directedStep.negate());
    } else {
      // For the orbiting camera the camera is always at a fixed distance from you.
      // It doesn’t move closer or farther away on its own; it just circles around you.
      // As the objects orbit, its direction changes automatically because it is always
      // facing the center of the circle (the camera). The camera doesn’t need to be told
      // where to look because it naturally points towards the object it's orbiting.
      //
      // So the camera only need to know how far away it is from the object, and
      // this is stored on the z component
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
    this.type = CAMERA_TYPE.TRACKING;
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
