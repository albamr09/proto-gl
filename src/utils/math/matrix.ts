import { Vector } from "./vector.js";

export class Matrix4 {
  public r1: Vector;
  public r2: Vector;
  public r3: Vector;
  public r4: Vector;

  constructor(r1: Vector, r2: Vector, r3: Vector, r4: Vector) {
    this.r1 = r1;
    this.r2 = r2;
    this.r3 = r3;
    this.r4 = r4;
  }

  static identity() {
    return new Matrix4(
      new Vector([1.0, 0.0, 0.0, 0.0]),
      new Vector([0.0, 1.0, 0.0, 0.0]),
      new Vector([0.0, 0.0, 1.0, 0.0]),
      new Vector([0.0, 0.0, 0.0, 1.0])
    );
  }

  toFloatArray() {
    return new Float32Array([
      ...this.r1.toArray(),
      ...this.r2.toArray(),
      ...this.r3.toArray(),
      ...this.r4.toArray(),
    ]);
  }

  translate(offset: Vector) {
    if (offset.dim() != this.r1.dim()) {
      throw Error("Translate offset has incompatible dimensionality");
    }

    this.r4.set(0, offset.at(0));
    this.r4.set(1, offset.at(1));
    this.r4.set(2, offset.at(2));
    this.r4.set(3, offset.at(3));
  }
  
  transpose() {

  }

  inverse() {

  }
}
