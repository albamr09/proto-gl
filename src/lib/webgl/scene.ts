import { clearScene } from "../web-gl.js";
import Program from "./program.js";

type DataObject = {
  ibo: WebGLBuffer | null;
  vao: WebGLVertexArrayObject | null;
  len: number;
};

class Scene<A extends readonly string[], U extends readonly string[]> {
  private gl: WebGL2RenderingContext;
  private program: Program<A, U>;
  private objects: DataObject[];

  constructor(gl: WebGL2RenderingContext, program: Program<A, U>) {
    this.gl = gl;
    this.program = program;
    this.objects = [];
  }

  addObject(
    attributes: {
      [P in A[number]]: {
        data: number[];
        size: number;
        type: GLenum;
        stride?: number;
        offset?: number;
      };
    },
    indices: number[]
  ) {
    const vao = this.gl.createVertexArray();
    this.gl.bindVertexArray(vao);

    // Attributes
    for (const attribute of Object.keys(attributes)) {
      const attributeLocation = this.program.getAttribute(attribute);
      const { data, size, type, stride, offset } =
        attributes[attribute as A[number]];
      // If attribute location does not exist
      if (attributeLocation < 0) continue;
      const buffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
      this.gl.bufferData(
        this.gl.ARRAY_BUFFER,
        new Float32Array(data),
        this.gl.STATIC_DRAW
      );
      // TODO: this should be configurable :(
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
    });

    // Clean
    this.gl.bindVertexArray(null);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
  }

  render() {
    clearScene(this.gl);
    this.objects.forEach((o) => {
      this.gl.bindVertexArray(o.vao);
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, o.ibo);

      this.gl.drawElements(this.gl.TRIANGLES, o.len, this.gl.UNSIGNED_SHORT, 0);

      this.gl.bindVertexArray(null);
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
    });
  }
}

export default Scene;
