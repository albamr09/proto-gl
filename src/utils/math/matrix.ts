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
  translate(offset: Vector) {
    if (offset.dim() != 3) {
      throw Error("Translate offset has incompatible dimensionality");
    }

    const _copy = Matrix4.copy(this);
    _copy.set(3, 0, offset.at(0));
    _copy.set(3, 1, offset.at(1));
    _copy.set(3, 2, offset.at(2));
    return _copy;
  }

  submatrix(i: number, j: number) {
    return new Matrix3(this.filterRowAndCol(i, j));
  }

  // Returns the transposed version of the matrix
  // TODO: try to generalize for any nxn matrix
  transpose() {
    const _copy = Matrix4.copy(this);
    _copy.setColumn(0, this.row(0));
    _copy.setColumn(1, this.row(1));
    _copy.setColumn(2, this.row(2));
    _copy.setColumn(3, this.row(3));
    return _copy;
  }

  // Reference: https://semath.info/src/inverse-cofactor-ex4.html
  inverse() {
    const _copy = Matrix4.copy(this);
    // TODO: check det > 0
    for (let i = 0; i < this.dimension(); i++) {
      for (let j = 0; j < this.dimension(); j++) {
        // Obtain adjugate
        const A_ij = Math.pow(-1, i + j) * this.submatrix(i, j).det();
        // Update result matrix
        _copy.set(i, j, A_ij);
      }
    }
    // TODO multiply by 1/|A|
    return _copy;
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
