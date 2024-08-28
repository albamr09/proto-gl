import Program from "./program.js";

type DataObject<U extends readonly string[]> = {
  ibo: WebGLBuffer | null;
  vao: WebGLVertexArrayObject | null;
  renderingMode?: GLenum;
  len: number;
  uniforms?: {
    [P in U[number]]?: UniformDefinition;
  };
};

export enum UniformType {
  INT,
  FLOAT,
  VECTOR_FLOAT,
  VECTOR_INT,
  MATRIX,
}

type AttributeDefinition = {
  data: number[];
  size: number;
  type: GLenum;
  stride?: number;
  offset?: number;
};

type UniformDefinition = {
  data: any;
  size: number;
  type: UniformType;
};

class Scene<A extends readonly string[], U extends readonly string[]> {
  private gl: WebGL2RenderingContext;
  private program: Program<A, U>;
  private objects: DataObject<U>[];

  constructor(gl: WebGL2RenderingContext, program: Program<A, U>) {
    this.gl = gl;
    this.program = program;
    this.objects = [];
  }

  addObject({
    attributes,
    indices,
    renderingMode,
    uniforms,
  }: {
    attributes: {
      [P in A[number]]?: AttributeDefinition;
    };
    indices: number[];
    renderingMode?: GLenum;
    uniforms?:
      | DataObject<U>["uniforms"]
      | {
          [P in U[number]]?: UniformDefinition;
        };
  }) {
    const vao = this.gl.createVertexArray();
    this.gl.bindVertexArray(vao);

    // Attributes
    for (const attribute of Object.keys(attributes)) {
      const attributeLocation = this.program.getAttribute(attribute);
      const attributeData = attributes[attribute as A[number]];
      if (!attributeData) return;
      const { data, size, type, stride, offset } = attributeData;
      // If attribute location does not exist
      if (attributeLocation < 0) continue;
      const buffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
      this.gl.bufferData(
        this.gl.ARRAY_BUFFER,
        new Float32Array(data),
        this.gl.STATIC_DRAW
      );
      this.gl.vertexAttribPointer(
        attributeLocation,
        size,
        type,
        false,
        stride ?? 0,
        offset ?? 0
      );
      this.gl.enableVertexAttribArray(attributeLocation);
    }

    // Indices
    const ibo = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ibo);
    this.gl.bufferData(
      this.gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices),
      this.gl.STATIC_DRAW
    );
    const len = indices.length;

    // Add to list of objects
    this.objects.push({
      vao,
      ibo,
      len,
      renderingMode,
      uniforms: { ...uniforms },
    });

    // Clean
    this.gl.bindVertexArray(null);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
  }

  updateUniform(uniformName: U[number], value: unknown) {
    this.objects.forEach((o) => {
      // It if exists update
      const uniform = o?.uniforms?.[uniformName];
      if (uniform !== undefined && uniform !== null) {
        uniform.data = value;
      }
    });
  }

  bindUniformForType(
    location: WebGLUniformLocation,
    uniform: UniformDefinition
  ) {
    switch (uniform.type) {
      case UniformType.INT:
        if (uniform.size == 1) {
          this.gl.uniform1i(location, uniform.data);
        } else if (uniform.size == 2) {
          this.gl.uniform2i(location, uniform.data[0], uniform.data[1]);
        } else if (uniform.size == 3) {
          this.gl.uniform3i(
            location,
            uniform.data[0],
            uniform.data[1],
            uniform.data[2]
          );
        } else if (uniform.size == 4) {
          this.gl.uniform4i(
            location,
            uniform.data[0],
            uniform.data[1],
            uniform.data[2],
            uniform.data[3]
          );
        }
        break;
      case UniformType.FLOAT:
        if (uniform.size == 1) {
          this.gl.uniform1f(location, uniform.data);
        } else if (uniform.size == 2) {
          this.gl.uniform2f(location, uniform.data[0], uniform.data[1]);
        } else if (uniform.size == 3) {
          this.gl.uniform3f(
            location,
            uniform.data[0],
            uniform.data[1],
            uniform.data[2]
          );
        } else if (uniform.size == 4) {
          this.gl.uniform4f(
            location,
            uniform.data[0],
            uniform.data[1],
            uniform.data[2],
            uniform.data[3]
          );
        }
        break;
      case UniformType.VECTOR_INT:
        if (uniform.size == 1) {
          this.gl.uniform1iv(location, uniform.data);
        } else if (uniform.size == 2) {
          this.gl.uniform2iv(location, uniform.data);
        } else if (uniform.size == 3) {
          this.gl.uniform3iv(location, uniform.data);
        } else if (uniform.size == 4) {
          this.gl.uniform4iv(location, uniform.data);
        }
        break;
      case UniformType.VECTOR_FLOAT:
        if (uniform.size == 1) {
          this.gl.uniform1fv(location, uniform.data);
        } else if (uniform.size == 2) {
          this.gl.uniform2fv(location, uniform.data);
        } else if (uniform.size == 3) {
          this.gl.uniform3fv(location, uniform.data);
        } else if (uniform.size == 4) {
          this.gl.uniform4fv(location, uniform.data);
        }
        break;
      case UniformType.MATRIX:
        if (uniform.size == 2) {
          this.gl.uniformMatrix2fv(location, false, uniform.data);
        } else if (uniform.size == 3) {
          this.gl.uniformMatrix3fv(location, false, uniform.data);
        } else if (uniform.size == 4) {
          this.gl.uniformMatrix4fv(location, false, uniform.data);
        }
        break;
    }
  }

  render(cb: (o: DataObject<U>) => void = () => {}) {
    this.clear();
    this.objects.forEach((o) => {
      // Bind vertices and indices
      this.gl.bindVertexArray(o.vao);
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, o.ibo);
      // Populate uniforms
      for (const k of Object.keys(o?.uniforms ?? {})) {
        const typedK = k as U[number];
        const uniform = o?.uniforms?.[typedK];
        const location = this.program.uniforms[typedK];
        if (uniform == null || uniform == undefined || !location) continue;
        this.bindUniformForType(location, uniform);
      }

      // Callback
      cb(o);

      // Draw
      this.gl.drawElements(
        o.renderingMode ?? this.gl.TRIANGLES,
        o.len,
        this.gl.UNSIGNED_SHORT,
        0
      );

      // Unbind
      this.gl.bindVertexArray(null);
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
    });
  }

  clear = () => {
    // Clear the scene
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  };
}

export default Scene;
