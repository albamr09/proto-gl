import { Angle } from "./angle.js";
import { Matrix3 } from "./matrix.js";

export class Vector {
  public elements: number[];

  constructor(elements: number[]) {
    this.elements = elements;
  }

  static copy(v: Vector) {
    return v.copy();
  }

  copy() {
    return new Vector([...this.toArray()]);
  }

  toArray() {
    return this.elements;
  }

  at(idx: number) {
    return this.elements[idx];
  }

  set(i: number, _j: number, value: number) {
    return (this.elements[i] = value);
  }

  col(_i: number) {
    return this;
  }

  row(i: number) {
    return new Vector([this.elements[i]]);
  }

  dimension() {
    return this.elements.length;
  }

  rows() {
    return this.dimension();
  }

  cols() {
    return 1;
  }

  length() {
    return Math.sqrt(
      this.elements.reduce((acc, element) => {
        return acc + element * element;
      }, 0)
    );
  }

  negate() {
    return new Vector(this.elements.map((e) => -e));
  }

  sum(v: Vector) {
    if (this.dimension() != v.dimension()) {
      throw Error("Cannot sum vectors of different dimensions");
    }
    return new Vector(this.elements.map((_, idx) => this.at(idx) + v.at(idx)));
  }

  escalarProduct(x: number) {
    return new Vector(this.elements.map((element) => element * x));
  }

  /**
   * Element wise vector multiplicaiton
   */
  multiply(v: Vector) {
    if (this.dimension() != v.dimension()) {
      throw Error("Cannot sum vectors of different dimensions");
    }
    return new Vector(this.elements.map((_, idx) => this.at(idx) * v.at(idx)));
  }

  normalize() {
    const l = this.length();
    return new Vector(this.elements.map((element) => element / l));
  }

  /**
   * Cross product by Sarrus Rule (only for vectors of 3 dimensions)
   * Reference: https://en.wikipedia.org/wiki/Cross_product#Coordinate_notation
   */
  cross(v: Vector) {
    if (this.dimension() != 3) {
      throw new Error("Cross product only implemented for 3-dim vectors");
    }

    return new Vector([
      this.at(1) * v.at(2) - this.at(2) * v.at(1),
      this.at(2) * v.at(0) - this.at(0) * v.at(2),
      this.at(0) * v.at(1) - this.at(1) * v.at(0),
    ]);
  }

  dot(v: Vector) {
    if (this.dimension() != v.dimension()) {
      throw new Error(
        "Cannot compute dot product between vectors of different dimensions"
      );
    }

    return this.elements.reduce((sum, _, idx) => {
      return sum + this.at(idx) * v.at(idx);
    }, 0);
  }

  /**
   * Computes the angle between two vectors using the definition
   * for the dot product.
   */
  angle(v: Vector) {
    if (this.dimension() != v.dimension()) {
      throw new Error(
        "Cannot compute angle between vectors of different dimensions"
      );
    }
    // First compute the value of the cosine
    const cos = this.dot(v) / (this.length() * v.length());
    // Obtain the angle by the inverse of the cosine
    return Math.acos(cos);
  }

  /**
   * Computes the direction angle of a vector by assuming its
   * initial point is at the center (0, 0)
   */
  directionAngle() {
    if (this.dimension() != 2) {
      throw new Error(
        "Cannot compute direction angle for vectors that are not two dimensional"
      );
    }
    // By using the definition of tangent for right triangles: y / x
    const tan = this.at(1) / this.at(0);
    // Tangent is undefined when the vector is parallel to the X axis
    // so the angle can be 0 or 180. When x is positive the angle is 0,
    // when the x is negative the angle is 180
    if (Number.isNaN(tan)) {
      return this.at(0) >= 0 ? 0 : 180;
    }
    // Obtain angles by the inverse of the tangent
    return Math.atan(tan);
  }

  /**
   * Rotates a vector by the given vector angle, where the vector angle
   * stores information about the angle of rotation for each axis (x, y, z)
   * The angle is measured in degrees
   **/
  rotateVecDeg(angle: Vector) {
    let result = this as Vector;
    result = this.rotateDeg(angle.at(0), new Vector([1, 0, 0]));
    result = result.rotateDeg(angle.at(1), new Vector([0, 1, 0]));
    result = result.rotateDeg(angle.at(2), new Vector([0, 0, 1]));
    return result;
  }

  /**
   * Rotates a vector by the given vector angle, where the vector angle
   * stores information about the angle of rotation for each axis (x, y, z)
   * The angle is measured in radians
   **/
  rotateVec(angle: Vector) {
    let result = this as Vector;
    result = this.rotate(angle.at(0), new Vector([1, 0, 0]));
    result = result.rotate(angle.at(1), new Vector([0, 1, 0]));
    result = result.rotate(angle.at(2), new Vector([0, 0, 1]));
    return result;
  }

  /**
   * Rotates a vector on the given axis by the given angle (in degreee)
   * For more information see rotate funcion.
   **/
  rotateDeg(angle: number, axis: Vector) {
    const radAngle = Angle.toRadians(angle);
    return this.rotate(radAngle, axis);
  }

  /** Rotates a vector on 3d space on the given axes by the given angle (in radians).
   *
   * Note: by inversing the sign of the sine on the rotation matrices you change
   * the direction of the translation (clockwise or counter-clockwise)
   */
  rotate(angle: number, axis: Vector) {
    if (this.dimension() !== 3) {
      throw new Error("Rotation for non 3 dimensional vectors no implemented");
    }

    let [x, y, z] = [axis.at(0), axis.at(1), axis.at(2)];

    const s = Math.sin(angle);
    const c = Math.cos(angle);

    // Rotation on axis X
    const rotationMatrixX = new Matrix3([
      [1, 0, 0],
      [0, c, -s],
      [0, s, c],
    ]);

    // Rotation on axis Y
    const rotationMatrixY = new Matrix3([
      [c, 0, -s],
      [0, 1, 0],
      [s, 0, c],
    ]);

    // Rotation on axis Z
    const rotationMatrixZ = new Matrix3([
      [c, s, 0],
      [-s, c, 0],
      [0, 0, 1],
    ]);

    let result = Matrix3.identity();

    // Combine rotations based on axis
    if (x == 1) {
      result = rotationMatrixX.multiply(result);
    }
    if (y == 1) {
      result = rotationMatrixY.multiply(result);
    }
    if (z == 1) {
      result = rotationMatrixZ.multiply(result);
    }

    return result.multiply(this);
  }

  module() {
    return Math.sqrt(
      this.elements.reduce((sum, component) => {
        return sum + Math.pow(component, 2);
      }, 0)
    );
  }

  absoluteValue() {
    return new Vector(
      this.elements.map((component) => {
        return Math.abs(component);
      }, 0)
    );
  }
}
