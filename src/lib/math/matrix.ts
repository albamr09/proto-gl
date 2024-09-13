import { Angle } from "./angle.js";
import { Vector } from "./vector.js";

export class Matrix {
  public matrix: Vector[];

  constructor(data: number[][]) {
    this.matrix = data.map((row) => new Vector(row));
  }

  static identity(n: number) {
    const data = [...Array(n).keys()].map((i) => {
      const row = Array.from({ length: n }, () => 0);
      row[i] = 1;
      return row;
    });
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
    const data = m.matrix.map((r) => [...r.elements]);
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
      return new Matrix4(this.matrix.map((r) => [...r.elements]));
    } else if (this instanceof Matrix3) {
      return new Matrix3(this.matrix.map((r) => [...r.elements]));
    } else if (this instanceof Matrix2) {
      return new Matrix3(this.matrix.map((r) => [...r.elements]));
    }
    return new Matrix(this.matrix.map((r) => [...r.elements]));
  }

  dimension() {
    return 0;
  }

  rows() {
    return 0;
  }

  cols() {
    return 0;
  }

  elements() {
    return this.matrix.map((row) => row.elements);
  }

  at(i: number, j: number) {
    return this.matrix[i].at(j);
  }

  row(i: number) {
    return this.matrix[i];
  }

  col(j: number) {
    return new Vector(this.matrix.map((row) => row.at(j)));
  }

  set(i: number, j: number, value: number) {
    this.row(i).set(j, 0, value);
  }

  setRow(i: number, value: Vector) {
    this.matrix[i] = value;
  }

  toFloatArray() {
    return new Float32Array([...this.matrix.map((r) => r.toArray()).flat()]);
  }

  setColumn(i: number, value: Vector) {
    for (let j = 0; j < this.dimension(); j++) {
      this.matrix[j].set(i, 0, value.at(j));
    }
  }

  filterRowAndCol(i: number, j: number) {
    if (i < 0 || i > this.dimension() || j < 0 || j > this.dimension()) {
      throw Error("Row idx or column idx not present on matrix");
    }
    return this.matrix
      .filter(
        (_, rowIdx) =>
          // Filters out row with idx = i
          rowIdx != i
      )
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
      throw Error("Cannot compute inverse of defficient matrix");
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

  multiply<T extends Matrix | Vector>(m: T): T {
    const _copy = m.copy() as T;
    for (let i = 0; i < this.rows(); i++) {
      for (let j = 0; j < m.cols(); j++) {
        _copy.set(i, j, this.row(i).dot(m.col(j)));
      }
    }
    return _copy;
  }
}

export class Matrix4 extends Matrix {
  constructor(data: number[][]) {
    if (data.some((r) => r.length != 4)) {
      throw Error("Invalid dimension on input data");
    }
    super(data);
  }

  dimension() {
    return 4;
  }

  rows() {
    return this.dimension();
  }

  cols() {
    return this.dimension();
  }

  static identity() {
    return Matrix.identity(4) as Matrix4;
  }

  // Return a matrix that translates the matrix with and offset given by the
  // vector [x, y, z] Reference:
  // https://www.brainvoyager.com/bv/doc/UsersGuide/CoordsAndTransforms/SpatialTransformationMatrices.html
  translate(offset: Vector) {
    const translationMatrix = Matrix4.identity();
    if (offset.dimension() != 3) {
      throw Error("Translate offset has incompatible dimensionality");
    }

    translationMatrix.set(3, 0, offset.at(0));
    translationMatrix.set(3, 1, offset.at(1));
    translationMatrix.set(3, 2, offset.at(2));

    return translationMatrix.multiply(this);
  }

  /**
   * Rotates a matrix by the given vector angle, where the vector angle
   * stores information about the angle of rotation for each axis (x, y, z)
   * The angle is measured in degrees
   **/
  rotateVecDeg(angle: Vector) {
    let result = this as Matrix4;
    result = this.rotateDeg(angle.at(0), new Vector([1, 0, 0]));
    result = result.rotateDeg(angle.at(1), new Vector([0, 1, 0]));
    result = result.rotateDeg(angle.at(2), new Vector([0, 0, 1]));
    return result;
  }

