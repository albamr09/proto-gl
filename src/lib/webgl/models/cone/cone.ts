import Instance, {
  AttributeDefinition,
  UniformDefinition,
} from "../../instance.js";
import fragmentShaderSource from "./fs.glsl.js";
import vertexShaderSource from "./vs.glsl.js";

const DefaultAttributes = ["aPosition"] as const;
const DefaultUniforms = [
  "uMaterialDiffuse",
  "uWireFrame",
  "uLightPosition",
  "uLightAmbient",
  "uLightDiffuse",
  "uLightSpecular",
  "uShininess",
] as const;

class Cone<
  A extends readonly string[] = [],
  U extends readonly string[] = []
> extends Instance<typeof DefaultAttributes, typeof DefaultUniforms> {
  /**
   * Creates an object with its own program
   */
  constructor({
    gl,
    attributes,
    indices,
    uniforms,
    renderingMode,
  }: {
    gl: WebGL2RenderingContext;
    attributes: {
      [P in
        | (typeof DefaultAttributes)[number]
        | A[number]]?: AttributeDefinition;
    };
    indices: number[];
    uniforms?: {
      [P in (typeof DefaultUniforms)[number] | U[number]]?: UniformDefinition;
    };
    renderingMode?: GLenum;
  }) {
    super({
      gl,
      vertexShaderSource,
      fragmentShaderSource,
      attributes,
      indices,
      uniforms,
      renderingMode,
    });
  }
}

export default Cone;
