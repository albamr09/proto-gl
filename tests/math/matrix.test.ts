import { Matrix4 } from "../../src/math/matrix.js";
import { Vector } from "../../src/math/vector.js";
import { describe, expect, it } from "../test.js";

describe("Matrix4", () => {
  it("should create an identity matrix", () => {
    const identity = Matrix4.identity();
    const expected = new Matrix4([
      [1.0, 0.0, 0.0, 0.0],
      [0.0, 1.0, 0.0, 0.0],
      [0.0, 0.0, 1.0, 0.0],
      [0.0, 0.0, 0.0, 1.0],
    ]);
    expect(identity).toDeepEqual(expected);
  });

  it("should perform matrix multiplication correctly", () => {
    const m1 = new Matrix4([
      [0.194, 1.536, 2.001, 4.448],
      [1.616, 2.976, 7.069, 0.557],
      [4.625, 3.461, 1.169, 8.455],
      [7.024, 4.827, 6.737, 7.44],
    ]);
    const m2 = new Matrix4([
      [5.289, 5.397, 2.283, 4.99],
      [7.782, 8.398, 6, 2.325],
      [6.121, 3.341, 0.85, 6.002],
      [6.09, 1.183, 0.38, 1.195],
    ]);
    const out = m1.multiply(m2);

    const expected = new Matrix4([
      [52.315659000000004, 25.893671, 13.049992, 21.864622],
      [78.367735, 57.990460000000006, 27.765638, 58.076793],
      [110.041526, 67.934497, 35.531425, 48.245638],
      [161.260427, 109.755511, 53.551442, 95.598809],
    ]);

    expect(out).toDeepEqual(expected);
  });

  it("should translate the matrix correctly", () => {
    const m = Matrix4.identity();
    const offset = new Vector([1, 2, 3]);

    const out = m.translate(offset);

    const expected = new Matrix4([
      [1.0, 0.0, 0.0, 0.0],
      [0.0, 1.0, 0.0, 0.0],
      [0.0, 0.0, 1.0, 0.0],
      [1.0, 2.0, 3.0, 1.0],
    ]);

    expect(out).toDeepEqual(expected);
  });

  it("should rotate the matrix correctly", () => {
    const m = Matrix4.identity();
    const angle = Math.PI / 4; // 45 degrees
    const axis = new Vector([1, 0, 0]);

    const out = m.rotate(angle, axis);

    const expected = new Matrix4([
      [1, 0, 0, 0],
      [0, Math.cos(angle), -Math.sin(angle), 0],
      [0, Math.sin(angle), Math.cos(angle), 0],
      [0, 0, 0, 1],
    ]);

    expect(out).toDeepEqual(expected);
  });

  it("should compute the matrix inverse correctly", () => {
    const m = new Matrix4([
      [9, 2, 8, 4],
      [2, 8, 3, 3],
      [0, 9, 5, 0],
      [4, 1, 3, 6],
    ]);
    const inverseMatrix = m.inverse();
    const expectedInverse = new Matrix4([
      [
        0.15789473684210526314, 0.3114035087719298, -0.28289473684210526314,
        -0.26096491228070175436,
      ],
      [0, 0.20833333333333331, -0.0625, -0.10416666666666666],
      [0, -0.375, 0.3125, 0.1875],
      [
        -0.1052631578947368421, -0.054824561403508771915, 0.042763157894736836,
        0.26425438596491224,
      ],
    ]);
    expect(inverseMatrix).toDeepEqual(expectedInverse);
  });

  it("should compute the matrix determinant correctly", () => {
    const m = new Matrix4([
      [9, 2, 8, 4],
      [2, 8, 3, 3],
      [0, 9, 5, 0],
      [4, 1, 3, 6],
    ]);
    const det = m.det();
    const expectedDet = 912;
    expect(det).toBe(expectedDet);
  });

  it("should compute the decimal matrix determinant correctly", () => {
    const m = new Matrix4([
      [0.194, 1.536, 2.001, 4.448],
      [1.616, 2.976, 7.069, 0.557],
      [4.625, 3.461, 1.169, 8.455],
      [7.024, 4.827, 6.737, 7.44],
    ]);
    const det = m.det();
    const expectedDet = 160.62513866206905;
    expect(det).toBe(expectedDet);
  });

  it("should compute scalar multication correctly", () => {
    const m = new Matrix4([
      [0.194, 1.536, 2.001, 4.448],
      [1.616, 2.976, 7.069, 0.557],
      [4.625, 3.461, 1.169, 8.455],
      [7.024, 4.827, 6.737, 7.44],
    ]);
    const scaledM = m.scalarMultiply(5);
    const expected = new Matrix4([
      [5 * 0.194, 5 * 1.536, 5 * 2.001, 5 * 4.448],
      [5 * 1.616, 5 * 2.976, 5 * 7.069, 5 * 0.557],
      [5 * 4.625, 5 * 3.461, 5 * 1.169, 5 * 8.455],
      [5 * 7.024, 5 * 4.827, 5 * 6.737, 5 * 7.44],
    ]);
    expect(scaledM).toDeepEqual(expected);
  });
});
