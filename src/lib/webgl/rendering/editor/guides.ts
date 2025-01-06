import { computeGeometryCenter, transformVertices } from "../../../math/3d.js";
import { Matrix4 } from "../../../math/matrix.js";
import { Vector } from "../../../math/vector.js";
import { Angle } from "../../../math/angle.js";
import Arrow from "../../models/editor/arrow/index.js";
import Instance from "../instance.js";
import { InstanceDragPayload } from "../types.js";
import { InstanceProperties } from "./controller.js";

class GuidesController {
  private moveGuideInstances: Arrow[];
  private scaleGuideInstances: Arrow[];
  private shouldShowGuides: boolean;
  private instanceWithGuides?: Instance<any, any>;
  private onDrag: (
    instance: Instance<any, any>,
    dx: number,
    dy: number,
    rotation: Vector,
    disnance: number
  ) => void;
  private onDragFinish: (instance?: Instance<any, any>) => void;
  private editMode: "move" | "scale" | "rotate";

  constructor({
    gl,
    onDragFinish,
    onDrag,
  }: {
    gl: WebGL2RenderingContext;
    onDragFinish: (instance?: Instance<any, any>) => void;
    onDrag: (
      instance: Instance<any, any>,
      dx: number,
      dy: number,
      rotation: Vector,
      distance: number
    ) => void;
  }) {
    this.moveGuideInstances = this.createMoveGuides(gl);
    this.scaleGuideInstances = this.createScaleGuides(gl);
    this.shouldShowGuides = false;
    this.onDragFinish = onDragFinish;
    this.onDrag = onDrag;
    this.editMode = "move";
    window.addEventListener("keypress", this.handleModeChange.bind(this));
  }

  private createMoveGuides = (gl: WebGL2RenderingContext) => {
    const arrowX = new Arrow({
      id: "translate-x",
      gl,
      arrowHead: "cone",
      properties: {
        color: [1, 0, 0, 0.8],
        rotationVector: new Vector([0, 0, 90]),
      },
      onDrag: (e) => {
        this.onInstanceXDrag(e);
      },
      onDragFinish: () => {
        this.onDragFinish(this.instanceWithGuides);
      },
    });
    const arrowY = new Arrow({
      id: "translate-y",
      gl,
      arrowHead: "cone",
      properties: {
        color: [0, 1, 0, 0.8],
        rotationVector: new Vector([0, 0, 0]),
      },
      onDrag: (e) => {
        this.onInstanceYDrag(e);
      },
      onDragFinish: () => {
        this.onDragFinish(this.instanceWithGuides);
      },
    });
    const arrowZ = new Arrow({
      id: "translate-z",
      gl,
      arrowHead: "cone",
      properties: {
        color: [0, 0, 1, 0.8],
        rotationVector: new Vector([90, 0, 0]),
      },
      onDrag: (e) => {
        this.onInstanceZDrag(e);
      },
      onDragFinish: () => {
        this.onDragFinish(this.instanceWithGuides);
      },
    });
    return [arrowX, arrowY, arrowZ];
  };

  private createScaleGuides = (gl: WebGL2RenderingContext) => {
    const arrowX = new Arrow({
      id: "scale-x",
      gl,
      arrowHead: "cube",
      properties: {
        color: [1, 0, 0, 0.8],
        rotationVector: new Vector([0, 0, 90]),
      },
      onDrag: (e) => {
        //this.onInstanceXDrag(e);
      },
      onDragFinish: () => {
        //this.onDragFinish(this.instanceWithGuides);
      },
    });
    const arrowY = new Arrow({
      id: "scale-y",
      gl,
      arrowHead: "cube",
      properties: {
        color: [0, 1, 0, 0.8],
        rotationVector: new Vector([0, 0, 0]),
      },
      onDrag: (e) => {
        //this.onInstanceYDrag(e);
      },
      onDragFinish: () => {
        //this.onDragFinish(this.instanceWithGuides);
      },
    });
    const arrowZ = new Arrow({
      id: "scale-z",
      gl,
      arrowHead: "cube",
      properties: {
        color: [0, 0, 1, 0.8],
        rotationVector: new Vector([90, 0, 0]),
      },
      onDrag: (e) => {
        //this.onInstanceZDrag(e);
      },
      onDragFinish: () => {
        //this.onDragFinish(this.instanceWithGuides);
      },
    });
    return [arrowX, arrowY, arrowZ];
  };

  private handleModeChange(e: KeyboardEvent) {
    if (e.key == "m") {
      this.editMode = "move";
    } else if (e.key == "s") {
      this.editMode = "scale";
    } else if (e.key == "r") {
      this.editMode = "rotate";
    }
  }

