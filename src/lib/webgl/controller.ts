import { Angle } from "../math/angle.js";
import { Vector } from "../math/vector.js";
import Camera from "./camera";

class Controller {
  private camera: Camera;
  private dolly: number;
  private isDragging: boolean;

  constructor(camera: Camera, canvas: HTMLCanvasElement) {
    this.camera = camera;
    this.dolly = 0;
    this.isDragging = false;

    canvas.onwheel = this.onWheel.bind(this);
    canvas.onmousedown = this.onMouseDown.bind(this);
    canvas.onmouseup = this.onMouseUp.bind(this);
    canvas.onmousemove = this.onMouseMove.bind(this);
  }

  onWheel(e: WheelEvent) {
    this.dolly += e.deltaY * 0.01;
    this.camera.dolly(this.dolly);
  }

  onMouseDown(_e: MouseEvent) {
    this.isDragging = true;
  }

  onMouseUp(_e: MouseEvent) {
    this.isDragging = false;
  }

  onMouseMove(e: MouseEvent) {
    if (this.isDragging) {
      // const radAngle = new Vector([e.pageX, e.pageY]).directionAngle();
      // this.camera.setAzimuth(Angle.toDegrees(radAngle));
      // console.log(radAngle, Angle.toDegrees(radAngle));
    }
  }
}

export default Controller;
