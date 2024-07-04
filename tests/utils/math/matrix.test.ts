import { Matrix4 } from "../../../src/utils/math/matrix.js";
import { Vector } from "../../../src/utils/math/vector.js";
import { describe, expect, it } from "../../test.js";

describe("Matrix4", () => {
  it("should create an identity matrix", () => {
    const identity = Matrix4.identity();
    const expected = new Matrix4([
      new Vector([1.0, 0.0, 0.0, 0.0]),
      new Vector([0.0, 1.0, 0.0, 0.0]),
      new Vector([0.0, 0.0, 1.0, 0.0]),
      new Vector([0.0, 0.0, 0.0, 1.0]),
    ]);
    expect(identity).toDeepEqual(expected);
  });

  it("should perform matrix multiplication correctly", () => {
    const m1 = new Matrix4([
      new Vector([0.194, 1.536, 2.001, 4.448]),
      new Vector([1.616, 2.976, 7.069, 0.557]),
      new Vector([4.625, 3.461, 1.169, 8.455]),
      new Vector([7.024, 4.827, 6.737, 7.44]),
    ]);
    const m2 = new Matrix4([
      new Vector([5.289, 5.397, 2.283, 4.99]),
      new Vector([7.782, 8.398, 6, 2.325]),
      new Vector([6.121, 3.341, 0.85, 6.002]),
      new Vector([6.09, 1.183, 0.38, 1.195]),
    ]);
    const out = new Matrix4([
      new Vector([0, 0, 0, 0]),
      new Vector([0, 0, 0, 0]),
      new Vector([0, 0, 0, 0]),
      new Vector([0, 0, 0, 0]),
    ]);

    m1.multiply(out, m2);

    const expected = new Matrix4([
      new Vector([52.315659000000004, 25.893671, 13.049992, 21.864622]),
      new Vector([78.367735, 57.990460000000006, 27.765638, 58.076793]),
      new Vector([110.041526, 67.934497, 35.531425, 48.245638]),
      new Vector([161.260427, 109.755511, 53.551442, 95.598809]),
    ]);

    expect(out).toDeepEqual(expected);
  });

  it("should translate the matrix correctly", () => {
    const m = Matrix4.identity();
    const offset = new Vector([1, 2, 3]);
    const out = Matrix4.copy(m);

    m.translate(out, offset);

    const expected = new Matrix4([
      new Vector([1.0, 0.0, 0.0, 0.0]),
      new Vector([0.0, 1.0, 0.0, 0.0]),
      new Vector([0.0, 0.0, 1.0, 0.0]),
      new Vector([1.0, 2.0, 3.0, 1.0]),
    ]);

    expect(out).toDeepEqual(expected);
  });

  it("should rotate the matrix correctly", () => {
    const m = Matrix4.identity();
    const angle = Math.PI / 4; // 45 degrees
    const out = Matrix4.copy(m);
    const axis = new Vector([1, 0, 0]);

    m.rotate(out, angle, axis);

    const expected = new Matrix4([
      new Vector([1, 0, 0, 0]),
      new Vector([0, Math.cos(angle), Math.sin(angle), 0]),
      new Vector([0, -Math.sin(angle), Math.cos(angle), 0]),
      new Vector([0, 0, 0, 1]),
    ]);

    expect(out).toDeepEqual(expected);
  });

  it("should compute the matrix inverse correctly", () => {
    const m = new Matrix4([
      new Vector([9, 2, 8, 4]),
      new Vector([2, 8, 3, 3]),
      new Vector([0, 9, 5, 0]),
      new Vector([4, 1, 3, 6]),
    ]);
    const inverseMatrix = Matrix4.copy(m);
    m.inverse(inverseMatrix);
    const expectedInverse = new Matrix4([
      new Vector([
        0.15789473684210526314, 0.3114035087719298245, -0.28289473684210526314,
        -0.26096491228070175436,
      ]),
      new Vector([
        -2e-21, 0.2083333333333333333, -0.0625, -0.10416666666666666665,
      ]),
      new Vector([4e-21, -0.375, 0.3125, 0.1875]),
      new Vector([
        -0.1052631578947368421, -0.054824561403508771915,
        0.042763157894736842098, 0.26425438596491228069,
      ]),
    ]);
    expect(inverseMatrix).toDeepEqual(expectedInverse);
  });

  it("should compute the matrix determinant correctly", () => {
    const m = new Matrix4([
      new Vector([9, 2, 8, 4]),
      new Vector([2, 8, 3, 3]),
      new Vector([0, 9, 5, 0]),
      new Vector([4, 1, 3, 6]),
    ]);
    const det = m.det();
    const expectedDet = 912;
    expect(det).toBe(expectedDet);
  });

  it("should compute the decimal matrix determinant correctly", () => {
    const m = new Matrix4([
      new Vector([0.194, 1.536, 2.001, 4.448]),
      new Vector([1.616, 2.976, 7.069, 0.557]),
      new Vector([4.625, 3.461, 1.169, 8.455]),
      new Vector([7.024, 4.827, 6.737, 7.44]),
    ]);
    const det = m.det();
    const expectedDet = 160.62513866206905;
    expect(det).toBe(expectedDet);
  });
});
