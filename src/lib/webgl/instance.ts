import Axis from "./models/axis.js";
import Floor from "./models/floor.js";
import Program from "./program.js";
import { Uniform, UniformType } from "./uniforms.js";

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

class Instance<A extends readonly string[], U extends readonly string[]> {
  private gl: WebGL2RenderingContext;
  private program: Program<A, U>;
  private uniforms?: {
    [P in U[number]]?: Uniform;
  };
  private vao!: WebGLVertexArrayObject | null;
  private ibo!: WebGLBuffer | null;
  private len!: number;
  private renderingMode!: GLenum;

  /**
   * Creates an object with its own program
   */
  constructor({
    gl,
    program,
    vertexShaderSource,
    fragmentShaderSource,
    attributes,
    indices,
    uniforms,
    renderingMode,
  }: {
    gl: WebGL2RenderingContext;
    program?: Program<A, U>;
    vertexShaderSource?: string;
    fragmentShaderSource?: string;
    attributes: {
      [P in A[number]]?: AttributeDefinition;
    };
    indices: number[];
    uniforms?: {
      [P in U[number]]?: UniformDefinition;
    };
    renderingMode?: GLenum;
  }) {
    this.gl = gl;

    // Create program
    if (program) {
      this.program = program;
    } else if (vertexShaderSource && fragmentShaderSource) {
      this.program = new Program(
        gl,
        vertexShaderSource,
        fragmentShaderSource,
        Object.keys(attributes ?? {}) as readonly string[] as A,
        Object.keys(uniforms ?? {}) as readonly string[] as U
      );
    } else {
      throw Error("Could not create the instance");
    }

    this.renderingMode = renderingMode ?? this.gl.TRIANGLES;

    this.setupAttributes({ attributes, indices });
    this.setupUniforms({ uniforms });
  }

  setupAttributes({
    attributes,
    indices,
  }: {
    attributes: {
      [P in A[number]]?: AttributeDefinition;
    };
    indices: number[];
  }) {
    this.vao = this.gl.createVertexArray();
    this.gl.bindVertexArray(this.vao);

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
    this.ibo = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.ibo);
    this.gl.bufferData(
      this.gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices),
      this.gl.STATIC_DRAW
    );
    this.len = indices.length;

    // Clean
    this.gl.bindVertexArray(null);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
  }

  setupUniforms({
    uniforms,
  }: {
    uniforms?: {
      [P in U[number]]?: UniformDefinition;
    };
  }) {
    // Uniforms
    this.uniforms = (Object.keys(uniforms ?? {}) as U[number][]).reduce(
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
  }

  updateUniform(uniformName: U[number], value: unknown) {
    // It if exists update
    const uniform = this.uniforms?.[uniformName];
    if (uniform !== undefined && uniform !== null) {
      uniform.setData(value);
    }
  }

  render({ cb = () => {} }: { cb?: (o: Instance<A, U>) => void }) {
    // Use this program instance
    this.program.use();
    // Bind vertices and indices
    this.gl.bindVertexArray(this.vao);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.ibo);
    // Populate uniforms
    for (const uniform of Object.values(this?.uniforms ?? {}) as Uniform[]) {
      if (uniform == null || uniform == undefined) continue;
      uniform.bindUniformForType(this.gl);
    }

    // Callback
    cb(this);

    // Draw
    this.gl.drawElements(
      this.renderingMode ?? this.gl.TRIANGLES,
      this.len,
      this.gl.UNSIGNED_SHORT,
      0
    );

    // Unbind
    this.gl.bindVertexArray(null);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
  }

  static fromModel({
    model,
    gl,
    program,
    vertexShaderSource,
    fragmentShaderSource,
  }: {
    model: Floor | Axis;
    gl: WebGL2RenderingContext;
    program?: Program<any, any>;
    vertexShaderSource?: string;
    fragmentShaderSource?: string;
  }) {
    return new Instance({
      gl,
      program,
      vertexShaderSource,
      fragmentShaderSource,
      attributes: {
        aPosition: {
          data: model.vertices,
          size: 3,
          type: gl.FLOAT,
        },
      },
      indices: model.indices,
      uniforms: {
        uMaterialDiffuse: {
          data: model.color,
          size: 4,
          type: UniformType.VECTOR_FLOAT,
        },
        uWireFrame: {
          data: model.wireframe,
          size: 1,
          type: UniformType.INT,
        },
      },
      renderingMode: gl.LINES,
    });
  }
}

export default Instance;
