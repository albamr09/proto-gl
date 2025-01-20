import { createDescriptionPanel, initGUI } from "../lib/gui/index.js";

const init = () => {
  initGUI();
  createDescriptionPanel(
    "On this example we will create a demo application using our WebGL library."
  );

  // Program
  // Data
  // Render
  // Controls
};

window.onload = init;
