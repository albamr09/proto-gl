export const rgbToHex = (rgbColor: number[]) => {
  let [red, green, blue] = rgbColor;

  // Ensure that the values are within the valid range (0-255) and round them
  red = Math.round(Math.max(0, Math.min(255, red)));
  green = Math.round(Math.max(0, Math.min(255, green)));
  blue = Math.round(Math.max(0, Math.min(255, blue)));

  // Convert each component to its hexadecimal representation
  const redHex = red.toString(16).padStart(2, "0");
  const greenHex = green.toString(16).padStart(2, "0");
  const blueHex = blue.toString(16).padStart(2, "0");

  // Combine the hexadecimal values to form the full color
  const hexColor = `#${redHex}${greenHex}${blueHex}`;

  return hexColor.toUpperCase(); // Convert to uppercase for consistency
};

export const hexToRgb = (hexColor: string) => {
  // Remove the "#" symbol if present
  hexColor = hexColor.replace(/^#/, "");

  // Split the hex color into red, green, and blue components
  const redHex = hexColor.substring(0, 2);
  const greenHex = hexColor.substring(2, 4);
  const blueHex = hexColor.substring(4, 6);

  // Convert the hexadecimal components to decimal
  const red = parseInt(redHex, 16);
  const green = parseInt(greenHex, 16);
  const blue = parseInt(blueHex, 16);

  return [red, green, blue];
};

// De-normalize colors from [0,1] to [0,255]
export const denormalizeColor = (color: number[]) => {
  return color.map((c) => c * 255);
};

// Normalize colors from [0,255] to [0,1]
export const normalizeColor = (color: number[]) => {
  return color.map((c) => c / 255);
};

export const rgbToRgba = (color: number[], opacity = 1) => {
  return [...color.slice(0, 3), opacity];
};