  private onInstanceXDrag(payload?: InstanceDragPayload<any, any>) {
    if (!payload || !this.instanceWithGuides) return;

    const { dx, dy, cameraDistance, cameraRotationVector } = payload;
    this.onDrag(
      this.instanceWithGuides,
      this.getXTranslationSign(cameraRotationVector) * (dx + dy),
      0,
      new Vector([0, 0, 0]),
      cameraDistance
    );
  }
  private getXTranslationSign(cameraRotationVector: Vector) {
    const safeXAngle = Angle.safeDegAngle(cameraRotationVector.at(0));
    const safeYAngle = Angle.safeDegAngle(cameraRotationVector.at(1));
    const isUpsideDown = safeXAngle > 90 && safeXAngle < 270;
    const isBackwards = safeYAngle > 90 && safeYAngle < 270;

    if (isUpsideDown) {
      return isBackwards ? 1.0 : -1.0;
    } else {
      return isBackwards ? -1.0 : 1.0;
    }
  }

  private onInstanceYDrag(payload?: InstanceDragPayload<any, any>) {
    if (!payload || !this.instanceWithGuides) return;

    const { dx, dy, cameraDistance } = payload;
    this.onDrag(
      this.instanceWithGuides,
      0,
      dx + dy,
      new Vector([0, 0, 0]),
      cameraDistance
    );
  }

  /** We "fool" the drag logic by rotating the camera 90º on the y
   * axis, this is the same as looking at the scene by the side
   * Then the x-y plane becomes the z-y plane and moving the
   * object on the x axis becomes moving the object on the
   * z axis
   * Y                Y
   * |                |
   * |                |
   * |                |
   * |                |
   * |___________ X   |___________ Z
   * */
  private onInstanceZDrag(payload?: InstanceDragPayload<any, any>) {
    if (!payload || !this.instanceWithGuides) return;

    const { dx, dy, cameraDistance, cameraRotationVector } = payload;
    this.onDrag(
      this.instanceWithGuides,
      this.getZTranslationSign(cameraRotationVector) * (dx + dy),
      0,
      new Vector([0, 90, 0]),
      cameraDistance
    );
  }

  private getZTranslationSign(cameraRotationVector: Vector) {
    const safeXAngle = Angle.safeDegAngle(cameraRotationVector.at(0));
    const safeYAngle = Angle.safeDegAngle(cameraRotationVector.at(1));
    const isUpsideDown = safeXAngle > 90 && safeXAngle < 270;
    const isBackwards = safeYAngle > 180 && safeYAngle < 360;

    if (isUpsideDown) {
      return isBackwards ? 1.0 : -1.0;
    } else {
      return isBackwards ? -1.0 : 1.0;
    }
  }

  public render({
    modelViewMatrix,
    normalMatrix,
    projectionMatrix,
  }: {
    modelViewMatrix: Matrix4;
    normalMatrix: Matrix4;
    projectionMatrix: Matrix4;
  }) {
    if (!this.shouldShowGuides) return;
    this.getCurrentModeGuides().forEach((instance) => {
      instance.updateTransformationMatrices({
        modelViewMatrix: modelViewMatrix,
        projectionMatrix: projectionMatrix,
        normalMatrix: normalMatrix,
      });
      instance.render({});
    });
  }

  public moveGuidesToObject(
    instanceProperties: InstanceProperties,
    vertices: number[]
  ) {
    if (!vertices) return;
    const transformedVertices = transformVertices(
      vertices,
      Matrix4.identity().scale(
        instanceProperties?.scaleVector ?? new Vector([1, 1, 1])
      )
    );
    const instanceCenter = new Vector(
      computeGeometryCenter(transformedVertices)
    );
    const guidesCenter =
      instanceProperties?.translationVector.sum(instanceCenter);
    this.getAllGuides().forEach((o) => {
      o.updateProperties({
        translationVector: guidesCenter,
      });
    });
  }

  private getAllGuides() {
    return [...this.moveGuideInstances, ...this.scaleGuideInstances];
  }

  public setShowGuides(x: boolean) {
    this.shouldShowGuides = x;
  }

  public findLast(
    cb: (o: Instance<any, any>) => Instance<any, any> | undefined
  ) {
    return this.getCurrentModeGuides().reduce<Instance<any, any> | undefined>(
      (objectFound, instance) => {
        objectFound = cb(instance as Instance<any, any>)
          ? (instance as Instance<any, any>)
          : objectFound;
        return objectFound;
      },
      undefined
    );
  }

  private getCurrentModeGuides() {
    if (this.editMode == "move") {
      return this.moveGuideInstances;
    } else if (this.editMode == "scale") {
      return this.scaleGuideInstances;
    }
    return [];
  }

  public setInstanceWithGuides(instance: Instance<any, any>) {
    this.instanceWithGuides = instance;
  }
}

export default GuidesController;
