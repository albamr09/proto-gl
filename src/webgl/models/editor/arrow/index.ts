import { UniformKind } from "../../../core/uniform/types";
import Instance from "../../../rendering/instance";
import fragmentShaderSource from "./fs.glsl";
import vertexShaderSource from "./vs.glsl";
import generateArrow from "./geometry";
import { Matrix4 } from "../../../../math/matrix";
import { ArrowHead, GuideProperties } from "../types";
import { DefaultProperties } from "./constants";
import {
  InstanceDragEndPayload,
  InstanceDragPayload,
} from "../../../rendering/types";

const DefaultAttributes = ["aPosition"] as const;
const DefaultUniforms = [
  "uOffScreen",
  "uMaterialDiffuse",
  "uTransform",
  "uLabelColor",
] as const;

class Arrow extends Instance<typeof DefaultAttributes, typeof DefaultUniforms> {
  private properties: GuideProperties;
  public declare onDrag?: ({
    instance,
    dx,
    dy,
  }: InstanceDragPayload<
    typeof DefaultAttributes,
    typeof DefaultUniforms
  >) => void;
  public declare onDragFinish?: (
    o: InstanceDragEndPayload<typeof DefaultAttributes, typeof DefaultUniforms>
  ) => void;

  constructor({
    gl,
    id,
    properties,
    onDrag,
    onDragFinish,
    arrowHead,
  }: {
    gl: WebGL2RenderingContext;
    id: string;
    properties?: GuideProperties;
    onDrag?: ({
      instance,
      dx,
      dy,
    }: InstanceDragPayload<
      typeof DefaultAttributes,
      typeof DefaultUniforms
    >) => void;
    onDragFinish?: (
      o: InstanceDragEndPayload<
        typeof DefaultAttributes,
        typeof DefaultUniforms
      >
    ) => void;
    arrowHead: ArrowHead;
  }) {
    const { vertices, indices } = Arrow.build(arrowHead);
    properties = { ...DefaultProperties, ...properties };
    super({
      gl,
      id,
      vertexShaderSource,
      fragmentShaderSource,
      attributes: {
        aPosition: {
          data: vertices,
          size: 3,
          type: gl.FLOAT,
        },
      },
      uniforms: {
        uMaterialDiffuse: {
          data: properties.color!,
          type: UniformKind.VECTOR_FLOAT,
        },
        uTransform: {
          data: Matrix4.identity().toFloatArray(),
          type: UniformKind.MATRIX,
        },
        uLabelColor: {
          data: [0, 0, 0, 0],
          type: UniformKind.VECTOR_FLOAT,
        },
        uOffScreen: {
          data: 0,
          type: UniformKind.SCALAR_INT,
        },
      },
      indices,
      onDrag,
      onDragFinish,
    });

    this.properties = { ...properties };
    this.updateUniform(
      "uTransform",
      this.computeTransformMatrix().toFloatArray()
    );
  }

  private computeTransformMatrix() {
    return Matrix4.identity()
      .translate(this.properties.translationVector!)
      .rotateVecDeg(this.properties.rotationVector!)
      .scale(this.properties.scaleVector!);
  }

  public updateProperties(properties: GuideProperties) {
    this.properties = { ...this.properties, ...properties };
    this.updateUniform("uMaterialDiffuse", this.properties.color!);
    this.updateUniform(
      "uTransform",
      this.computeTransformMatrix().toFloatArray()
    );
  }

  static build(arrowHead: ArrowHead) {
    return generateArrow({ arrowHead });
  }
}

export default Arrow;
