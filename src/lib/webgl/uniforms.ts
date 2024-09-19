import { Matrix4 } from "../math/matrix.js";

export const transformUniforms = [
  "uModelViewMatrix",
  "uNormalMatrix",
  "uProjectionMatrix",
] as const;

export type TransformUniforms = typeof transformUniforms;

export enum UniformType {
  INT,
  FLOAT,
  VECTOR_FLOAT,
  VECTOR_INT,
  MATRIX,
}

export const transformUniformsDefinition: {
  [x in (typeof transformUniforms)[number]]: {
    data: Float32Array;
    type: UniformType;
  };
} = {
  uModelViewMatrix: {
    data: Matrix4.identity().toFloatArray(),
    type: UniformType.MATRIX,
  },
  uNormalMatrix: {
    data: Matrix4.identity().toFloatArray(),
    type: UniformType.MATRIX,
  },
  uProjectionMatrix: {
    data: Matrix4.identity().toFloatArray(),
    type: UniformType.MATRIX,
  },
};

export class Uniform {
  private name: string;
  private type: UniformType;
  private data: any;
  private location?: WebGLUniformLocation;

  constructor(
    name: string,
    type: UniformType,
    data: any,
    location?: WebGLUniformLocation
  ) {
    this.name = name;
    this.type = type;
    this.data = data;
    this.location = location;
  }

  setLocation(location: WebGLUniformLocation) {
    this.location = location;
  }

  setData(data: any) {
    this.data = data;
  }

  getData() {
    return this.data;
  }

  bindUniformForType(gl: WebGL2RenderingContext) {
    if (!this.location)
      throw Error(`Uniform ${this.name} does not have a location assigned`);

    switch (this.type) {
      case UniformType.INT:
        if (!Array.isArray(this.data)) {
          gl.uniform1i(this.location, this.data);
        } else if (this.data.length == 2) {
          gl.uniform2i(this.location, this.data[0], this.data[1]);
        } else if (this.data.length == 3) {
          gl.uniform3i(this.location, this.data[0], this.data[1], this.data[2]);
        } else if (this.data.length == 4) {
          gl.uniform4i(
            this.location,
            this.data[0],
            this.data[1],
            this.data[2],
            this.data[3]
          );
        }
        break;
      case UniformType.FLOAT:
        if (!Array.isArray(this.data)) {
          gl.uniform1f(this.location, this.data);
        } else if (this.data.length == 2) {
          gl.uniform2f(this.location, this.data[0], this.data[1]);
        } else if (this.data.length == 3) {
          gl.uniform3f(this.location, this.data[0], this.data[1], this.data[2]);
        } else if (this.data.length == 4) {
          gl.uniform4f(
            this.location,
            this.data[0],
            this.data[1],
            this.data[2],
            this.data[3]
          );
        }
        break;
      case UniformType.VECTOR_INT:
        if (this.data.length == 1) {
          gl.uniform1iv(this.location, this.data);
        } else if (this.data.length == 2) {
          gl.uniform2iv(this.location, this.data);
        } else if (this.data.length == 3) {
          gl.uniform3iv(this.location, this.data);
        } else if (this.data.length == 4) {
          gl.uniform4iv(this.location, this.data);
        }
        break;
      case UniformType.VECTOR_FLOAT:
        if (this.data.length == 1) {
          gl.uniform1fv(this.location, this.data);
        } else if (this.data.length == 2) {
          gl.uniform2fv(this.location, this.data);
        } else if (this.data.length == 3) {
          gl.uniform3fv(this.location, this.data);
        } else if (this.data.length == 4) {
          gl.uniform4fv(this.location, this.data);
        }
        break;
      case UniformType.MATRIX:
        if (this.data.length == 4) {
          gl.uniformMatrix2fv(this.location, false, this.data);
        } else if (this.data.length == 9) {
          gl.uniformMatrix3fv(this.location, false, this.data);
        } else if (this.data.length == 16) {
          gl.uniformMatrix4fv(this.location, false, this.data);
        }
        break;
    }
  }
}
