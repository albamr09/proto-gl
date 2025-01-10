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
import { computeMotionFactorForZoom, computeDragVector } from "./math.js";

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
      onDrag: this.onDrag.bind(this),
      onDragFinish: this.onEditionFinished.bind(this),
      onScale: this.onScale.bind(this),
      onScaleFinish: this.onEditionFinished.bind(this),
      onRotate: this.onRotate.bind(this),
      onRotateFinish: this.onEditionFinished.bind(this),
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

    const { instance, dx, dy, cameraRotationVector, cameraDistance } = payload;
    const editMode = this.guidesController.getEditMode();
    if (editMode == "move") {
      this.onDrag(instance, dx, dy, cameraRotationVector, cameraDistance);
    } else if (editMode == "scale") {
      this.onScale(instance, dx, dy, cameraRotationVector, cameraDistance);
    } else if (editMode == "rotate") {
      this.onRotate(instance, dx, dy, cameraRotationVector, cameraDistance);
    }
  }

  private onDrag(
    instance: Instance<any, any>,
    dx: number,
    dy: number,
    rotation: Vector,
    distance: number
  ) {
    const id = this.getIdFromInstance(instance);
    const instanceProperties = this.instancesProperties.get(id);
    if (!instanceProperties || !instance) return;

    const { translationVector } = instanceProperties;

    const motionFactorBasedOnDistance = computeMotionFactorForZoom(distance);
    const newTranslationVector = translationVector.sum(
      computeDragVector(dx, dy, rotation, motionFactorBasedOnDistance)
    );

    this.updateInstanceProperties(id, instance, {
      ...instanceProperties,
      translationVector: newTranslationVector,
    });
    this.moveGuidesToObject(instance);
  }

  private updateInstanceProperties(
    id: string,
    instance: Instance<any, any>,
    transform: InstanceProperties
  ) {
    const newTransform = Matrix4.identity()
      .translate(transform.translationVector)
      .rotateVecDeg(transform.rotationVector)
      .scale(transform.scaleVector)
      .toFloatArray();

    instance.updateUniform("uTransform", newTransform);
    instance.updateUniform("uAlpha", 0.8);
    this.updateInstanceLastProperties(id, transform);
    this.moveGuidesToObject(instance);
  }

  private onScale(
    instance: Instance<any, any>,
    dx: number,
    dy: number,
    rotation: Vector,
    distance: number
  ) {
    const id = this.getIdFromInstance(instance);
    const instanceProperties = this.instancesProperties.get(id);
    if (!instanceProperties || !instance) return;

    const { scaleVector } = instanceProperties;

    const motionFactorBasedOnDistance = computeMotionFactorForZoom(distance);
    const newScaleVector = scaleVector
      .sum(computeDragVector(dx, dy, rotation, motionFactorBasedOnDistance))
      .absoluteValue();

    this.updateInstanceProperties(id, instance, {
      ...instanceProperties,
      scaleVector: newScaleVector,
    });
  }

  private onRotate(
    instance: Instance<any, any>,
    dx: number,
    dy: number,
    rotation: Vector,
    distance: number
  ) {
    const id = this.getIdFromInstance(instance);
    const instanceProperties = this.instancesProperties.get(id);
    if (!instanceProperties || !instance) return;

    const { rotationVector } = instanceProperties;

    const motionFactorBasedOnDistance = computeMotionFactorForZoom(distance);
    const mousePositionVector = computeDragVector(
      dy,
      dx,
      rotation,
      10 * motionFactorBasedOnDistance
    );

    this.updateInstanceProperties(id, instance, {
      ...instanceProperties,
      rotationVector: rotationVector.sum(mousePositionVector),
    });
  }

  private getIdFromInstance(instance: Instance<any, any>) {
    const id = instance.getId();
    if (!id) {
      throw new Error("Cannot access properties of an object without id");
    }
    return id;
  }

  private updateInstanceLastProperties(
    id: string,
    properties: Partial<InstanceProperties>
  ) {
    const lastInstanceProperties = this.lastInstanceProperties.get(id);
    if (!lastInstanceProperties) return;

    const newInstanceProperties = {
      ...lastInstanceProperties,
      ...properties,
    };
    this.lastInstanceProperties.set(id, newInstanceProperties);
  }

  public onInstanceDragFinish(payload?: InstanceDragEndPayload<any, any>) {
    this.onEditionFinished(payload);
  }

  private onEditionFinished(instance?: Instance<any, any>) {
    if (!instance) return;
    instance.updateUniform("uAlpha", 1);
    const id = this.getIdFromInstance(instance);
    this.syncInstancePropertiesWithLast(id);
  }

  private syncInstancePropertiesWithLast(id: string) {
    const instanceProperties = this.instancesProperties.get(id);
    const lastInstanceProperties = this.lastInstanceProperties.get(id);
    if (!instanceProperties || !lastInstanceProperties) return;
    const newInstanceProperties = {
      ...instanceProperties,
      ...lastInstanceProperties,
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
