"use strict";

import { initGUI, createDescriptionPanel } from "../../utils/gui/index.js";

let gl: WebGL2RenderingContext | null;

/**
 * Sets the clear color as the color passed as argument
 */

const updateClearColor = (...color: [number, number, number, number]) => {
  gl?.clearColor(...color);
  gl?.clear(gl.COLOR_BUFFER_BIT);
  gl?.viewport(0, 0, 0, 0);
};

/**
 * Listens for user input to change webgls clear color
 */

const checkKey = (event: KeyboardEvent) => {
  switch (event.key) {
    case "1": {
      // KEY 1 -> GREEN
      updateClearColor(0.2, 0.8, 0.2, 1.0);
      break;
    }
    case "2": {
      // KEY 2 -> BLUE
      updateClearColor(0.2, 0.2, 0.8, 1.0);
      break;
    }
    case "3": {
      // KEY 3 -> RANDOM
      updateClearColor(Math.random(), Math.random(), Math.random(), 1.0);
      break;
    }
    case "4": {
      // KEY 4 -> Obtain current clear color (scale 0 to 1, multiply by 255 to obtain RGB scale)
      const color = gl?.getParameter(gl.COLOR_CLEAR_VALUE);
      alert(
        `clearColor = (${color[0].toFixed(1)}, ${color[1].toFixed(
          1
        )}, ${color[2].toFixed(1)})`
      );
      window.focus();
      break;
    }
  }
};

/**
 * Checks if webgl2 is supported
 */

const init = () => {
  // Setup GUI
  initGUI();
  createDescriptionPanel(
    "Creates a canvas that changes colors when pressing the keys: 1, 2, 3 or 4"
  );

  // Setup canvas
  const canvas = document.getElementById("webgl-canvas") as HTMLCanvasElement;
  // Ensure we have a canvas
  if (!canvas) {
    console.error("Sorry! No HTML5 Canvas was found onthis page");
    return;
  }

  gl = canvas.getContext("webgl2");
  // Call checkKey whenever a key is pressed
  window.onkeydown = checkKey;
};

// Call init once the document has loaded
window.onload = init;

// Conver to module
export {};
