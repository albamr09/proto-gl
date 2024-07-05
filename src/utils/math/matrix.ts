import {Vector} from './vector.js';

export class Matrix {
  public matrix: Vector[];

  constructor(data: number[][]) {
    this.matrix = data.map(row => new Vector(row));
  }

  static identity(n: number) {
    const data = [...Array(n).keys()].map(i => {
      const row = Array.from({length: n}, () => 0);
      row[i] = 1;
      return row;
    })
    if (n == 4) {
      return new Matrix4(data);
    } else if (n == 3) {
      return new Matrix3(data);
    } else if (n == 2) {
      return new Matrix2(data);
    }

    return new Matrix(data);
  }

  static copy(m: Matrix) {
    const data = m.matrix.map(r => [...r.elements]);
    if (m.dimension() == 4) {
      return new Matrix4(data);
    } else if (m.dimension() == 3) {
      return new Matrix3(data);
    } else if (m.dimension() == 2) {
      return new Matrix2(data);
    }
    return new Matrix(data);
  }

  copy(): Matrix {
    if (this instanceof Matrix4) {
      return new Matrix4(this.matrix.map(r => [...r.elements]));
    } else if (this instanceof Matrix3) {
      return new Matrix3(this.matrix.map(r => [...r.elements]));
    } else if (this instanceof Matrix2) {
      return new Matrix3(this.matrix.map(r => [...r.elements]));
    }
    return new Matrix(this.matrix.map(r => [...r.elements]));
  }

  dimension() {
    return 0;
  }

  elements() {
    return this.matrix.map(row => row.elements);
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
      throw Error('Row idx or column idx not present on matrix');
    }
    return this.matrix
        .filter(
            (_, rowIdx) =>
                // Filters out row with idx = i
            rowIdx != i)
        .map((row) => {
          // Filters out columns with idx = j
          return row.toArray().filter((_, idx) => idx != j);
        });
  }

  scalarMultiply(x: number) {
    const _copy = this.copy();
    for (let i = 0; i < this.dimension(); i++) {
      for (let j = 0; j < this.dimension(); j++) {
        _copy.set(i, j, this.at(i, j) * x);
      }
    }
    return _copy;
  }

  submatrix(_i: number, _j: number) {
    return new Matrix([]);
  }

  // Compute the determinant by expanding the first column and summing the
  // cofactor of each element on the column
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
  inverse() {
    const _copy = this.copy();
    const determinant = this.det();
    if (determinant == 0) {
      throw Error('Cannot compute inverse of defficient matrix');
    }

    for (let i = 0; i < this.dimension(); i++) {
      for (let j = 0; j < this.dimension(); j++) {
        // Obtain minor
        const M_ji = this.submatrix(j, i).det();
        // Obtain cofactor
        const A_ij = Math.pow(-1, i + j) * M_ji;
        // Update result matrix
        _copy.set(i, j, A_ij);
      }
    }
    return _copy.scalarMultiply(1.0 / determinant);
  }

  // Returns the transposed version of the matrix
  transpose() {
    const copy = this.copy();
    for (let i = 0; i < this.dimension(); i++) {
      // out.setColumn(i, this.row(i));
      for (let j = 0; j < this.dimension(); j++) {
        copy.set(i, j, this.at(j, i));
      }
    }
    return copy;
  }

  multiply<T extends Matrix>(m: T): T {
    const _copy = this.copy() as T;
    for (let i = 0; i < this.dimension(); i++) {
      for (let j = 0; j < this.dimension(); j++) {
        _copy.set(i, j, this.row(i).dot(m.col(j)));
      }
    }
    return _copy;
  }
}

export class Matrix4 extends Matrix {
  constructor(data: number[][]) {
    if (data.some((r) => r.length != 4)) {
      throw Error('Invalid dimension on input data');
    }
    super(data);
  }

  dimension() {
    return 4;
  }

  static identity() {
    return Matrix.identity(4) as Matrix4;
  }

  // Return a matrix that translates the matrix with and offset given by the
  // vector [x, y, z] Reference:
  // https://www.brainvoyager.com/bv/doc/UsersGuide/CoordsAndTransforms/SpatialTransformationMatrices.html
  translate(offset: Vector) {
    const _copy = this.copy();
    if (offset.dim() != 3) {
      throw Error('Translate offset has incompatible dimensionality');
    }

    _copy.set(3, 0, offset.at(0));
    _copy.set(3, 1, offset.at(1));
    _copy.set(3, 2, offset.at(2));

    return _copy as Matrix4;
  }

  rotateDeg(angle: number, axis: Vector) {
    const rad = angle * Math.PI / 180.0;
    return this.rotate(rad, axis);
  }

  rotate(angle: number, axis: Vector) {
    let [x, y, z] = [axis.at(0), axis.at(1), axis.at(2)];
    let len = Math.hypot(x, y, z);

    if (len < Number.EPSILON) {
      throw new Error('Axis vector length is too small');
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
      [x * x * t + c, y * x * t + z * s, z * x * t - y * s, 0],
      [x * y * t - z * s, y * y * t + c, z * y * t + x * s, 0],
      [x * z * t + y * s, y * z * t - x * s, z * z * t + c, 0], [0, 0, 0, 1]
    ]);

    return this.multiply(r);
  }

  submatrix(i: number, j: number) {
    return new Matrix3(this.filterRowAndCol(i, j));
  }
}

export class Matrix3 extends Matrix {
  constructor(data: number[][]) {
    if (data.some((r) => r.length != 3)) {
      throw Error('Invalid dimension on input data');
    }
    super(data);
  }

  static identity() {
    return Matrix.identity(2) as Matrix2;
  }

  dimension() {
    return 3;
  }

  submatrix(i: number, j: number) {
    return new Matrix2(this.filterRowAndCol(i, j));
  }
}

export class Matrix2 extends Matrix {
  constructor(data: number[][]) {
    if (data.some((r) => r.length != 2)) {
      throw Error('Invalid dimension on input data');
    }
    super(data);
  }

  static identity() {
    return Matrix.identity(2) as Matrix2;
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
