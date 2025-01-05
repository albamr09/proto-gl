import {
  DEFAULT_HEIGHT,
  DEFAULT_N_SEGMENTS,
  DEFAULT_RADIOUS,
} from "./constants.js";
import { ArrowHead } from "./types.js";

const generateCubeVertices = (length: number, heightOffset: number) => {
  const vertices = [];
  const x = length / 2;
  const z = length / 2;
  const y = heightOffset + length;

  // Bottom square
  vertices.push(-x, heightOffset, -z);
  vertices.push(x, heightOffset, -z);
  vertices.push(x, heightOffset, z);
  vertices.push(-x, heightOffset, z);

  // Top square
  vertices.push(-x, y, -z);
  vertices.push(x, y, -z);
  vertices.push(x, y, z);
  vertices.push(-x, y, z);

  return vertices;
};

const generateCubeIndices = () => {
  const indices = [];

  // Bottom Square
  indices.push(0, 1, 2);
  indices.push(2, 3, 0);

  // Sides
  indices.push(0, 4, 5);
  indices.push(5, 1, 0);
  indices.push(1, 5, 6);
  indices.push(6, 2, 1);
  indices.push(0, 3, 7);
  indices.push(7, 4, 0);
  indices.push(6, 7, 3);
  indices.push(3, 2, 6);

  // Top Square
  indices.push(4, 7, 6);
  indices.push(6, 5, 4);

  return indices;
};

const generateConeVertices = (
  radius: number,
  height: number,
  segments: number,
  heightOffset: number
) => {
  const vertices = [];

  // The tip of the cone
  vertices.push(0, height + heightOffset, 0);

  // Base of the cone (n vertices around a circle)
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = radius * Math.cos(angle);
    const z = radius * Math.sin(angle);
    vertices.push(x, heightOffset, z);
  }

  // Center of the base (0, 0 + offset, 0) for rendering the base
  vertices.push(0, heightOffset, 0);

  return vertices;
};

const generateConeIndices = (segments: number) => {
  const indices = [];

  // Connect the vertex of the cone to vertices on the base
  for (let i = 1; i <= segments; i++) {
    const next = (i % segments) + 1;
    indices.push(0, i, next);
  }

  // Render the base of the cone (connect center to the outer vertices)
  const centerIndex = segments + 1;
  for (let i = 1; i <= segments; i++) {
    const next = (i % segments) + 1;
    indices.push(next, i, centerIndex);
  }

  return indices;
};

const generateCylinderVertices = (
  radius: number,
  height: number,
  segments: number
) => {
  const vertices = [];

  // Center of top circle
  vertices.push(0, height, 0);

  // Top circle (y = height)
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = radius * Math.cos(angle);
    const z = radius * Math.sin(angle);
    vertices.push(x, height, z);
  }

  // Bottom circle (y = 0)
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = radius * Math.cos(angle);
    const z = radius * Math.sin(angle);
    vertices.push(x, 0, z);
  }

  // Center of bottom circle
  vertices.push(0, 0, 0);

  return vertices;
};

const generateCylinderIndices = (segments: number, offset: number) => {
  let indices: number[] = [];
  const bottomCenterIndex = 2 * segments + 1; // The center of the bottom base (last vertex in the array)
  const bottomVerticesOffset = segments;

  const addIndices = (indicesList: number[], indicesToAdd: number[]) => {
    indicesList.push(...indicesToAdd.map((i) => i + offset));
    return indicesList;
  };

  // Bottom face (clock wise)
  for (let i = 1; i <= segments; i++) {
    const next = (i % segments) + 1;
    indices = addIndices(indices, [
      i + bottomVerticesOffset,
      next + bottomVerticesOffset,
      bottomCenterIndex,
    ]);
  }

  // Side faces: two triangles for each rectangular side face
  for (let i = 1; i <= segments; i++) {
    const next = (i % segments) + 1;
    indices = addIndices(indices, [i + segments, i, next]);
    indices = addIndices(indices, [next + segments, i + segments, next]);
  }

  return indices;
};

const generateArrow = ({
  height = DEFAULT_HEIGHT,
  radius = DEFAULT_RADIOUS,
  nSegments = DEFAULT_N_SEGMENTS,
  arrowHead,
}: {
  height?: number;
  radius?: number;
  nSegments?: number;
  arrowHead: ArrowHead;
}) => {
  const cylinderRadious = radius / 3;
  const arrowHeight = height / 4;
  const cylinderHeight = height - arrowHeight;
  let arrowHeadVertices: number[];
  let arrowHeadIndices: number[];
  if (arrowHead == "cone") {
    const coneRadious = radius;
    arrowHeadVertices = generateConeVertices(
      coneRadious,
      arrowHeight,
      nSegments,
      cylinderHeight
    );
    arrowHeadIndices = generateConeIndices(nSegments);
  } else {
    arrowHeadVertices = generateCubeVertices(arrowHeight, cylinderHeight);
    arrowHeadIndices = generateCubeIndices();
  }
  const cylinderVertices = generateCylinderVertices(
    cylinderRadious,
    cylinderHeight,
    nSegments
  );
  const cylinderIndicesOffset = arrowHeadVertices.length / 3;
  const cylinderIndices = generateCylinderIndices(
    nSegments,
    cylinderIndicesOffset
  );
  return {
    vertices: [...arrowHeadVertices, ...cylinderVertices],
    indices: [...arrowHeadIndices, ...cylinderIndices],
  };
};

export default generateArrow;
