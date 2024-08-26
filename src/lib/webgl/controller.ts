import { Angle } from "../math/angle.js";
import { Vector } from "../math/vector.js";
import Camera from "./camera";

const ZOOM_MULTIPLIER = 0.05;
const ROTATION_MULTIPLIER = 0.5;

class Controller {
  private camera: Camera;
  private dolly: number;
  private isDragging: boolean;
  private initialPosition: Vector;
  private lastAzimuth: number;
  private lastElevation: number;

  constructor(camera: Camera, canvas: HTMLCanvasElement) {
    this.camera = camera;
    this.dolly = 0;
    this.isDragging = false;
    this.initialPosition = new Vector([0, 0]);
    this.lastAzimuth = this.camera.azimuth;
    this.lastElevation = this.camera.elevation;

    // Mouse events
    canvas.onwheel = this.onWheel.bind(this);
    canvas.onmousedown = this.onMouseDown.bind(this);
    canvas.onmouseup = this.onMouseUp.bind(this);
    canvas.onmousemove = this.onMouseMove.bind(this);

    // Touch events
    // https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events/Pinch_zoom_gestures
  }

  onWheel(e: WheelEvent) {
    this.dolly += e.deltaY * ZOOM_MULTIPLIER;
    this.camera.dolly(this.dolly);
  }

  onMouseDown(e: MouseEvent) {
    this.initialPosition = new Vector([e.x, e.y]);
    this.lastAzimuth = this.camera.azimuth;
    this.lastElevation = this.camera.elevation;
    this.isDragging = true;
  }

  onMouseUp(_e: MouseEvent) {
    this.isDragging = false;
  }

  onMouseMove(e: MouseEvent) {
    if (this.isDragging) {
      console.log(e);
      const movementVector = this.initialPosition.sum(new Vector([-e.x, -e.y]));
      const radAngle = movementVector.directionAngle();
      const { movementX: mouseXDirection, movementY: mouseYDirection } = e;
      const unsignedCos = Math.abs(Math.cos(radAngle));
      this.camera.setAzimuth(
        this.camera.azimuth +
          ROTATION_MULTIPLIER * mouseXDirection * unsignedCos
      );
      this.camera.setElevation(
        this.camera.elevation +
          ROTATION_MULTIPLIER * -mouseYDirection * (1 - unsignedCos)
      );
    }
  }
}

export default Controller;
