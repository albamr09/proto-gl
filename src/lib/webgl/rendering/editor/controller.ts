import { Matrix4 } from "../../../math/matrix.js";
import { Vector } from "../../../math/vector.js";
import Instance from "../instance.js";
import {
  InstanceClickPayload,
  InstanceDragEndPayload,
  InstanceDragPayload,
  InstanceTransformationProperties,
} from "../types.js";
import GuidesController from "./guides.js";
import { computeObjectDragTranslation } from "./math.js";

const MOTION_FACTOR = 0.03;

export type InstanceProperties = {
  scaleVector: Vector;
  translationVector: Vector;
  rotationVector: Vector;
};

class EditorController {
  private instancesProperties: Map<string, InstanceProperties>;
  private lastInstanceProperties: Map<string, InstanceProperties>;
  private guidesController: GuidesController;

  constructor({ gl }: { gl: WebGL2RenderingContext }) {
    this.instancesProperties = new Map();
    this.lastInstanceProperties = new Map();
    this.guidesController = new GuidesController({
      gl,
      onDragFinish: this.onDragFinish.bind(this),
      onDrag: this.onDrag.bind(this),
    });
  }

  public moveGuidesToObject(instance: Instance<any, any>) {
    const id = this.getIdFromInstance(instance);
    const instanceProperties = this.lastInstanceProperties.get(id);
    const vertices = instance.getAttribute("aPosition");
    if (!vertices || !instanceProperties) return;
    this.guidesController.moveGuidesToObject(instanceProperties, vertices);
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
    this.guidesController.render({
      modelViewMatrix,
      normalMatrix,
      projectionMatrix,
    });
  }

  public initializeInstanceProperties(
    id: string,
    transformationProperties?: InstanceTransformationProperties
  ) {
    const { scaleVector, translationVector, rotationVector } =
      transformationProperties ?? {};
    const initialProperties = {
      scaleVector: scaleVector ?? new Vector([1, 1, 1]),
      translationVector: translationVector ?? new Vector([0, 0, 0]),
      rotationVector: rotationVector ?? new Vector([0, 0, 0]),
    };
    this.instancesProperties.set(id, initialProperties);
    this.lastInstanceProperties.set(id, initialProperties);
  }

  public onInstanceDrag(payload?: InstanceDragPayload<any, any>) {
    if (!payload) return;

    const { instance, dx, dy, cameraRotationVector } = payload;
    this.onDrag(instance, dx, dy, cameraRotationVector);
  }

  private onDrag(
    instance: Instance<any, any>,
    dx: number,
    dy: number,
    rotation: Vector
  ) {
    const id = this.getIdFromInstance(instance);
    const instanceProperties = this.instancesProperties.get(id);
    if (!instanceProperties || !instance) return;

    const { translationVector, scaleVector } = instanceProperties;

    const newTranslation = translationVector.sum(
      computeObjectDragTranslation(dx, dy, rotation, MOTION_FACTOR)
    );

    const newTransform = Matrix4.identity()
      .translate(newTranslation)
      .scale(scaleVector)
      .toFloatArray();

    instance.updateUniform("uTransform", newTransform);
    instance.updateUniform("uAlpha", 0.8);
    this.updateInstanceLastProperties(id, newTranslation);
    this.moveGuidesToObject(instance);
  }

  private getIdFromInstance(instance: Instance<any, any>) {
    const id = instance.getId();
    if (!id) {
      throw new Error("Cannot access properties of an object without id");
    }
    return id;
  }

  private updateInstanceLastProperties(id: string, newTranslation: Vector) {
    const lastInstanceProperties = this.lastInstanceProperties.get(id);
    if (!lastInstanceProperties) return;

    const newInstanceProperties = {
      ...lastInstanceProperties,
      translationVector: newTranslation,
    };
    this.lastInstanceProperties.set(id, newInstanceProperties);
  }

  public onInstanceDragFinish(payload?: InstanceDragEndPayload<any, any>) {
    this.onDragFinish(payload);
  }

  private onDragFinish(instance?: Instance<any, any>) {
    if (!instance) return;
    instance.updateUniform("uAlpha", 1);
    const id = this.getIdFromInstance(instance);
    this.updateInstanceProperties(id);
  }

  private updateInstanceProperties(id: string) {
    const instanceProperties = this.instancesProperties.get(id);
    const lastInstanceProperties = this.lastInstanceProperties.get(id);
    if (!instanceProperties || !lastInstanceProperties) return;
    const newInstanceProperties = {
      ...instanceProperties,
      translationVector: lastInstanceProperties.translationVector,
    };
    this.instancesProperties.set(id, newInstanceProperties);
  }

  public onInstanceClick(payload: InstanceClickPayload<any, any>) {
    this.guidesController.setInstanceWithGuides(payload);
  }

  public findLast(
    cb: (o: Instance<any, any>) => Instance<any, any> | undefined
  ) {
    return this.guidesController.findLast(cb);
  }

  public showGuides() {
    this.guidesController.setShowGuides(true);
  }

  public hideGuides() {
    this.guidesController.setShowGuides(false);
  }
}

export default EditorController;
