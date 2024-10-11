import Instance from "../../instance.js";
import { UniformType } from "../../uniforms.js";
import fragmentShaderSource from "./fs.glsl.js";
import vertexShaderSource from "./vs.glsl.js";

const DefaultAttributes = ["aPosition"] as const;
const DefaultUniforms = ["uMaterialDiffuse"] as const;

// Visualize a floor on the screen
class Floor extends Instance<typeof DefaultAttributes, typeof DefaultUniforms> {
  constructor({
    gl,
    dimension = 50,
    lines = 5,
  }: {
    gl: WebGL2RenderingContext;
    dimension?: number;
    lines?: number;
  }) {
    const { vertices, indices } = Floor.build(dimension, lines);
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
          data: [1.0, 1.0, 1.0, 1.0],
          type: UniformType.VECTOR_FLOAT,
        },
      },
      indices,
      configuration: {
        renderingMode: gl.LINES,
      },
    });
  }

  static build(dimension: number, lines: number) {
    lines = (2 * dimension) / lines;
    const inc = (2 * dimension) / lines;
    const v = [];
    const i = [];

    for (let l = 0; l <= lines; l++) {
      v[6 * l] = -dimension;
      v[6 * l + 1] = 0;
      v[6 * l + 2] = -dimension + l * inc;

      v[6 * l + 3] = dimension;
      v[6 * l + 4] = 0;
      v[6 * l + 5] = -dimension + l * inc;

      v[6 * (lines + 1) + 6 * l] = -dimension + l * inc;
      v[6 * (lines + 1) + 6 * l + 1] = 0;
      v[6 * (lines + 1) + 6 * l + 2] = -dimension;

      v[6 * (lines + 1) + 6 * l + 3] = -dimension + l * inc;
      v[6 * (lines + 1) + 6 * l + 4] = 0;
      v[6 * (lines + 1) + 6 * l + 5] = dimension;

      i[2 * l] = 2 * l;
      i[2 * l + 1] = 2 * l + 1;
      i[2 * (lines + 1) + 2 * l] = 2 * (lines + 1) + 2 * l;
      i[2 * (lines + 1) + 2 * l + 1] = 2 * (lines + 1) + 2 * l + 1;
    }

    return { vertices: v, indices: i };
  }
}

export default Floor;
