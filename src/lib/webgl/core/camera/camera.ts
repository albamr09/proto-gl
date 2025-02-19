import { Angle } from "../../../math/angle.js";
import { Matrix4 } from "../../../math/matrix.js";
import { Vector } from "../../../math/vector.js";
import Scene from "../../rendering/scene.js";
import { CameraType, ProjectionType } from "./types.js";

class Camera {
  // Camera config
  public type: CameraType;
  public projection: ProjectionType;
  // Camera state
  private modelViewMatrix: Matrix4;
  private projectionMatrix: Matrix4;
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
  // Projection params
  public aspectRatio: number;
  public width: number;
  public height: number;
  public fov: number;
  public far: number;
  public near: number;
  public transposeProjection: boolean;
  private scene?: Scene;

  constructor({
    type = CameraType.ORBITING,
    projection = ProjectionType.PERSPECTIVE,
    gl,
    scene,
  }: {
    type?: CameraType;
    projection?: ProjectionType;
    gl?: WebGL2RenderingContext;
    scene?: Scene;
  }) {
    this.scene = scene;
    this.type = type;
    this.projection = projection;
    this.modelViewMatrix = Matrix4.identity();
    this.projectionMatrix = Matrix4.identity();
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

    // Projection
    this.aspectRatio = 0;
    this.width = 0;
    this.height = 0;
    this.fov = 45;
    this.far = 5000;
    this.near = 0.1;
    this.transposeProjection = true;
    this.updateProjectionParams(gl);
    window.addEventListener("resize", () => {
      this.updateProjectionParams(gl);
    });
  }

  private updateProjectionParams(gl?: WebGL2RenderingContext) {
    this.aspectRatio = (gl?.canvas?.width ?? 0) / (gl?.canvas?.height ?? 1);
    this.width = gl?.canvas.width ?? 0;
    this.height = gl?.canvas.height ?? 1;
    this.updateProjection();
  }

  public isOrbiting() {
    return this.type === CameraType.ORBITING;
  }

  public isTracking() {
    return this.type === CameraType.TRACKING;
  }

  public setType(type: CameraType) {
    this.type = type;
    this.updateModelView();
  }

  public setProjection(projection: ProjectionType) {
    this.projection = projection;
    this.updateProjection();
  }

  public setFov(x: number) {
    this.fov = x;
    this.updateProjection();
  }

  public setFar(x: number) {
    this.far = x;
    this.updateProjection();
  }

  public setNear(x: number) {
    this.near = x;
    this.updateProjection();
  }

  public setTransposeProjection(x: boolean) {
    this.transposeProjection = x;
    this.updateProjection();
  }

  public isProjectionTransposed() {
    return this.transposeProjection;
  }

  public setPerspectiveParams(fov: number, far: number, near: number) {
    this.fov = fov;
    this.far = far;
    this.near = near;
    this.updateProjection();
  }

  public getViewTransform() {
    return this.modelViewMatrix.copy() as Matrix4;
  }

  public getProjectionTransform() {
    return this.projectionMatrix.copy() as Matrix4;
  }

  // Sets the rotation on Y axis
  public setAzimuth(azimuth: number) {
    // Compute rotation difference
    const diffAzimuth = azimuth - this.azimuth;
    // Update rotation angle constrained on [0, 360]
    this.azimuth = Angle.safeDegAngle(this.azimuth + diffAzimuth);
    this.updateModelView();
  }

  // Sets the rotation on X axis
  public setElevation(elevation: number) {
    // Compute rotation difference
    const diffElevation = elevation - this.elevation;
    // Update rotation angle constrained on [0, 360]
    this.elevation = Angle.safeDegAngle(this.elevation + diffElevation);
    this.updateModelView();
  }

  /**
   * Obtains the axis vectors using the transformation matrix
   * The right vector: X axis
   * The up vector: Y axis
   * The normal vector: Z axis
   */
  private computeOrientation() {
    this.right = this.modelViewMatrix.rightVector();
    this.up = this.modelViewMatrix.upVector();
    this.normal = this.modelViewMatrix.normalVector();
  }

  public setInitialPosition(position: Vector) {
    this.initialPosition = position.copy();
  }

  public getPosition() {
    return this.position.copy();
  }

  // Change camera initial position for reset
  public setPosition(position: Vector) {
    this.position = position.copy();
    this.updateModelView();
  }

  // Moves backwards/towards on the space newSpace units
  public dolly(newSteps: number) {
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
      // this is stored on the z component. Note a positive z points to outside
      // of the screen, so in order to go forward we must substract, and to go
      // backwards we must sum the value of step
      newPosition = this.position.copy();
      newPosition.set(2, 0, this.position.at(2) - step);
    }

    this.steps = newSteps;
    this.setPosition(newPosition);
  }

  // Set initial values
  public reset() {
    this.elevation = 0;
    this.azimuth = 0;
    this.fov = 45;
    this.setPosition(this.initialPosition);
    this.type = CameraType.TRACKING;
  }

  // Updates camera transformation matrix
  private updateModelView() {
    this.modelViewMatrix = Matrix4.identity();
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
      this.modelViewMatrix = this.modelViewMatrix.rotateVecDeg(
        new Vector([this.elevation, this.azimuth, 0])
      );
      this.modelViewMatrix = this.modelViewMatrix.translate(negatedPosition);
    } else {
      // On the other hand if you want the camera to not move, and move
      // the objects on the scene (or at least make it seem like so). You have
      // to inverse the computations. First you translate the objects, so now
      // the camera is the only thing at the origin (note the camera does not exist
      // but we are always at the origin). So when you now rotate the objects, these
      // are being rotated with respect to the origin, and it seems you
      // are moving the objects instead of the camera (the camera never moves!!,
      // i know sorry this does not make much sense)
      this.modelViewMatrix = this.modelViewMatrix.translate(negatedPosition);
      this.modelViewMatrix = this.modelViewMatrix.rotateVecDeg(
        this.getRotation()
      );
    }

    this.computeOrientation();
    this.scene?.updateModelViewMatrix(this.modelViewMatrix);
  }

  /**
   * Updates the projection matrix taking into account the type
   * of projection: perspective or orthographic.
   */
  private updateProjection() {
    if (this.projection == ProjectionType.PERSPECTIVE) {
      this.projectionMatrix = Matrix4.perspective(
        this.fov,
        this.aspectRatio,
        this.near,
        this.far,
        this.isProjectionTransposed()
      );
    } else if (this.projection == ProjectionType.ORTHOGRAPHIC) {
      this.projectionMatrix = Matrix4.ortho(
        -this.width / this.fov,
        this.width / this.fov,
        -this.height / this.fov,
        this.height / this.fov,
        -this.far,
        this.far,
        this.isProjectionTransposed()
      );
    }
    this.scene?.updateProjectionMatrix(this.projectionMatrix);
  }

  public getRotation() {
    return new Vector([this.elevation, this.azimuth, 0]);
  }
}

export default Camera;
