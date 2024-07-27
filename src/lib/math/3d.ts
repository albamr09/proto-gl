import {Matrix4} from "./matrix.js";
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
  return normals.map((n) => n.normalize().toArray()).flat();
};

/*
* Obtain transformation matrix to apply to normal vectors given the model view matrix. 
* Reference: https://paroj.github.io/gltut/Illumination/Tut09%20Normal%20Transformation.html
*/

export const computeNormalMatrix = (m: Matrix4): Matrix4 => {
  const normalMatrix = m.inverse();
  return normalMatrix.transpose() as Matrix4;
}
