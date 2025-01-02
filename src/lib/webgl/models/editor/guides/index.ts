import { UniformKind } from "../../../core/uniform/types.js";
import Instance from "../../../rendering/instance.js";
import fragmentShaderSource from "./fs.glsl.js";
import vertexShaderSource from "./vs.glsl.js";
import generateArrow from "./data.js";

const DefaultAttributes = ["aPosition"] as const;
const DefaultUniforms = ["uMaterialDiffuse"] as const;

class EditorGuides extends Instance<
  typeof DefaultAttributes,
  typeof DefaultUniforms
> {
  constructor({ gl }: { gl: WebGL2RenderingContext }) {
    const { vertices, indices } = EditorGuides.build();
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
    });
  }

  static build() {
    return generateArrow();
  }
}

export default EditorGuides;
