import { Vector } from "./vector.js";

class Matrix {
  public matrix: Vector[];

  constructor() {
    this.matrix = [];
  }

  dimension() {
    return 0;
  }

  at(i: number, j: number) {
    return this.matrix[i].at(j);
  }

  row(i: number) {
    return this.matrix[i];
  }

  col(j: number) {
    return new Vector(this.matrix.map(row => row.at(j)));
  }

  set(i: number, j: number, value: number) {
    this.row(i).set(j, value);
  }

  setRow(i: number, value: Vector) {
    this.matrix[i] = value;
  }

  toFloatArray() {
    return new Float32Array([...this.matrix.map((r) => r.toArray()).flat()]);
  }

  setColumn(i: number, value: Vector) {
    for (let j = 0; j < this.dimension(); j++) {
      this.matrix[j].set(i, value.at(j));
    }
  }

  filterRowAndCol(i: number, j: number) {
    if (i < 0 || i > this.dimension() || j < 0 || j > this.dimension()) {
      throw Error("Row idx or column idx not present on matrix");
    }
    return this.matrix
      .filter(
        (_, rowIdx) =>
          //Filters out row with idx = i
          rowIdx != i
      )
      .map((row) => {
        //Filters out columns with idx = j
        return new Vector(row.toArray().filter((_, idx) => idx != j));
      });
  }

  scalarMultiply(out: Matrix, x: number){
    for (let i = 0; i < this.dimension(); i++) {
      for (let j = 0; j < this.dimension(); j++) {
        out.set(i, j, this.at(i, j) * x);
      }
    }
  }

  submatrix(_i: number, _j: number) {
    return new Matrix();
  }

  // Compute the determinant by expanding the first column and summing the cofactor of each
  // element on the column
  det(): number {
    const j = 1;
    return [...Array(this.dimension()).keys()].reduce((acc, i) => {
      // Compute minor (determinant of submatrix)
      const minor = this.submatrix(i, j).det();
      // Compute cofactor
      const cofactor = Math.pow(-1, i + j) * minor;
      // Sum the cofactor multiplied by a(i, j) to the result
      return acc + this.at(i, j) * cofactor;
    }, 0);
  }

  // Reference: https://semath.info/src/inverse-cofactor-ex4.html
  inverse(out: Matrix) {
    const determinant = this.det();
    if (determinant == 0) {
      throw Error("Cannot compute inverse of defficient matrix");
    }

    for (let i = 0; i < this.dimension(); i++) {
      for (let j = 0; j < this.dimension(); j++) {
        // Obtain minor
        const M_ji = this.submatrix(j, i).det();
        // Obtain cofactor
        const A_ij = Math.pow(-1, i + j) * M_ji;
        // Update result matrix
        out.set(i, j, A_ij);
      }
    }
    out.scalarMultiply(out, 1.0 / determinant);
  }
  
  // Returns the transposed version of the matrix
  transpose(out: Matrix) {
    out.setColumn(0, this.row(0));
    out.setColumn(1, this.row(1));
    out.setColumn(2, this.row(2));
    out.setColumn(3, this.row(3));
  }

  multiply(out: Matrix4, m: Matrix4) {
    for (let i = 0; i < this.dimension(); i++) {
      for (let j = 0; j < this.dimension(); j++) {
        out.set(i, j, this.row(i).dot(m.col(j)))
      }
    }
  }
}

export class Matrix4 extends Matrix {
  constructor(data: Vector[]) {
    super();
    if (data.some((r) => r.dim() != this.dimension())) {
      throw Error("Invalid dimension on input data");
    }
    this.matrix = data;
  }

  static identity() {
    return new Matrix4([
      new Vector([1.0, 0.0, 0.0, 0.0]),
      new Vector([0.0, 1.0, 0.0, 0.0]),
      new Vector([0.0, 0.0, 1.0, 0.0]),
      new Vector([0.0, 0.0, 0.0, 1.0]),
    ]);
  }

  static copy(m: Matrix4) {
    return new Matrix4([
      Vector.copy(m.row(0)),
      Vector.copy(m.row(1)),
      Vector.copy(m.row(2)),
      Vector.copy(m.row(3)),
    ]);
  }

  dimension() {
    return 4;
  }

  // Return a matrix that translates the matrix with and offset given by the vector [x, y, z]
  // Reference: https://www.brainvoyager.com/bv/doc/UsersGuide/CoordsAndTransforms/SpatialTransformationMatrices.html
  translate(out: Matrix4, offset: Vector) {
    if (offset.dim() != 3) {
      throw Error("Translate offset has incompatible dimensionality");
    }

    out.set(3, 0, offset.at(0));
    out.set(3, 1, offset.at(1));
    out.set(3, 2, offset.at(2));
  }

  rotateDeg(out: Matrix4, angle: number, axis: Vector) {
    const rad = angle * Math.PI / 180.0;
    this.rotate(out, rad, axis);
  }

  rotate(out: Matrix4, angle: number, axis: Vector) {
    let [x, y, z] = [axis.at(0), axis.at(1), axis.at(2)];
    let len = Math.hypot(x, y, z);
    
    if (len < Number.EPSILON) {
      throw new Error("Axis vector length is too small");
    }
    
    len = 1 / len;
    x *= len;
    y *= len;
    z *= len;
    
    const s = Math.sin(angle);
    const c = Math.cos(angle);
    const t = 1 - c;
    
    // Construct the rotation matrix
    const r = new Matrix4([
      new Vector([x * x * t + c, y * x * t + z * s, z * x * t - y * s, 0]),
      new Vector([x * y * t - z * s, y * y * t + c, z * y * t + x * s, 0]),
      new Vector([x * z * t + y * s, y * z * t - x * s, z * z * t + c, 0]),
      new Vector([0, 0, 0, 1])
    ]);

    this.multiply(out, r);
  }

  submatrix(i: number, j: number) {
    return new Matrix3(this.filterRowAndCol(i, j));
  }
}

export class Matrix3 extends Matrix {
  public matrix: Vector[];

  constructor(data: Vector[]) {
    super();
    if (data.some((r) => r.dim() != this.dimension())) {
      throw Error("Invalid dimension on input data");
    }
    this.matrix = data;
  }

  static identity() {
    return new Matrix3([
      new Vector([1.0, 0.0, 0.0]),
      new Vector([0.0, 1.0, 0.0]),
      new Vector([0.0, 0.0, 1.0]),
    ]);
  }

  dimension() {
    return 3;
  }

  submatrix(i: number, j: number) {
    return new Matrix2(this.filterRowAndCol(i, j));
  }
}

export class Matrix2 extends Matrix {
  public matrix: Vector[];

  constructor(data: Vector[]) {
    super();
    if (data.some((r) => r.dim() != this.dimension())) {
      throw Error("Invalid dimension on input data");
    }
    this.matrix = data;
  }

  dimension(): number {
    return 2;
  }

  // Determinant of a 2x2 matrix
  // Reference: https://en.wikipedia.org/wiki/Determinant
  det() {
    return this.at(0, 0) * this.at(1, 1) - this.at(0, 1) * this.at(1, 0);
  }
}
