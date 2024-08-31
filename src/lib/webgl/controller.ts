import { Vector } from "../math/vector.js";
import Camera from "./camera.js";

class Controller {
  private camera: Camera;
  // Config
  private motionFactor: number;
  private followMouse: boolean;
  // State
  private x: number;
  private y: number;
  private lastX: number;
  private lastY: number;
  private dolly: number;
  private prevDiff: number;
  private isDragging: boolean;
  private isTouchZoom: boolean;
  // Callbacks
  public onDollyChange: (dolly: number) => void;
  public onAngleChange: (angle: Vector) => void;

  constructor({
    camera,
    canvas,
    onDollyChange = () => {},
    onAngleChange = () => {},
  }: {
    camera: Camera;
    canvas: HTMLCanvasElement;
    onDollyChange?: (dolly: number) => void;
    onAngleChange?: (angle: Vector) => void;
  }) {
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
    this.followMouse = true;
    this.onAngleChange = onAngleChange;
    this.onDollyChange = onDollyChange;

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

    const azimuth = this.camera.azimuth + dx * this.motionFactor;
    const elevation = this.camera.elevation + -dy * this.motionFactor;
    this.setRotation(elevation, azimuth);
  }

  /**
   * Handles look event (kinda like drag but used with tracking camera)
   */
  look(e: MouseEvent) {
    const { width, height } = e.target as HTMLCanvasElement;
    this.x = e.clientX;
    this.y = e.clientY;
    const azimuth = (this.x - width / 2.0) * this.motionFactor;
    const elevation = -(this.y - height / 2.0) * this.motionFactor;
    this.setRotation(elevation, azimuth);
  }

  /**
   * Handles zoom event
   */
  zoom(e: TouchEvent | WheelEvent) {
    let dolly = this.dolly;
    if (e instanceof WheelEvent) {
      dolly += -e.deltaY * this.motionFactor;
    } else if (e instanceof TouchEvent) {
      const curDiff = Math.sqrt(
        Math.pow(e.touches[0].pageX - e.touches[1].pageX, 2) +
          Math.pow(e.touches[0].pageY - e.touches[1].pageY, 2)
      );
      // Zoom out: distance between fingers is bigger
      if (curDiff > this.prevDiff) {
        dolly -= curDiff * this.motionFactor * 0.5;
      } else {
        // Zoom in: distance between fingers is lower
        dolly += curDiff * this.motionFactor * 0.5;
      }
      this.prevDiff = curDiff;
    }
    this.setDolly(dolly);
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
    } else if (this.camera.isTracking() && this.followMouse) {
      this.look(e);
    }
  }

  onKeyDown(e: KeyboardEvent) {
    let dolly = this.dolly;
    let azimuth = this.camera.azimuth;
    // Emulate first person movement
    if (this.camera.isTracking()) {
      switch (e.key) {
        case "ArrowRight":
        case "d":
          azimuth += 1;
          break;
        case "ArrowLeft":
        case "a":
          azimuth -= 1;
          break;
        case "ArrowUp":
        case "w":
          dolly += 1;
          break;
        case "ArrowDown":
        case "s":
          dolly -= 1;
          break;
      }
      this.setDolly(dolly);
      this.setRotation(this.camera.elevation, azimuth);
    }
  }

  setDolly(dolly: number) {
    if (dolly != this.dolly) {
      this.dolly = dolly;
      this.camera.dolly(this.dolly);
      this.onDollyChange(this.dolly);
    }
  }

  setRotation(x: number, y: number) {
    if (x != this.camera.elevation || y != this.camera.azimuth) {
      this.camera.setElevation(x);
      this.camera.setAzimuth(y);
      this.onAngleChange(new Vector([x, y, 0]));
    }
  }

  setFollowMouse(x: boolean) {
    this.followMouse = x;
  }

  setMotionFactor(factor: number) {
    this.motionFactor = factor;
  }
}

export default Controller;
