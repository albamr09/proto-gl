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
    // Obtain angles by the inverse of the tangent
    return Math.atan(tan);
  }
}
