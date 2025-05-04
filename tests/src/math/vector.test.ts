import { Vector } from "@proto-gl/math/vector";
import { describe, it, expect } from "@test/test";

describe("Vector", () => {
  it("should create a vector", () => {
    const v = new Vector([1, 2, 3]);
    expect(v.toArray()).toDeepEqual([1, 2, 3]);
  });

  it("should copy a vector", () => {
    const v = new Vector([1, 2, 3]);
    const copy = Vector.copy(v);
    expect(copy.toArray()).toDeepEqual(v.toArray());
  });

  it("should access elements correctly", () => {
    const v = new Vector([1, 2, 3]);
    expect(v.at(0)).toBe(1);
    expect(v.at(1)).toBe(2);
    expect(v.at(2)).toBe(3);
  });

  it("should set elements correctly", () => {
    const v = new Vector([1, 2, 3]);
    v.set(1, 0, 5);
    expect(v.at(1)).toBe(5);
  });

  it("should return the correct dimension", () => {
    const v = new Vector([1, 2, 3]);
    expect(v.dimension()).toBe(3);
  });

  it("should calculate the length correctly", () => {
    const v = new Vector([3, 4]);
    expect(v.length()).toBe(5);
  });

  it("should sum vectors correctly", () => {
    const v1 = new Vector([1, 2, 3]);
    const v2 = new Vector([4, 5, 6]);
    const sum = v1.sum(v2);
    expect(sum.toArray()).toDeepEqual([5, 7, 9]);
  });

  it("should normalize the vector correctly", () => {
    const v = new Vector([3, 4]);
    const normalized = v.normalize();
    const expected = new Vector([3 / 5, 4 / 5]);
    expect(normalized.toArray()).toDeepEqual(expected.toArray());
  });

  it("should calculate the cross product correctly", () => {
    const v1 = new Vector([1, 0, 0]);
    const v2 = new Vector([0, 1, 0]);
    const cross = v1.cross(v2);
    const expected = new Vector([0, 0, 1]);
    expect(cross.toArray()).toDeepEqual(expected.toArray());
  });

  it("should calculate the dot product correctly", () => {
    const v1 = new Vector([1, 2, 3]);
    const v2 = new Vector([4, 5, 6]);
    const expected = 32;
    const dotProduct = v1.dot(v2);
    expect(dotProduct).toBe(expected);
  });
});
