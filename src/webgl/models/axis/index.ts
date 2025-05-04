import { UniformKind } from "../../core/uniform/types";
import Instance from "../../rendering/instance";
import fragmentShaderSource from "./fs.glsl";
import vertexShaderSource from "./vs.glsl";

const DefaultAttributes = ["aPosition"] as const;
const DefaultUniforms = ["uMaterialDiffuse"] as const;

// Visualize the axis on the screen
class Axis extends Instance<typeof DefaultAttributes, typeof DefaultUniforms> {
  constructor({
    gl,
    dimension = 50,
  }: {
    gl: WebGL2RenderingContext;
    dimension?: number;
  }) {
    const { vertices, indices } = Axis.build(dimension);
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
          data: [1.0, 0.0, 0.0, 1.0],
          type: UniformKind.VECTOR_FLOAT,
        },
      },
      indices,
      configuration: {
        renderingMode: gl.LINES,
      },
    });
  }

  static build(dimension: number) {
    const vertices = [
      -dimension,
      0.0,
      0.0,
      dimension,
      0.0,
      0.0,
      0.0,
      -dimension / 2,
      0.0,
      0.0,
      dimension / 2,
      0.0,
      0.0,
      0.0,
      -dimension,
      0.0,
      0.0,
      dimension,
    ];
    const indices = [0, 1, 2, 3, 4, 5];
    return { vertices, indices };
  }
}

export default Axis;
