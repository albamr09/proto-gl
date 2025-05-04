import Instance from "../../rendering/instance";
import {
  AttributeConfig,
  InstanceConfiguration,
  UniformDefinition,
} from "../../rendering/types";

import fragmentShaderSource from "./fs.glsl";
import vertexShaderSource from "./vs.glsl";

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
      [P in (typeof DefaultAttributes)[number] | A[number]]: AttributeConfig;
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
