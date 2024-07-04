enum PROGRAM_TYPE {
  VERTEX,
  FRAGMENT,
}

/**
 * Sets the canvas to be as large as the window that contains it
 */
export const configureCanvas = () => {
  const canvas = document.getElementById("webgl-canvas") as HTMLCanvasElement;
  const size = Math.min(window.innerWidth, window.innerHeight);

  // Set the canvas to be a square
  canvas.width = size;
  canvas.height = size;
  return canvas;
};

/**
 * Obtains web gl context from canvas
 * @returns
 */
export const getGLContext = () => {
  const canvas = document.getElementById("webgl-canvas") as HTMLCanvasElement;
  if (!canvas) throw "No canvas found";
  const gl = canvas.getContext("webgl2");
  if (!gl) throw "No web gl context";
  return gl;
};

/**
 * Compiles the vertex or fragment shader
 */
export const compileShader = (
  gl: WebGL2RenderingContext,
  type: PROGRAM_TYPE,
  source: string
) => {
  let shader: WebGLShader | null;
  if (type === PROGRAM_TYPE.VERTEX) {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  }

  if (!shader) return;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
};

/**
 * Creates a program that is made up of a vertex shader and a fragment shader
 */

export const createProgram = (
  gl: WebGL2RenderingContext,
  vertexShaderSource: string,
  fragmentShaderSource: string
) => {
  // Obtain the shaders
  const vertexShader = compileShader(
    gl,
    PROGRAM_TYPE.VERTEX,
    vertexShaderSource
  );
  const fragmentShader = compileShader(
    gl,
    PROGRAM_TYPE.FRAGMENT,
    fragmentShaderSource
  );

  // Create a program
  const program = gl.createProgram();
  if (!program || !vertexShader || !fragmentShader) {
    throw "Could no create program";
  }

  // Attach the shaders to this program
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw "Could not initialize shaders";
  }

  // Use this program instance
  gl.useProgram(program);

  return program;
};

/**
 * Clears the current scene
 *
 * @param gl
 */
export const clearScene = (gl: WebGL2RenderingContext) => {
  // Clear the scene
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
};

/**
 * Makes sure the canvas occupies the whole screen even when the screen 
 * resizes
 * @param canvas 
 */

export const autoResizeCanvas = (canvas: HTMLCanvasElement)  => {

  const expandFullScreen = () => {
    const size = Math.min(window.innerWidth, window.innerHeight);
    canvas.width = size;
    canvas.height = size;
  };

  expandFullScreen();

  window.addEventListener('resize', expandFullScreen);
};
