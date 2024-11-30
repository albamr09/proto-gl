import { ConcreteUniforms, UniformDataMapping, UniformKind } from "./types.js";
import {
  FloatUniform,
  IntUniform,
  MatrixUniform,
  VectorFloatUniform,
  VectorIntUniform,
} from "./uniforms.js";

export class UniformFactory {
  static createUniform(
    name: string,
    type: UniformKind,
    data: UniformDataMapping[UniformKind],
    location?: WebGLUniformLocation,
    size?: number,
    transpose?: boolean
  ): ConcreteUniforms {
    switch (type) {
      case UniformKind.SCALAR_INT:
        return new IntUniform(
          name,
          data as UniformDataMapping[UniformKind.SCALAR_INT],
          location,
          size
        );
      case UniformKind.SCALAR_FLOAT:
        return new FloatUniform(
          name,
          data as UniformDataMapping[UniformKind.SCALAR_FLOAT],
          location,
          size
        );
      case UniformKind.VECTOR_INT:
        return new VectorIntUniform(
          name,
          data as UniformDataMapping[UniformKind.VECTOR_INT],
          location,
          size
        );
      case UniformKind.VECTOR_FLOAT:
        return new VectorFloatUniform(
          name,
          data as UniformDataMapping[UniformKind.VECTOR_FLOAT],
          location,
          size
        );
      case UniformKind.MATRIX:
        return new MatrixUniform(
          name,
          data as UniformDataMapping[UniformKind.MATRIX],
          location,
          size,
          transpose ?? false
        );
      default:
        throw new Error(`Unsupported UniformKind: ${type}`);
    }
  }
}
