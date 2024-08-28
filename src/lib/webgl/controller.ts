import Camera from "./camera";

class Controller {
  private camera: Camera;
  private dolly: number;
  private isDragging: boolean;
  private x: number;
  private y: number;
  private lastX: number;
  private lastY: number;
  private motionFactor: number;
  private prevDiff: number;
  private isTouchZoom: boolean;

  constructor(camera: Camera, canvas: HTMLCanvasElement) {
    this.camera = camera;
    this.dolly = 0;
    this.isDragging = false;
    this.x = 0;
    this.y = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.motionFactor = 0.1;
    this.prevDiff = -1;
    this.isTouchZoom = false;

    // Mouse events
    canvas.addEventListener(
      "wheel",
      (e) => {
        this.onWheel(e);
      },
      { passive: true }
    );
    canvas.onmousedown = this.onMouseDown.bind(this);
    canvas.onmousemove = this.onMouseMove.bind(this);
    canvas.onmouseup = this.onMouseUp.bind(this);

    // Touch events
    canvas.ontouchstart = this.onTouchStart.bind(this);
    canvas.ontouchmove = this.onTouchMove.bind(this);
    canvas.ontouchend = this.onTouchEnd.bind(this);
  }

  /**
   * Uses the most updated x, y pointer position to determine how to rotate the camera
   */
  rotate(x: number, y: number) {
    this.lastX = this.x;
    this.lastY = this.y;

    this.x = x;
    this.y = y;

    if (this.isDragging) {
      const dx = this.x - this.lastX;
      const dy = this.y - this.lastY;
      console.log(dx, dy);

      this.camera.setAzimuth(this.camera.azimuth + dx * this.motionFactor);
      this.camera.setElevation(this.camera.elevation + -dy * this.motionFactor);
    }
  }

  onWheel(e: WheelEvent) {
    this.dolly += e.deltaY * this.motionFactor;
    this.camera.dolly(this.dolly);
  }

  onTouchStart(e: TouchEvent) {
    if (e.touches.length === 2) {
      this.isTouchZoom = true;
    } else if (e.touches.length == 1) {
      this.isDragging = true;
      this.x = e.touches[0].clientX;
      this.y = e.touches[0].clientY;
    }
  }

  onTouchMove(e: TouchEvent) {
    // Zoom
    if (this.isTouchZoom) {
      const curDiff = Math.sqrt(
        Math.pow(e.touches[0].pageX - e.touches[1].pageX, 2) +
          Math.pow(e.touches[0].pageY - e.touches[1].pageY, 2)
      );
      // Zoom out: distance between fingers is bigger
      if (curDiff > this.prevDiff) {
        this.dolly -= curDiff * this.motionFactor * 0.5;
      } else {
        // Zoom in: distance between fingers is lower
        this.dolly += curDiff * this.motionFactor * 0.5;
      }
      this.camera.dolly(this.dolly);
      this.prevDiff = curDiff;
    } else if (this.isDragging) {
      // Rotate
      this.rotate(e.touches[0].clientX, e.touches[0].clientY);
    }
  }

  onTouchEnd(e: TouchEvent) {
    if (e.touches.length !== 2) {
      this.isTouchZoom = false;
    }
    if (e.touches.length !== 1) {
      this.isDragging = false;
    }
  }

  onMouseDown(e: MouseEvent) {
    this.isDragging = true;
    this.x = e.clientX;
    this.y = e.clientY;
  }

  onMouseUp(_e: MouseEvent) {
    this.isDragging = false;
  }

  onMouseMove(e: MouseEvent) {
    this.rotate(e.clientX, e.clientY);
  }
}

export default Controller;
