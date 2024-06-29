export class Vector {
  public elements: number[];

  constructor(elements: number[]) {
    this.elements = elements;
  }

  toArray() {
    return this.elements;
  }

  at(idx: number) {
    return this.elements[idx];
  }

  dim() {
    return this.elements.length;
  }

  length() {
    return Math.sqrt(
      this.elements.reduce((acc, element) => {
        return acc + element * element;
      }, 0)
    );
  }

  sum(v: Vector) {
    if (this.dim() != v.dim()) {
      throw Error("Cannot sum vectors of different dimensions");
    }
    return new Vector(this.elements.map((_, idx) => this.at(idx) + v.at(idx)));
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
    if (this.dim() != 3) {
      throw new Error("Cross product only implemented for 3-dim vectors");
    }

    return new Vector([
      this.at(1) * v.at(2) - this.at(2) * v.at(1),
      this.at(2) * v.at(0) - this.at(0) * v.at(2),
      this.at(0) * v.at(1) - this.at(1) * v.at(0),
    ]);
  }
}
