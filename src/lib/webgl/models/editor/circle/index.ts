import { UniformKind } from "../../../core/uniform/types.js";
import Instance from "../../../rendering/instance.js";
import fragmentShaderSource from "./fs.glsl.js";
import vertexShaderSource from "./vs.glsl.js";
import { Matrix4 } from "../../../../math/matrix.js";
import { GuideProperties } from "../types.js";
import { DefaultProperties } from "./constants.js";
import {
  InstanceDragEndPayload,
  InstanceDragPayload,
} from "../../../rendering/types.js";
import { generateCircle } from "./geometry.js";

const DefaultAttributes = ["aPosition"] as const;
const DefaultUniforms = [
  "uMaterialDiffuse",
  "uTransform",
  "uOffScreen",
  "uLabelColor",
] as const;

class Circle extends Instance<
  typeof DefaultAttributes,
  typeof DefaultUniforms
> {
  private properties: GuideProperties;
  public onDrag?: ({
    instance,
    dx,
    dy,
  }: InstanceDragPayload<
    typeof DefaultAttributes,
    typeof DefaultUniforms
  >) => void;
  public onDragFinish?: (
    o: InstanceDragEndPayload<typeof DefaultAttributes, typeof DefaultUniforms>
  ) => void;

  constructor({
    gl,
    id,
    properties,
    onDrag,
    onDragFinish,
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
  }) {
    const { vertices, indices } = Circle.build();
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
          data: false,
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

  static build() {
    return generateCircle();
  }
}

export default Circle;
