import { UniformKind } from "../../../core/uniform/types.js";
import Instance from "../../../rendering/instance.js";
import fragmentShaderSource from "./fs.glsl.js";
import vertexShaderSource from "./vs.glsl.js";
import generateArrow from "./geometry.js";
import { Matrix4 } from "../../../../math/matrix.js";
import { ArrowPorperties } from "./types.js";
import { DefaultProperties } from "./constants.js";

const DefaultAttributes = ["aPosition"] as const;
const DefaultUniforms = ["uMaterialDiffuse", "uTransform"] as const;

class Arrow extends Instance<typeof DefaultAttributes, typeof DefaultUniforms> {
  private properties: ArrowPorperties;

  constructor({
    gl,
    properties,
  }: {
    gl: WebGL2RenderingContext;
    properties?: ArrowPorperties;
  }) {
    const { vertices, indices } = Arrow.build();
    properties = { ...DefaultProperties, ...properties };
    super({
      gl,
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
      },
      indices,
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

  static build() {
    return generateArrow({});
  }
}

export default Arrow;