  /**
   * Rotates a matrix by the given vector angle, where the vector angle
   * stores information about the angle of rotation for each axis (x, y, z)
   * The angle is measured in radians
   **/
  rotateVec(angle: Vector) {
    let result = this as Matrix4;
    result = this.rotate(angle.at(0), new Vector([1, 0, 0]));
    result = result.rotate(angle.at(1), new Vector([0, 1, 0]));
    result = result.rotate(angle.at(2), new Vector([0, 0, 1]));
    return result;
  }

  /**
   * Rotates a matrix on the given axis by the given angle (in degreee)
   * For more information see rotate funcion.
   **/
  rotateDeg(angle: number, axis: Vector) {
    return this.rotate(Angle.toRadians(angle), axis);
  }

  /** Rotates a matrix on 3d space on the given axes by the given angle (in radians).
   * Reference: https://mathworld.wolfram.com/RotationMatrix.html
   * In this reference they use 3d rotation matrices, we use 4d rotation matrices
   * to take intro account translation (stored on the las row)
   *
   * Note: by inversing the sign of the sine on the rotation matrices you change
   * the direction of the translation (clockwise or counter-clockwise)
   */
  rotate(angle: number, axis: Vector) {
    let [x, y, z] = [axis.at(0), axis.at(1), axis.at(2)];

    const s = Math.sin(angle);
    const c = Math.cos(angle);

    // Rotation on axis X
    const rotationMatrixX = new Matrix4([
      [1, 0, 0, 0],
      [0, c, -s, 0],
      [0, s, c, 0],
      [0, 0, 0, 1],
    ]);

    // Rotation on axis Y
    const rotationMatrixY = new Matrix4([
      [c, 0, -s, 0],
      [0, 1, 0, 0],
      [s, 0, c, 0],
      [0, 0, 0, 1],
    ]);

    // Rotation on axis Z
    const rotationMatrixZ = new Matrix4([
      [c, s, 0, 0],
      [-s, c, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ]);

    let result = this as Matrix4;

    // Combine rotations based on axis
    // TODO: maybe the multiplications should only be made on a 3x3 matrix?
    // to not apply the rotation on the trasnlation row?¿
    if (x == 1) {
      result = rotationMatrixX.multiply(result);
    }
    if (y == 1) {
      result = rotationMatrixY.multiply(result);
    }
    if (z == 1) {
      result = rotationMatrixZ.multiply(result);
    }

    return result;
  }

  /**
   * Create a perspective projection matrix using a field-of-view and an aspect ratio.
   *
   * Reference: https://albamr09.github.io/src/Notes/ComputerScience/CG/RTGW/04/02_01_perspective.html
   *
   * @param fovy      Number The angle between the upper and lower sides of the viewing frustum.
   * @param aspect    Number The aspect ratio of the viewing window. (width/height).
   * @param near      Number Distance to the near clipping plane along the -Z axis.
   * @param far       Number Distance to the far clipping plane along the -Z axis.
   * @param transpose Boolean Whether we transpose the resulting perspective matrix.
   */
  static perspective(
    fovy: number,
    aspect: number,
    near: number,
    far: number,
    transpose = true
  ) {
    const rad = Angle.toRadians(fovy);
    const t = Math.tan(rad / 2) * near;
    const b = -t;
    const r = t * aspect;
    const l = b * aspect;

    const m = new Matrix4([
      [(2 * near) / (r - l), 0, (r + l) / (r - l), 0],
      [0, (2 * near) / (t - b), (t + b) / (t - b), 0],
      [0, 0, -(far + near) / (far - near), (-2 * far * near) / (far - near)],
      [0, 0, -1, 0],
    ]);

    if (transpose) {
      // See https://albamr09.github.io/src/Notes/ComputerScience/CG/RTGW/04/01_transformations.html#Transformations-Transposing Transformation or Projection Matrices
      // to know why we would have to transpose this matrix
      return m.transpose() as Matrix4;
    } else {
      return m;
    }
  }

  /**
   * Generates a orthogonal projection matrix with the given bounds.
   *
   * Reference: https://albamr09.github.io/src/Notes/ComputerScience/CG/RTGW/04/02_02_orthographic.html
   *
   * @param l         Left bound of the frustum
   * @param r         Right bound of the frustum
   * @param b         Bottom bound of the frustum
   * @param t         Top bound of the frustum
   * @param n         Near bound of the frustum
   * @param f         Far bound of the frustum
   * @param transpose Boolean Whether we transpose the resulting perspective matrix.
   */
  static ortho(
    l: number,
    r: number,
    b: number,
    t: number,
    n: number,
    f: number,
    transpose = true
  ) {
    const m = new Matrix4([
      [2 / (r - l), 0, 0, -(r + l) / (r - l)],
      [0, 2 / (t - b), 0, -(t + b) / (t - b)],
      [0, 0, -2 / (f - n), -(n + f) / (n - f)],
      [0, 0, 0, 1],
    ]);

    if (transpose) {
      // See https://albamr09.github.io/src/Notes/ComputerScience/CG/RTGW/04/01_transformations.html#Transformations-Transposing Transformation or Projection Matrices
      // to know why we would have to transpose this matrix
      return m.transpose() as Matrix4;
    } else {
      return m;
    }
  }

  submatrix(i: number, j: number) {
    return new Matrix3(this.filterRowAndCol(i, j));
  }

  /**
   * Obtains the right vector (orientation on the X axis)
   * This vector is basically the first column on the transformation matrix
   *
   * See https://albamr09.github.io/src/Notes/ComputerScience/CG/RTGW/04.html#Camera-The%20Model-View%20Matrix-Spatial%20Encoding%20of%20the%20World
   */
  rightVector() {
    return new Vector(this.col(0).elements.slice(0, 3));
  }

  /**
   * Obtains the up vector (orientation on the Y axis) which is stored as the
   * second column on the transformation matrix.
   *
   * See https://albamr09.github.io/src/Notes/ComputerScience/CG/RTGW/04.html#Camera-The%20Model-View%20Matrix-Spatial%20Encoding%20of%20the%20World
   */
  upVector() {
    return new Vector(this.col(1).elements.slice(0, 3));
  }

  /**
   * Obtains the right vector (orientation on the Z axis) stored as the
   * third column on the transformation matrix.
   *
   * See https://albamr09.github.io/src/Notes/ComputerScience/CG/RTGW/04.html#Camera-The%20Model-View%20Matrix-Spatial%20Encoding%20of%20the%20World
   */
  normalVector() {
    return new Vector(this.col(2).elements.slice(0, 3));
  }

  static fromFloatArray(data: Float32Array) {
    return new Matrix4([
      [data[0], data[1], data[2], data[3]],
      [data[4], data[5], data[6], data[7]],
      [data[8], data[9], data[10], data[11]],
      [data[12], data[13], data[14], data[15]],
    ]);
  }
}

export class Matrix3 extends Matrix {
  constructor(data: number[][]) {
    if (data.some((r) => r.length != 3)) {
      throw Error("Invalid dimension on input data");
    }
    super(data);
  }

  static identity() {
    return Matrix.identity(2) as Matrix2;
  }

  dimension() {
    return 3;
  }

  rows() {
    return this.dimension();
  }

  cols() {
    return this.dimension();
  }

  submatrix(i: number, j: number) {
    return new Matrix2(this.filterRowAndCol(i, j));
  }
}

export class Matrix2 extends Matrix {
  constructor(data: number[][]) {
    if (data.some((r) => r.length != 2)) {
      throw Error("Invalid dimension on input data");
    }
    super(data);
  }

  static identity() {
    return Matrix.identity(2) as Matrix2;
  }

  dimension() {
    return 2;
  }

  rows() {
    return this.dimension();
  }

  cols() {
    return this.dimension();
  }

  // Determinant of a 2x2 matrix
  // Reference: https://en.wikipedia.org/wiki/Determinant
  det() {
    return this.at(0, 0) * this.at(1, 1) - this.at(0, 1) * this.at(1, 0);
  }
}
