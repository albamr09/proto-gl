import { computeGeometryCenter, transformVertices } from "../../../math/3d.js";
import { Matrix4 } from "../../../math/matrix.js";
import { Vector } from "../../../math/vector.js";
import { Angle } from "../../../math/angle.js";
import Arrow from "../../models/editor/arrow/index.js";
import Instance from "../instance.js";
import { InstanceDragPayload } from "../types.js";
import { InstanceProperties } from "./controller.js";
import Circle from "../../models/editor/circle/index.js";

class GuidesController {
  private moveGuideInstances: Arrow[];
  private scaleGuideInstances: Arrow[];
  private rotateGuideInstances: Circle[];
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
  private onScale: (
    instance: Instance<any, any>,
    dx: number,
    dy: number,
    rotation: Vector,
    disnance: number
  ) => void;
  private onScaleFinish: (instance?: Instance<any, any>) => void;
  private onRotate: (
    instance: Instance<any, any>,
    dx: number,
    dy: number,
    rotation: Vector,
    disnance: number
  ) => void;
  private onRotateFinish: (instance?: Instance<any, any>) => void;
  private editMode: "move" | "scale" | "rotate";

  constructor({
    gl,
    onDragFinish,
    onDrag,
    onScale,
    onScaleFinish,
    onRotate,
    onRotateFinish,
  }: {
    gl: WebGL2RenderingContext;
    onDrag: (
      instance: Instance<any, any>,
      dx: number,
      dy: number,
      rotation: Vector,
      distance: number
    ) => void;
    onDragFinish: (instance?: Instance<any, any>) => void;
    onScale: (
      instance: Instance<any, any>,
      dx: number,
      dy: number,
      rotation: Vector,
      disnance: number
    ) => void;
    onScaleFinish: (instance?: Instance<any, any>) => void;
    onRotate: (
      instance: Instance<any, any>,
      dx: number,
      dy: number,
      rotation: Vector,
      disnance: number
    ) => void;
    onRotateFinish: (instance?: Instance<any, any>) => void;
  }) {
    this.moveGuideInstances = this.createMoveGuides(gl);
    this.scaleGuideInstances = this.createScaleGuides(gl);
    this.rotateGuideInstances = this.createRotateGuides(gl);
    this.shouldShowGuides = false;
    this.onDrag = onDrag;
    this.onDragFinish = onDragFinish;
    this.onScale = onScale;
    this.onScaleFinish = onScaleFinish;
    this.onRotate = onRotate;
    this.onRotateFinish = onRotateFinish;
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
        this.onDragX(e);
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
        this.onDragY(e);
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
        this.onDragZ(e);
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
        this.onScaleX(e);
      },
      onDragFinish: () => {
        this.onScaleFinish(this.instanceWithGuides);
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
        this.onScaleY(e);
      },
      onDragFinish: () => {
        this.onScaleFinish(this.instanceWithGuides);
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
        this.onScaleZ(e);
      },
      onDragFinish: () => {
        this.onScaleFinish(this.instanceWithGuides);
      },
    });
    return [arrowX, arrowY, arrowZ];
  };

  private createRotateGuides(gl: WebGL2RenderingContext) {
    const circleX = new Circle({
      id: "rotate-x",
      gl,
      properties: {
        color: [1, 0, 0, 0.8],
        rotationVector: new Vector([0, 90, 0]),
      },
      onDrag: (e) => {
        this.onRotateX(e);
      },
      onDragFinish: () => {
        this.onRotateFinish(this.instanceWithGuides);
      },
    });
    const circleY = new Circle({
      id: "rotate-y",
      gl,
      properties: {
        color: [0, 1, 0, 0.8],
        rotationVector: new Vector([90, 0, 0]),
      },
      onDrag: (e) => {
        this.onRotateY(e);
      },
      onDragFinish: () => {
        this.onRotateFinish(this.instanceWithGuides);
      },
    });
    const circleZ = new Circle({
      id: "rotate-z",
      gl,
      properties: {
        color: [0, 0, 1, 0.8],
        rotationVector: new Vector([0, 0, 0]),
      },
      onDrag: (e) => {
        this.onRotateZ(e);
      },
      onDragFinish: () => {
        this.onRotateFinish(this.instanceWithGuides);
      },
    });
    return [circleX, circleY, circleZ];
  }

  private handleModeChange(e: KeyboardEvent) {
    if (e.key == "m") {
      this.editMode = "move";
    } else if (e.key == "s") {
      this.editMode = "scale";
    } else if (e.key == "r") {
      this.editMode = "rotate";
    }
  }

  private onDragX(payload?: InstanceDragPayload<any, any>) {
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

  private onDragY(payload?: InstanceDragPayload<any, any>) {
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
  private onDragZ(payload?: InstanceDragPayload<any, any>) {
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

  private onScaleX(payload?: InstanceDragPayload<any, any>) {
    if (!payload || !this.instanceWithGuides) return;
    const { dx, dy, cameraDistance, cameraRotationVector } = payload;

    this.onScale(
      this.instanceWithGuides,
      this.getXTranslationSign(cameraRotationVector) * (dx + dy),
      0,
      new Vector([0, 0, 0]),
      cameraDistance
    );
  }

  private onScaleY(payload?: InstanceDragPayload<any, any>) {
    if (!payload || !this.instanceWithGuides) return;

    const { dx, dy, cameraDistance } = payload;
    this.onScale(
      this.instanceWithGuides,
      0,
      dx + dy,
      new Vector([0, 0, 0]),
      cameraDistance
    );
  }

  // See onDrag event for more info
  private onScaleZ(payload?: InstanceDragPayload<any, any>) {
    if (!payload || !this.instanceWithGuides) return;

    const { dx, dy, cameraDistance, cameraRotationVector } = payload;
    this.onScale(
      this.instanceWithGuides,
      -this.getZTranslationSign(cameraRotationVector) * (dx + dy),
      0,
      new Vector([0, 90, 0]),
      cameraDistance
    );
  }

  private onRotateX(payload: InstanceDragPayload<any, any>) {
    if (!payload || !this.instanceWithGuides) return;

    const { dx, dy, cameraDistance } = payload;
    this.onRotate(
      this.instanceWithGuides,
      0,
      dx + dy,
      new Vector([0, 0, 0]),
      cameraDistance
    );
  }

  private onRotateY(payload: InstanceDragPayload<any, any>) {
    if (!payload || !this.instanceWithGuides) return;

    const { dx, dy, cameraDistance } = payload;
    this.onRotate(
      this.instanceWithGuides,
      dx + dy,
      0,
      new Vector([0, 0, 0]),
      cameraDistance
    );
  }

  // See onDrag event for more info
  private onRotateZ(payload: InstanceDragPayload<any, any>) {
    if (!payload || !this.instanceWithGuides) return;

    const { dx, dy, cameraDistance, cameraRotationVector } = payload;
    this.onRotate(
      this.instanceWithGuides,
      -this.getZTranslationSign(cameraRotationVector) * (dx + dy),
      0,
      new Vector([90, 0, 0]),
      cameraDistance
    );
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
      instance.render({ depthTest: false });
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
    return [
      ...this.moveGuideInstances,
      ...this.scaleGuideInstances,
      ...this.rotateGuideInstances,
    ];
  }

  public setShowGuides(x: boolean) {
    this.shouldShowGuides = x;
  }

  public findLast(
    cb: (o: Instance<any, any>) => Instance<any, any> | undefined
  ) {
    return (this.getCurrentModeGuides() as Instance<any, any>[]).reduce<
      Instance<any, any> | undefined
    >((objectFound, instance) => {
      return cb(instance) ? instance : objectFound;
    }, undefined);
  }

  private getCurrentModeGuides() {
    if (this.editMode == "move") {
      return this.moveGuideInstances;
    } else if (this.editMode == "scale") {
      return this.scaleGuideInstances;
    } else if (this.editMode == "rotate") {
      return this.rotateGuideInstances;
    }
    return [];
  }

  public setInstanceWithGuides(instance: Instance<any, any>) {
    this.instanceWithGuides = instance;
  }

  public getEditMode() {
    return this.editMode;
  }
}

export default GuidesController;
