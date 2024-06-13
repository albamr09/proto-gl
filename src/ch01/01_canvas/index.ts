"use strict";
const init = () => {
  const canvas = document.getElementById("webgl-canvas") as HTMLCanvasElement;
  // Ensure we have a canvas
  if (!canvas) {
    console.error("Sorry! No HTML5 Canvas was found onthis page");
    return;
  }

  const gl = canvas.getContext("webgl2");

  // Ensure we have a context
  const message = gl
    ? "Hooray! You got a WebGL2 context"
    : "Sorry! WebGL is not available";

  alert(message);
};
// Call init once the document has loaded
window.onload = init;

// Convert to module
export {};
