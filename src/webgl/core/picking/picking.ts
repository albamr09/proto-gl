import { denormalizeColor } from "../../../utils/utils";
import { Vector } from "../../../math/vector";
import { GuideIntances } from "../../models/editor/types";
import Instance from "../../rendering/instance";
import Scene from "../../rendering/scene";
import {
  InstanceAddedPayload,
  InstanceRemovedPayload,
} from "../../rendering/types";
import Framebuffer from "../framebuffer/framebuffer";

class PickingController extends EventTarget {
  private canvas: HTMLCanvasElement;
  private gl: WebGL2RenderingContext;
  private scene: Scene;
  private frameBuffer: Framebuffer;
  private instanceLabels: Set<number[]>;
  private x: number;
  private y: number;
  private lastX: number;
  private lastY: number;
  private selectedObject?: Instance<any, any>;
  private dragStarted: boolean;

  constructor(scene: Scene, canvas: HTMLCanvasElement) {
    super();
    this.canvas = canvas;
    this.gl = scene.getContext();
    this.scene = scene;
    this.x = 0;
    this.y = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.dragStarted = false;
    this.instanceLabels = new Set();
    this.frameBuffer = new Framebuffer({ gl: this.gl, canvas });

    this.scene.addEventListener("render", () => this.render());
    this.scene.addEventListener(
      "instanceadded",
      this.onInstanceAdded.bind(this)
    );
    this.scene.addEventListener(
      "instanceremoved",
      this.onInstanceRemoved.bind(this)
    );
    this.addEditorInstances();
    window.addEventListener("keydown", this.onKeyPressed.bind(this));
    window.addEventListener("keyup", this.onKeyPressed.bind(this));
  }

  private render() {
    const blendingEnabled = this.gl.getParameter(this.gl.BLEND);
    this.gl.disable(this.gl.BLEND);
    this.frameBuffer.bind();
    this.scene.render({ offscreen: true });
    this.frameBuffer.unBind();
    if (blendingEnabled) {
      this.gl.enable(this.gl.BLEND);
    }
  }

  private onInstanceAdded(e: CustomEventInit<InstanceAddedPayload<any, any>>) {
    const { detail: instance } = e;
    if (!instance) return;
    this.registerNewInstance(instance);
  }

  private registerNewInstance(instance: Instance<any, any> | GuideIntances) {
    const newColor = [Math.random(), Math.random(), Math.random(), 1];
    if (!this.instanceLabels.has(newColor)) {
      this.instanceLabels.add(newColor);
      instance.updateUniform("uLabelColor", newColor);
    } else {
      this.registerNewInstance(instance);
    }
  }

  private addEditorInstances() {
    this.scene.getEditorInstances()?.forEach((instance) => {
      this.registerNewInstance(instance);
    });
  }

  private onInstanceRemoved(
    e: CustomEventInit<InstanceRemovedPayload<any, any>>
  ) {
    const { detail: instance } = e;
    const labelColor = instance
      ?.getUniform("uLabelColor")
      ?.getData() as number[];
    if (!labelColor) {
      return;
    }
    this.instanceLabels.delete(labelColor);
  }

  private onKeyPressed(e: KeyboardEvent) {
    this.setDragStarted(e.key !== "Escape");
  }

  private setDragStarted(x: boolean) {
    this.dragStarted = x;
    if (!this.dragStarted) {
      this.scene.disableEditor();
    }
  }

  public onClick(e: MouseEvent) {
    const { x, y } = this.get2DCoords(e);
    this.lastX = x;
    this.lastY = y;
    this.selectedObject = this.getClickedObject(x, y);
    if (this.selectedObject) {
      this.selectedObject.triggerOnClick();
      this.setDragStarted(true);
    }
  }

  /**
   * Calculates the 2D coordinates of a mouse event relative to the canvas element.
   *
   * This method computes the position of a mouse event on a canvas, accounting for
   * the canvas's position within the document and the current scroll position.
   * It also transforms the vertical coordinate from a top-left origin to a
   * bottom-left origin.
   *
   * @param e - The mouse event containing the cursor's position relative to the viewport.
   * @returns An object with the calculated `x` and `y` coordinates:
   *   - `x`: The horizontal position of the mouse relative to the canvas.
   *   - `y`: The vertical position of the mouse relative to the canvas, with the origin at the bottom-left corner.
   */
  private get2DCoords(e: MouseEvent) {
    let top = 0,
      left = 0,
      canvas: HTMLCanvasElement | null = this.canvas;

    while (canvas instanceof HTMLElement && canvas.tagName !== "BODY") {
      top += canvas.offsetTop;
      left += canvas.offsetLeft;
      canvas = canvas.offsetParent as typeof canvas;
    }

    left += window.scrollX;
    top -= window.scrollY;

    return {
      x: e.clientX - left,
      y: this.canvas.height - (e.clientY - top),
    };
  }

  private getClickedObject(x: number, y: number) {
    this.frameBuffer.bind();
    const pixelColor = Array.prototype.map.call(
      this.scene.getPixelColor(x, y),
      (x) => x
    ) as number[];
    this.frameBuffer.unBind();
    return this.scene.findLastAllObjects((object) => {
      const objectColor = this.getHitValue(object);
      if (!objectColor) return;
      const denormalizedColor = denormalizeColor(objectColor);
      if (this.compare(denormalizedColor, pixelColor)) {
        return object;
      }
    });
  }

  private getHitValue(instance: Instance<any, any>) {
    const labelColor = instance.getUniform("uLabelColor");
    return labelColor?.getData() as [number, number, number, number];
  }

  private compare(objectColor: number[], pixelColor: number[]) {
    return objectColor.every((_, i) => {
      return Math.abs(objectColor[i] - pixelColor[i]) <= 1;
    });
  }

  public onDrag(
    e: MouseEvent,
    cameraRotationVector: Vector,
    cameraDistance: number
  ) {
    if (!this.dragStarted) {
      return;
    }

    const { x, y } = this.get2DCoords(e);
    this.x = x;
    this.y = y;

    const dx = this.x - this.lastX;
    const dy = this.y - this.lastY;

    this.selectedObject?.triggerOnDrag(
      dx,
      dy,
      cameraRotationVector,
      cameraDistance
    );
  }

  public onDragFinish() {
    this.selectedObject?.triggerOnDragFinish();
  }

  public isDragging() {
    return this.dragStarted;
  }

  public isCursorOverObject(e: MouseEvent) {
    const { x, y } = this.get2DCoords(e);
    return !!this.getClickedObject(x, y);
  }
}

export default PickingController;
