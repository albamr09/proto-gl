import { Matrix4 } from "./matrix.js";
import { Vector } from "./vector.js";

/**
 * Source: https://www.khronos.org/opengl/wiki/Calculating_a_Surface_Normal#Algorithm
 * For a convex polygon (such as a triangle), a surface normal can be calculated as the vector cross product of two (non-parallel) edges of the polygon.
 */
const computeTriangleNormal = (A: Vector, B: Vector, C: Vector) => {
  // Get first edge
  const v1 = new Vector([
    C.at(0) - B.at(0),
    C.at(1) - B.at(1),
    C.at(2) - B.at(2),
  ]);
  // Get second edge
  const v2 = new Vector([
    A.at(0) - B.at(0),
    A.at(1) - B.at(1),
    A.at(2) - B.at(2),
  ]);

  // Surface normal as the cross product of both edges
  return v1.cross(v2);
};

/**
 * Reference: https://albamr09.github.io/src/Notes/ComputerScience/CG/RTGW/03.html#Lights-Normals
 *
 * The normals of a complex surface (made up from several triangles) is computed as follow:
 *
 * 1. For every triangle we obtain the indices of the vectors that define them, denoted as idxA, idxB and idxC
 * 2. We obtain the vertices that make up the triangle, denoted as A, B and C
 * 3. We obtain the vertices that make up the triangle, denoted as A, B and C
 * 4. We compute the triangle normal
 * 5. We sum this normal to the global normal for each index
 * 6. Finally we normalize the computed glboal normals
 */
export const calculateNormals = (
  vertices: number[],
  indices: number[],
  size: GLint
) => {
  const numVertices = vertices.length / size;
  let normals = Array.from(Array(numVertices)).map(() => new Vector([0, 0, 0]));

  // Calculate face normals and accumulate them to vertex normals
  for (let i = 0; i < indices.length; i += size) {
    // Index of the vertices that make up the triangle
    const idxA = indices[i];
    const idxB = indices[i + 1];
    const idxC = indices[i + 2];
    // We obtain the address of the first element for each vertex
    // We know each vertex is make up of $SIZE elements, so we
    // have to offset by this amount the index. For example:
    // [
    // 0, 0, 0 <- idxA = 0, vA = 0 = 0 * 3
    // 0, 0, 0 <- idxB = 1, vA = 3 = 1 * 3
    // 0, 0, 0 <- idxC = 2, vA = 6 = 2 * 3
    // ]
    const vA = size * idxA;
    const vB = size * idxB;
    const vC = size * idxC;

    // Each vertex of the triangle is obtained extracting from the base address up
    // until (base address + size)
    const A = new Vector(vertices.slice(vA, vA + size));
    const B = new Vector(vertices.slice(vB, vB + size));
    const C = new Vector(vertices.slice(vC, vC + size));

    // Surface normal as the cross product of both edges
    const triangleNormal = computeTriangleNormal(A, B, C);

    // Update the global vertex normals by summing the triangleNormal vector computed
    // for the current triangle
    normals[idxA] = normals[idxA].sum(triangleNormal);
    normals[idxB] = normals[idxB].sum(triangleNormal);
    normals[idxC] = normals[idxC].sum(triangleNormal);
  }

  // Normalize vectors
  return normals.flatMap((n) => n.normalize().toArray());
};

export const computeTangents = (
  vertices: number[],
  uvs: number[],
  indices: number[]
) => {
  let tangents = new Array(vertices.length / 3)
    .fill(0)
    .map(() => new Vector([0, 0, 0]));

  function getVector(arr: number[], index: number, stride = 3) {
    const baseIndex = index * stride;
    const vectorElements = Array.from({ length: stride }).reduce(
      (vector: number[], _, i) => {
        vector.push(arr[baseIndex + i]);
        return vector;
      },
      []
    );
    return new Vector(vectorElements);
  }

  for (let i = 0; i < indices.length; i += 3) {
    let i0 = indices[i];
    let i1 = indices[i + 1];
    let i2 = indices[i + 2];

    let v0 = getVector(vertices, i0);
    let v1 = getVector(vertices, i1);
    let v2 = getVector(vertices, i2);

    let uv0 = getVector(uvs, i0, 2);
    let uv1 = getVector(uvs, i1, 2);
    let uv2 = getVector(uvs, i2, 2);

    let edge1 = v1.sum(v0.negate());
    let edge2 = v2.sum(v0.negate());

    let deltaUV1 = uv1.sum(uv0.negate());
    let deltaUV2 = uv2.sum(uv0.negate());

    let f =
      1.0 / (deltaUV1.at(0) * deltaUV2.at(1) - deltaUV2.at(0) * deltaUV1.at(1));

    let tangent = new Vector([
      f * (deltaUV2.at(1) * edge1.at(0) - deltaUV1.at(1) * edge2.at(0)),
      f * (deltaUV2.at(1) * edge1.at(1) - deltaUV1.at(1) * edge2.at(1)),
      f * (deltaUV2.at(1) * edge1.at(2) - deltaUV1.at(1) * edge2.at(2)),
    ]);

    tangents[i0] = tangent.sum(tangents[i0]);
    tangents[i1] = tangent.sum(tangents[i1]);
    tangents[i2] = tangent.sum(tangents[i2]);
  }

  return tangents.flatMap((tangent) => tangent.normalize().toArray());
};

/*
 * Obtain transformation matrix to apply to normal vectors given the model view matrix.
 * Reference: https://paroj.github.io/gltut/Illumination/Tut09%20Normal%20Transformation.html
 */

export const computeNormalMatrix = (m: Matrix4): Matrix4 => {
  const normalMatrix = m.inverse();
  return normalMatrix.transpose() as Matrix4;
};

/**
 * Creates a list of 4d vectors (for transformations sake) from
 * the flattened array of the input vertices
 */
const unFlattenVertices = (vertices: number[]) => {
  return Array.from({ length: vertices.length / 3 }).map((_, i) => {
    const baseIndex = i * 3;
    return new Vector([...vertices.slice(baseIndex, baseIndex + 3), 1]);
  });
};

/**
 * Applies a scale, tranform or rotation transformation over
 * the list of input vertices. The vertices are assumed to have
 * three coordinates.
 * */
export const transformVertices = (
  vertices: number[],
  transformationMatrix: Matrix4
) => {
  return unFlattenVertices(vertices)
    .map((vertex) => {
      return transformationMatrix.multiply(vertex).elements.slice(0, 3);
    })
    .flat();
};

const computeMidPoint = (vertices: Vector[], component: "x" | "y" | "z") => {
  let componentIndex = 0;
  if (component == "x") {
    componentIndex = 0;
  } else if (component == "y") {
    componentIndex = 1;
  } else if (component == "z") {
    componentIndex = 2;
  }
  const componentValues = vertices.map((vector) => vector.at(componentIndex));
  const maxComponent = Math.max(...componentValues);
  const minComponent = Math.min(...componentValues);
  const intervalDistance = maxComponent - minComponent;
  const midPoint = minComponent + intervalDistance / 2;
  return midPoint;
};

/**
 * Computer the center of a geometry defined by the list of
 * vertices as the average values for each coordinate component.
 */
export const computeGeometryCenter = (vertices: number[]) => {
  const unflattenedVertices = unFlattenVertices(vertices);
  const xMidPoint = computeMidPoint(unflattenedVertices, "x");
  const yMidPoint = computeMidPoint(unflattenedVertices, "y");
  const zMidPoint = computeMidPoint(unflattenedVertices, "z");

  return [xMidPoint, yMidPoint, zMidPoint];
};
