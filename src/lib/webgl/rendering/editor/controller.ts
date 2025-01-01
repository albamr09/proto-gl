import { Matrix4 } from "../../../math/matrix.js";
import { Vector } from "../../../math/vector.js";
import Instance from "../instance.js";
import {
  InstanceDragEndPayload,
  InstanceDragPayload,
  InstanceTransformationProperties,
} from "../types.js";

const MOTION_FACTOR = 0.03;

type InstanceProperties = {
  scaleVector: Vector;
  translationVector: Vector;
  rotationVector: Vector;
};

class EditorController {
  private instancesProperties: Map<string, InstanceProperties>;
  private lastInstanceProperties: Map<string, InstanceProperties>;

  constructor() {
    this.instancesProperties = new Map();
    this.lastInstanceProperties = new Map();
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
    const id = this.getIdFromInstance(instance);
    const instanceProperties = this.instancesProperties.get(id);
    if (!instanceProperties) return;

    const { translationVector, scaleVector } = instanceProperties;

    const newTranslation = translationVector.sum(
      this.computeObjectDragTranslation(dx, dy, cameraRotationVector)
    );

    const newTransform = Matrix4.identity()
      .translate(newTranslation)
      .scale(scaleVector)
      .toFloatArray();

    instance.updateUniform("uTransform", newTransform);
    instance.updateUniform("uAlpha", 0.8);
    this.updateInstanceLastProperties(id, newTranslation);
  }

  private getIdFromInstance(instance: Instance<any, any>) {
    const id = instance.getId();
    if (!id) {
      throw new Error("Cannot access properties of an object without id");
    }
    return id;
  }

  private computeObjectDragTranslation(
    dx: number,
    dy: number,
    cameraRotationVector: Vector
  ) {
    const upVector = new Vector([0, dy, 0]);
    const rightVector = new Vector([dx, 0, 0]);
    const { rotatedUpVector, rotatedRightVector } = this.rotateUpRightVectors(
      upVector,
      rightVector,
      cameraRotationVector
    );
    const newTranslationValues = rotatedUpVector.elements.map((_, i) => {
      return (rotatedUpVector.at(i) + rotatedRightVector.at(i)) * MOTION_FACTOR;
    });
    return new Vector(newTranslationValues);
  }

  private rotateUpRightVectors(
    upVector: Vector,
    rightVector: Vector,
    rotationVector: Vector
  ) {
    const rotatedUpVector = upVector.rotateVecDeg(rotationVector);
    const rotatedRightVector = rightVector.rotateVecDeg(rotationVector);

    return { rotatedUpVector, rotatedRightVector };
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
    if (!payload) return;
    const instance = payload;
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
}

export default EditorController;
