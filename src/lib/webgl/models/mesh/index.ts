import Instance from "../../instance.js";
import {
  AttributeDefinition,
  InstanceConfiguration,
  UniformDefinition,
} from "../../types.js";
import fragmentShaderSource from "./fs.glsl.js";
import vertexShaderSource from "./vs.glsl.js";

const DefaultAttributes = ["aPosition", "aNormal"] as const;
const DefaultUniforms = [
  "uMaterialDiffuse",
  "uWireFrame",
  "uLightPosition",
  "uLightAmbient",
  "uLightDiffuse",
  "uLightSpecular",
  "uShininess",
  "uTranslation",
] as const;

class Mesh<
  A extends readonly string[] = [],
  U extends readonly string[] = []
> extends Instance<typeof DefaultAttributes, typeof DefaultUniforms> {
  /**
   * Creates an instance that renders any mesh with the given
   * primitives
   */
  constructor({
    id,
    gl,
    attributes,
    indices,
    uniforms,
    configuration,
  }: {
    id: string;
    gl: WebGL2RenderingContext;
    attributes: {
      [P in
        | (typeof DefaultAttributes)[number]
        | A[number]]: AttributeDefinition;
    };
    indices: number[];
    uniforms?: {
      [P in (typeof DefaultUniforms)[number] | U[number]]?: UniformDefinition;
    };
    configuration?: InstanceConfiguration;
  }) {
    super({
      id,
      gl,
      vertexShaderSource,
      fragmentShaderSource,
      attributes,
      indices,
      uniforms,
      configuration,
    });
  }
}

export default Mesh;
