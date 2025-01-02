import { Matrix4 } from "../../../math/matrix.js";
import { Vector } from "../../../math/vector.js";
import Arrow from "../../models/editor/arrow/index.js";
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
  private editorInstances: Arrow[];

  constructor({ gl }: { gl: WebGL2RenderingContext }) {
    this.instancesProperties = new Map();
    this.lastInstanceProperties = new Map();
    this.editorInstances = this.createEditorInstances(gl);
  }

  private createEditorInstances = (gl: WebGL2RenderingContext) => {
    const arrowX = new Arrow({
      id: "translate-x",
      gl,
      properties: {
        color: [1, 0, 0, 0.9],
        rotationVector: new Vector([0, 0, 90]),
        translationVector: new Vector([-1, 0, 0]),
      },
    });
    const arrowY = new Arrow({
      id: "translate-y",
      gl,
      properties: {
        color: [0, 1, 0, 0.9],
        rotationVector: new Vector([0, 0, 0]),
        translationVector: new Vector([0, 1, 0]),
      },
    });
    const arrowZ = new Arrow({
      id: "translate-z",
      gl,
      properties: {
        color: [0, 0, 1, 0.9],
        rotationVector: new Vector([90, 0, 0]),
        translationVector: new Vector([0, 0, -1]),
      },
    });
    return [arrowX, arrowY, arrowZ];
  };

  public moveGuidesToObject(instance: Instance<any, any>) {
    const id = this.getIdFromInstance(instance);
    const instanceProperties = this.lastInstanceProperties.get(id);
    this.editorInstances.forEach((o) => {
      const editorObjectId = o.getId();
      if (editorObjectId?.includes("x")) {
        o.updateProperties({
          translationVector: instanceProperties?.translationVector.sum(
            new Vector([-1, 0, 0])
          ),
        });
      } else if (editorObjectId?.includes("y")) {
        o.updateProperties({
          translationVector: instanceProperties?.translationVector.sum(
            new Vector([0, 1, 0])
          ),
        });
      } else if (editorObjectId?.includes("z")) {
        o.updateProperties({
          translationVector: instanceProperties?.translationVector.sum(
            new Vector([0, 0, -1])
          ),
        });
      }
    });
  }

  public getGuides() {
    return this.editorInstances as Instance<any, any>[];
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
    this.moveGuidesToObject(instance);
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
