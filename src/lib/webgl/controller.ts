import Camera from "./camera.js";

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

    // Key events
    window.onkeydown = this.onKeyDown.bind(this);
  }

  /**
   * Handles drag event
   */
  drag(e: MouseEvent | TouchEvent) {
    this.lastX = this.x;
    this.lastY = this.y;

    if (e instanceof MouseEvent) {
      this.x = e.clientX;
      this.y = e.clientY;
    } else if (e instanceof TouchEvent) {
      this.x = e.touches[0].clientX;
      this.y = e.touches[0].clientY;
    }

    const dx = this.x - this.lastX;
    const dy = this.y - this.lastY;

    this.camera.setAzimuth(this.camera.azimuth + dx * this.motionFactor);
    this.camera.setElevation(this.camera.elevation + -dy * this.motionFactor);
  }

  /**
   * Handles look event (kinda like drag but used with tracking camera)
   */
  look(e: MouseEvent) {
    const { width, height } = e.target as HTMLCanvasElement;
    this.x = e.clientX;
    this.y = e.clientY;
    this.camera.setAzimuth((this.x - width / 2.0) * this.motionFactor);
    this.camera.setElevation(-(this.y - height / 2.0) * this.motionFactor);
  }

  /**
   * Handles zoom event
   */
  zoom(e: TouchEvent | WheelEvent) {
    if (e instanceof WheelEvent) {
      this.dolly += e.deltaY * this.motionFactor;
      this.camera.dolly(this.dolly);
    } else if (e instanceof TouchEvent) {
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
    }
  }

  onWheel(e: WheelEvent) {
    this.zoom(e);
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
      this.zoom(e);
    } else if (this.isDragging) {
      this.drag(e);
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
    if (this.isDragging) {
      this.drag(e);
    } else if (this.camera.isTracking()) {
      this.look(e);
    }
  }

  onKeyDown(e: KeyboardEvent) {
    // Emulate first person movement
    if (this.camera.isTracking()) {
      switch (e.key) {
        case "ArrowRight":
        case "d":
          this.camera.setAzimuth(this.camera.azimuth + 1);
          break;
        case "ArrowLeft":
        case "a":
          this.camera.setAzimuth(this.camera.azimuth - 1);
          break;
        case "ArrowUp":
        case "w":
          this.dolly += 1;
          break;
        case "ArrowDown":
        case "s":
          this.dolly -= 1;
          break;
      }
      this.camera.dolly(this.dolly);
    }
  }
}

export default Controller;
