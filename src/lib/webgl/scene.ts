import Program from "./program.js";
import { Uniform } from "./uniforms.js";

type DataObject<U extends readonly string[]> = {
  ibo: WebGLBuffer | null;
  vao: WebGLVertexArrayObject | null;
  renderingMode?: GLenum;
  len: number;
  uniforms?: {
    [P in U[number]]?: Uniform;
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

    // Uniforms
    const extractedUniforms = (
      Object.keys(uniforms ?? {}) as U[number][]
    ).reduce(
      (dict, k) => {
        const uniform = uniforms?.[k] as UniformDefinition;
        const location = this.program.uniforms[k];
        if (uniform == null || uniform == undefined || !location) return dict;
        dict[k] = new Uniform(
          k,
          uniform.type,
          uniform.size,
          uniform.data,
          location
        );
        return dict;
      },
      {} as {
        [P in U[number]]?: Uniform;
      }
    );

    // Add to list of objects
    this.objects.push({
      vao,
      ibo,
      len,
      renderingMode,
      uniforms: extractedUniforms,
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
        uniform.setData(value);
      }
    });
  }

  render(cb: (o: DataObject<U>) => void = () => {}, clear = true) {
    clear && this.clear();
    this.objects.forEach((o) => {
      // Bind vertices and indices
      this.gl.bindVertexArray(o.vao);
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, o.ibo);
      // Populate uniforms
      for (const uniform of Object.values(o?.uniforms ?? {}) as Uniform[]) {
        if (uniform == null || uniform == undefined) continue;
        uniform.bindUniformForType(this.gl);
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

  /**
   * Setups scene to render
   */
  clear = (heightFactor = 1, widthFactor = 1) => {
    // Define the viewport geometry, this is used internally to map NDC coordinates
    // to the final drawing space
    this.gl.viewport(
      0,
      0,
      this.gl.canvas.width * widthFactor,
      this.gl.canvas.height * heightFactor
    );
    // Clear the scene
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  };
}

export default Scene;
