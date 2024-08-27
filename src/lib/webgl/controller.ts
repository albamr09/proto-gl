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
  private downEvents: PointerEvent[];
  private prevDiff: number;

  constructor(camera: Camera, canvas: HTMLCanvasElement) {
    this.camera = camera;
    this.dolly = 0;
    this.isDragging = false;
    this.x = 0;
    this.y = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.motionFactor = 0.1;
    this.downEvents = [];
    this.prevDiff = -1;

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
    canvas.onpointerdown = this.onMouseDown.bind(this);
    canvas.onpointermove = this.onMouseMove.bind(this);
    canvas.onpointerup = this.onMouseUp.bind(this);
    canvas.onpointercancel = this.onMouseUp.bind(this);
    canvas.onpointerout = this.onMouseUp.bind(this);
    canvas.onpointerleave = this.onMouseUp.bind(this);
  }

  onWheel(e: WheelEvent) {
    this.dolly += e.deltaY * this.motionFactor;
    this.camera.dolly(this.dolly);
  }

  // Pinch events, heavily "inspired" by
  // https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events/Pinch_zoom_gestures
  onPointerMove(e: PointerEvent) {
    // const index = this.downEvents.findIndex(
    //   (cachedEv) => cachedEv.pointerId === e.pointerId
    // );
    // this.downEvents[index] = e;
    // console.log(this.downEvents);
    // // If two pointers are down, check for pinch gestures
    // if (this.downEvents.length === 2) {
    //   console.log("here");
    //   // Calculate the distance between the two pointers
    //   const curDiff = Math.abs(
    //     this.downEvents[0].clientX - this.downEvents[1].clientX
    //   );
    //   if (this.prevDiff > 0) {
    //     if (curDiff > this.prevDiff) {
    //       // The distance between the two pointers has increased
    //       this.camera.dolly(curDiff);
    //     }
    //     if (curDiff < this.prevDiff) {
    //       // The distance between the two pointers has decreased
    //       this.camera.dolly(curDiff);
    //     }
    //   }
    //   // Cache the distance for the next move event
    //   this.prevDiff = curDiff;
    // }
  }

  onPointerUp(e: PointerEvent) {
    // Remove this event from the target's cache
    // const index = this.downEvents.findIndex(
    //   (cachedEv) => cachedEv.pointerId === e.pointerId
    // );
    // this.downEvents.splice(index, 1);
    // // If the number of pointers down is less than two then reset diff tracker
    // if (this.downEvents.length < 2) {
    //   this.prevDiff = -1;
    // }
  }

  onMouseDown(e: MouseEvent | PointerEvent) {
    this.isDragging = true;
    this.x = e.clientX;
    this.y = e.clientY;
  }

  onMouseUp(_e: MouseEvent) {
    this.isDragging = false;
  }

  onMouseMove(e: MouseEvent) {
    this.lastX = this.x;
    this.lastY = this.y;

    this.x = e.clientX;
    this.y = e.clientY;

    if (this.isDragging) {
      const dx = this.x - this.lastX;
      const dy = this.y - this.lastY;

      this.camera.setAzimuth(this.camera.azimuth + dx * this.motionFactor);
      this.camera.setElevation(this.camera.elevation + -dy * this.motionFactor);
    }
  }
}

export default Controller;
