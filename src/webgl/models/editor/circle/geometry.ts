export const generateVolumeCircumference = (
  center: [number, number, number],
  outerRadius: number,
  innerRadius: number,
  mainSegments: number,
  tubeSegments: number
) => {
  const vertices: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i < mainSegments; i++) {
    const mainTheta = (i / mainSegments) * 2 * Math.PI;
    const mainX = center[0] + outerRadius * Math.cos(mainTheta);
    const mainY = center[1] + outerRadius * Math.sin(mainTheta);
    const mainZ = center[2];

    for (let j = 0; j < tubeSegments; j++) {
      const tubeTheta = (j / tubeSegments) * 2 * Math.PI;
      const tubeX = innerRadius * Math.cos(tubeTheta);
      const tubeY = innerRadius * Math.sin(tubeTheta);

      // Add vertex offset by tube position
      vertices.push(mainX + tubeX, mainY + tubeY, mainZ);
    }
  }

  // Create indices for triangle strips
  for (let i = 0; i < mainSegments; i++) {
    const nextI = (i + 1) % mainSegments;

    for (let j = 0; j < tubeSegments; j++) {
      const nextJ = (j + 1) % tubeSegments;

      const current = i * tubeSegments + j;
      const next = nextI * tubeSegments + j;
      const currentNext = i * tubeSegments + nextJ;
      const nextNext = nextI * tubeSegments + nextJ;

      indices.push(current, next, currentNext);
      indices.push(next, nextNext, currentNext);
    }
  }

  return { vertices, indices };
};

export const generateCircle = () => {
  const center = [0, 0, 0] as [number, number, number];
  const outerRadius = 3; // Path radius
  const innerRadius = 0.1; // Tube thickness
  const mainSegments = 64; // Segments around the circumference
  const tubeSegments = 16; // Segments around the tube

  return generateVolumeCircumference(
    center,
    outerRadius,
    innerRadius,
    mainSegments,
    tubeSegments
  );
};
