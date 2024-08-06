import { clearScene } from "../web-gl.js";
import Program from "./program.js";

type DataObject<U extends readonly string[]> = {
  ibo: WebGLBuffer | null;
  vao: WebGLVertexArrayObject | null;
  len: number;
  uniforms?: {
    [P in U[number]]?: any;
  };
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
    uniforms,
  }: {
    attributes: {
      [P in A[number]]?: {
        data: number[];
        size: number;
        type: GLenum;
        stride?: number;
        offset?: number;
      };
    };
    indices: number[];
    uniforms?: DataObject<U>["uniforms"];
    wireframe?: boolean;
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
      uniforms: { ...uniforms },
    });

    // Clean
    this.gl.bindVertexArray(null);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
  }

  render(cb: (o: DataObject<U>) => void = () => {}) {
    clearScene(this.gl);
    this.objects.forEach((o) => {
      cb(o);
    });
  }

  clear = () => {
    // Clear the scene
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  };
}

export default Scene;
