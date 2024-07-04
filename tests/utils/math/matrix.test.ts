import { Matrix4 } from "../../../src/utils/math/matrix.js";
import { Vector } from "../../../src/utils/math/vector.js";
import Test from "../../test.js";

class Matrix4Test extends Test {
  static testIdentityMatrix() {
    const identity = Matrix4.identity();
    const expected = new Matrix4([
      new Vector([1.0, 0.0, 0.0, 0.0]),
      new Vector([0.0, 1.0, 0.0, 0.0]),
      new Vector([0.0, 0.0, 1.0, 0.0]),
      new Vector([0.0, 0.0, 0.0, 1.0]),
    ]);
    this.assertEqual(identity, expected, "Identity Matrix Test");
  }

  static testMatrixMultiplication() {
    const m1 = new Matrix4([
      new Vector([1, 2, 3, 4]),
      new Vector([5, 6, 7, 8]),
      new Vector([9, 10, 11, 12]),
      new Vector([13, 14, 15, 16]),
    ]);
    const m2 = new Matrix4([
      new Vector([16, 15, 14, 13]),
      new Vector([12, 11, 10, 9]),
      new Vector([8, 7, 6, 5]),
      new Vector([4, 3, 2, 1]),
    ]);
    const out = new Matrix4([
      new Vector([0, 0, 0, 0]),
      new Vector([0, 0, 0, 0]),
      new Vector([0, 0, 0, 0]),
      new Vector([0, 0, 0, 0]),
    ]);

    m1.multiply(out, m2);

    const expected = new Matrix4([
      new Vector([80, 70, 60, 50]),
      new Vector([240, 214, 188, 162]),
      new Vector([400, 358, 316, 274]),
      new Vector([560, 502, 444, 386]),
    ]);

    this.assertEqual(out, expected, "Matrix Multiplication Test");
  }

  static testTranslation() {
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

    this.assertEqual(out, expected, "Translation Test");
  }

  static testRotation() {
    const m = Matrix4.identity();
    const angle = Math.PI / 4; // 45 degrees
    const out = Matrix4.copy(m);
    const axis = new Vector([1, 0, 0]);

    m.rotate(out, angle, axis);

    const expected = new Matrix4([
      new Vector([1, 0, 0, 0]),
      new Vector([0, Math.cos(angle), -Math.sin(angle), 0]),
      new Vector([0, Math.sin(angle), Math.cos(angle), 0]),
      new Vector([0, 0, 0, 1]),
    ]);

    this.assertEqual(out, expected, "Rotation Test");
  }

  static runAllTests() {
    this.testIdentityMatrix();
    this.testMatrixMultiplication();
    this.testTranslation();
    this.testRotation();
  }
}

// Run the tests
Matrix4Test.runAllTests();
