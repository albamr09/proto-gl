const DEFAULT_HEIGHT = 4;
const DEFAULT_RADIOUS = 0.5;
const DEFAULT_N_SEGMENTS = 12;

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
}: {
  height?: number;
  radius?: number;
  nSegments?: number;
}) => {
  const coneRadious = radius;
  const cylinderRadious = radius / 3;
  const coneHeight = height / 4;
  const cylinderHeight = height - coneHeight;
  const coneVertices = generateConeVertices(
    coneRadious,
    coneHeight,
    nSegments,
    cylinderHeight
  );
  const coneIndices = generateConeIndices(nSegments);
  const cylinderVertices = generateCylinderVertices(
    cylinderRadious,
    cylinderHeight,
    nSegments
  );
  const cylinderIndicesOffset = coneVertices.length / 3;
  const cylinderIndices = generateCylinderIndices(
    nSegments,
    cylinderIndicesOffset
  );
  return {
    vertices: [...coneVertices, ...cylinderVertices],
    indices: [...coneIndices, ...cylinderIndices],
  };
};

export default generateArrow;
