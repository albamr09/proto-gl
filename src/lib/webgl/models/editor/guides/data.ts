const CONE_RADIOUS = 1.0;
const CONE_HEIGHT = 2.0;
const CONE_SEGMENTS = 12;
const CYLINDER_RADIOUS = CONE_RADIOUS / 4;
const CYLINDER_HEIGHT = 3.0;

const generateConeVertices = (r: number, h: number, n: number) => {
  const vertices = [];

  // The tip of the cone (1 vertex)
  vertices.push(0, 0, h);

  // Base of the cone (n vertices around a circle)
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2; // Calculate angle for each vertex around the circle
    const x = r * Math.cos(angle);
    const y = r * Math.sin(angle);
    const z = 0; // All base vertices are at z = 0 (the base of the cone)
    vertices.push(x, y, z);
  }

  // Center of the base (0, 0, 0) for rendering the base
  vertices.push(0, 0, 0);

  return vertices;
};

const generateConeIndices = (segments: number) => {
  const indices = [];

  // Connect the vertex of the cone to vertices on the base
  for (let i = 1; i <= segments; i++) {
    const next = (i % segments) + 1; // Wrap around the base
    indices.push(0, i, next); // Side face of the cone (tip -> base vertices)
  }

  // Render the base of the cone (connect center to the outer vertices)
  const centerIndex = segments + 1; // The center of the base (last vertex in the array)
  for (let i = 1; i <= segments; i++) {
    const next = (i % segments) + 1; // Wrap around the base
    indices.push(next, i, centerIndex); // Base of the cone (center connected to outer vertices)
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
  vertices.push(0, height / 2, 0); // Top center

  // Top circle (y = height / 2)
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = radius * Math.cos(angle);
    const z = radius * Math.sin(angle);
    vertices.push(x, height / 2, z); // Top circle
  }

  // Bottom circle (y = -height / 2)
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = radius * Math.cos(angle);
    const z = radius * Math.sin(angle);
    vertices.push(x, -height / 2, z); // Bottom circle
  }

  // Center of bottom circle
  vertices.push(0, -height / 2, 0); // Bottom center

  return vertices;
};

const generateCylinderIndices = (segments: number) => {
  const indices = [];
  const topCenterIndex = 0; // The center of the top base (first vertex in the array)
  const bottomCenterIndex = 2 * segments + 1; // The center of the bottom base (last vertex in the array)
  const bottomVerticesOffset = segments;

  // Top face (counter-clock wise)
  for (let i = 1; i <= segments; i++) {
    const next = (i % segments) + 1;
    indices.push(next, i, topCenterIndex);
  }

  // Bottom face (clock wise)
  for (let i = 1; i <= segments; i++) {
    const next = (i % segments) + 1;
    indices.push(
      i + bottomVerticesOffset,
      next + bottomVerticesOffset,
      bottomCenterIndex
    );
  }

  // Side faces: two triangles for each rectangular side face
  for (let i = 1; i <= segments; i++) {
    const next = (i + 1) % segments;
    indices.push(i + segments, i, next);
    indices.push(next + segments, i + segments, next);
  }

  return indices;
};

const generateArrow = () => {
  const coneVertices = generateConeVertices(
    CONE_RADIOUS,
    CONE_HEIGHT,
    CONE_SEGMENTS
  );
  const coneIndices = generateConeIndices(CONE_SEGMENTS);
  return {
    vertices: generateCylinderVertices(
      CYLINDER_RADIOUS,
      CYLINDER_HEIGHT,
      CONE_SEGMENTS
    ),
    indices: generateCylinderIndices(CONE_SEGMENTS),
  };
};

export default generateArrow;
