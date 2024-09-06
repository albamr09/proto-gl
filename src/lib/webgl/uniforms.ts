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

export class Uniform {
  private name: string;
  private type: UniformType;
  private size: number;
  private data: any;
  private location?: WebGLUniformLocation;

  constructor(
    name: string,
    type: UniformType,
    size: number,
    data: any,
    location?: WebGLUniformLocation
  ) {
    this.name = name;
    this.type = type;
    this.size = size;
    this.data = data;
    this.location = location;
  }

  setLocation(location: WebGLUniformLocation) {
    this.location = location;
  }

  setData(data: any) {
    this.data = data;
  }

  bindUniformForType(gl: WebGL2RenderingContext) {
    if (!this.location)
      throw Error(`Uniform ${this.name} does not have a location assigned`);
    switch (this.type) {
      case UniformType.INT:
        if (this.size == 1) {
          gl.uniform1i(this.location, this.data);
        } else if (this.size == 2) {
          gl.uniform2i(this.location, this.data[0], this.data[1]);
        } else if (this.size == 3) {
          gl.uniform3i(this.location, this.data[0], this.data[1], this.data[2]);
        } else if (this.size == 4) {
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
        if (this.size == 1) {
          gl.uniform1f(this.location, this.data);
        } else if (this.size == 2) {
          gl.uniform2f(this.location, this.data[0], this.data[1]);
        } else if (this.size == 3) {
          gl.uniform3f(this.location, this.data[0], this.data[1], this.data[2]);
        } else if (this.size == 4) {
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
        if (this.size == 1) {
          gl.uniform1iv(this.location, this.data);
        } else if (this.size == 2) {
          gl.uniform2iv(this.location, this.data);
        } else if (this.size == 3) {
          gl.uniform3iv(this.location, this.data);
        } else if (this.size == 4) {
          gl.uniform4iv(this.location, this.data);
        }
        break;
      case UniformType.VECTOR_FLOAT:
        if (this.size == 1) {
          gl.uniform1fv(this.location, this.data);
        } else if (this.size == 2) {
          gl.uniform2fv(this.location, this.data);
        } else if (this.size == 3) {
          gl.uniform3fv(this.location, this.data);
        } else if (this.size == 4) {
          gl.uniform4fv(this.location, this.data);
        }
        break;
      case UniformType.MATRIX:
        if (this.size == 2) {
          gl.uniformMatrix2fv(this.location, false, this.data);
        } else if (this.size == 3) {
          gl.uniformMatrix3fv(this.location, false, this.data);
        } else if (this.size == 4) {
          gl.uniformMatrix4fv(this.location, false, this.data);
        }
        break;
    }
  }
}
