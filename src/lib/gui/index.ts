import { setupStyles } from "./styles.js";

const CONTROL_CONTAINER_ID = "control-container";

export const initGUI = () => {
  setupStyles();
};

export const initController = () => {
  const controlContainer = document.createElement("div");

  // Set the id attribute for the div
  controlContainer.setAttribute("id", "control-panel");

  // Create title bar
  const titleBar = document.createElement("div");
  titleBar.className = "title";
  titleBar.innerHTML = "Control panel";
  const caret = document.createElement("span");
  caret.className = "caret";
  titleBar.appendChild(caret);
  caret.classList.add("open");
  controlContainer.appendChild(titleBar);

  // Create body bar
  const controlBody = document.createElement("div");
  controlBody.setAttribute("id", CONTROL_CONTAINER_ID);
  controlContainer.appendChild(controlBody);

  titleBar.addEventListener("click", () => {
    if (controlBody.style.display === "none") {
      controlBody.style.display = "flex";
      caret.classList.add("open");
    } else {
      controlBody.style.display = "none";
      caret.classList.remove("open");
    }
  });

  // Append the container to the body of the document
  document.body.appendChild(controlContainer);
};

export const createNumericInput = ({
  label,
  value,
  min,
  max,
  step,
  onInit = () => {},
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onInit?: (v: number) => void;
  onChange: (v: number) => void;
}) => {
  // Create a div container
  const formContainer = document.createElement("div");
  formContainer.classList.add("controller-element");

  // Create the form element
  const form = document.createElement("form");
  form.classList.add("form-container");

  // Create a label for the input
  const labelElement = document.createElement("label");
  labelElement.setAttribute("for", "userInput");
  const labelSpan = document.createElement("span");
  labelSpan.innerHTML = label;
  labelElement.appendChild(labelSpan);

  // Create a select element
  const numericInput = document.createElement("input");
  numericInput.setAttribute("id", "userInput");
  numericInput.setAttribute("type", "number");
  numericInput.setAttribute("name", "userInput");
  numericInput.setAttribute("min", min.toString()); // Minimum value
  numericInput.setAttribute("max", max.toString()); // Maximum value
  numericInput.setAttribute("step", step.toString()); // Step value

  // Set the initial value of the select element
  if (value) {
    numericInput.value = value.toString();
    onInit(value);
  }

  // Add an event listener for the "change" event on the select element
  numericInput.addEventListener("change", function () {
    onChange(parseFloat(numericInput.value));
  });

  // Append the label, select to the form
  form.appendChild(labelElement);
  form.appendChild(numericInput);

  // Avoid reload on submit
  form.addEventListener("submit", function (event) {
    event.preventDefault();
  });

  // Append the form to the container
  formContainer.appendChild(form);

  // Append the container to the control container (change CONTROL_CONTAINER_ID to the actual ID)
  document.getElementById(CONTROL_CONTAINER_ID)?.appendChild(formContainer);
};

export const createSelectorForm = <T>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: T[];
  onChange: (v: T) => void;
}) => {
  // Create a div container
  const formContainer = document.createElement("div");
  formContainer.classList.add("controller-element");

  // Create the form element
  const form = document.createElement("form");
  form.classList.add("form-container");

  // Create a label for the input
  const labelElement = document.createElement("label");
  labelElement.setAttribute("for", "userInput");
  const labelSpan = document.createElement("span");
  labelSpan.innerHTML = label;
  labelElement.appendChild(labelSpan);

  // Create a select element
  const select = document.createElement("select");
  select.setAttribute("id", "userInput");
  select.setAttribute("name", "userInput");

  // Create and add options to the select element
  for (let i = 0; i < options.length; i++) {
    const option = document.createElement("option");
    option.value = `${options[i]}`;
    option.text = `${options[i]}`;
    select.appendChild(option);
  }

  // Set the initial value of the select element
  if (value) {
    select.value = `${value}`;
  }

  // Add an event listener for the "change" event on the select element
  select.addEventListener("change", function () {
    // Call the onChange function with the selected value
    onChange(select.value as T);
  });

  // Append the label, select to the form
  form.appendChild(labelElement);
  form.appendChild(select);

  // Append the form to the container
  formContainer.appendChild(form);

  // Append the container to the control container (change CONTROL_CONTAINER_ID to the actual ID)
  document.getElementById(CONTROL_CONTAINER_ID)?.appendChild(formContainer);
};

export const createColorInputForm = ({
  label,
  value,
  onInit = () => {},
  onChange,
}: {
  label: string;
  value: string;
  onInit?: (v: string) => void;
  onChange: (v: string) => void;
}) => {
  // Create a div container
  const formContainer = document.createElement("div");
  formContainer.classList.add("controller-element");

  // Create the form element
  const form = document.createElement("form");
  form.classList.add("form-container");

  // Create a label for the input
  const labelElement = document.createElement("label");
  labelElement.setAttribute("for", "userInput");
  const labelSpan = document.createElement("span");
  labelSpan.innerHTML = label;
  labelElement.appendChild(labelSpan);

  // Create an input element of type "color"
  const colorInput = document.createElement("input");
  colorInput.setAttribute("type", "color");
  colorInput.setAttribute("id", "userInput");
  colorInput.setAttribute("name", "userInput");

  // Set the initial value of the color input
  if (value) {
    colorInput.value = value;
    onInit(value);
  }

  // Add an event listener for the "input" event on the color input
  colorInput.addEventListener("input", function () {
    // Call the onChange function with the selected color value
    onChange(colorInput.value);
  });

  // Append the label, color input to the form
  form.appendChild(labelElement);
  form.appendChild(colorInput);

  // Append the form to the container
  formContainer.appendChild(form);

  // Append the container to the control container (change CONTROL_CONTAINER_ID to the actual ID)
  document.getElementById(CONTROL_CONTAINER_ID)?.appendChild(formContainer);
};

export const createSliderInputForm = ({
  label,
  value,
  min,
  max,
  step,
  onInit = () => {},
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onInit?: (v: number) => void;
  onChange: (v: number) => void;
}) => {
  // Create a div container
  const formContainer = document.createElement("div");
  formContainer.classList.add("controller-element");

  // Create the form element
  const form = document.createElement("form");
  form.classList.add("form-container");

  // Create a label for the input
  const labelElement = document.createElement("label");
  labelElement.setAttribute("for", "userInput");
  const labelSpan = document.createElement("span");
  labelSpan.innerHTML = label;
  labelElement.appendChild(labelSpan);

  // Create a text input element
  const textInput = document.createElement("input");
  textInput.setAttribute("type", "number");
  textInput.setAttribute("name", "userInputText");
  textInput.classList.add("numeric-input");

  // Set the initial value of the text input
  if (value !== undefined && value !== null) {
    onInit(value);
    textInput.value = value.toString();
  }

  // Add an event listener for the "input" event on the text input
  textInput.addEventListener("input", function () {
    const parsedValue = parseFloat(textInput.value);
    if (parsedValue < max && parsedValue > min) {
      onChange(parsedValue);
      sliderInput.value = textInput.value;
    } else {
      textInput.value = Math.min(Math.max(parsedValue, min), max).toString();
    }
  });

  // Create an input element of type "range"
  const sliderInput = document.createElement("input");
  sliderInput.setAttribute("type", "range");
  sliderInput.setAttribute("name", "userInput");
  sliderInput.setAttribute("min", min.toString()); // Minimum value
  sliderInput.setAttribute("max", max.toString()); // Maximum value
  sliderInput.setAttribute("step", `${step}`); // Step value

  // Set the initial value of the slider input
  if (value) {
    sliderInput.value = value.toString();
  }

  // Add an event listener for the "input" event on the slider input
  sliderInput.addEventListener("input", function () {
    // Call the onChange function with the selected value
    onChange(parseFloat(sliderInput.value)); // Convert the value to a float
    textInput.value = sliderInput.value;
  });

  // Append the label, slider input to the form
  form.appendChild(labelElement);
  form.appendChild(sliderInput);
  form.appendChild(textInput);

  // Append the form to the container
  formContainer.appendChild(form);

  // Append the container to the control container (change CONTROL_CONTAINER_ID to the actual ID)
  document.getElementById(CONTROL_CONTAINER_ID)?.appendChild(formContainer);
};

/**
 * Creates one slider per element on the 3d vector
 */
export const createVector3dSliders = ({
  labels,
  value,
  min,
  max,
  step,
  onInit = () => {},
  onChange,
}: {
  labels: string[];
  value: number[];
  min: number;
  max: number;
  step: number;
  onInit?: (v: number[]) => void;
  onChange: (v: number[]) => void;
}) => {
  let _value = value;
  value.forEach((v, idx) => {
    createSliderInputForm({
      label: labels[idx],
      value: v,
      min,
      max,
      step,
      onInit: (v) => {
        _value[idx] = v;
        onInit(_value);
      },
      onChange: (v) => {
        _value[idx] = v;
        onChange(_value);
      },
    });
  });
};

export const createDescriptionPanel = (description: string) => {
  // Create panel container
  const panel = document.createElement("div");
  panel.id = "collapsiblePanel";

  // Create title bar
  const titleBar = document.createElement("div");
  titleBar.className = "title";
  titleBar.innerHTML = "Description";

  // Create caret icon
  const caret = document.createElement("span");
  caret.className = "caret";
  titleBar.appendChild(caret);

  // Create content area
  const content = document.createElement("div");
  content.className = "content";
  content.innerHTML = description;
  // Make dialog open by default
  content.style.display = "block";
  caret.classList.add("open");

  // Append title bar and content to panel
  panel.appendChild(titleBar);
  panel.appendChild(content);

  // Append panel to body
  document.body.appendChild(panel);

  // Add event listener for collapse/expand functionality
  titleBar.addEventListener("click", () => {
    if (content.style.display === "none" || content.style.display === "") {
      content.style.display = "block";
      caret.classList.add("open");
    } else {
      content.style.display = "none";
      caret.classList.remove("open");
    }
  });
};

export const createMatrixElement = (containerId: string, dimension: number) => {
  const containerElement = document.getElementById(containerId);
  if (!containerElement) return;

  const matrixElement = document.createElement("table");

  for (let i = 0; i < dimension; i++) {
    const row = document.createElement("tr");
    for (let j = 0; j < dimension; j++) {
      const cell = document.createElement("td");
      const cellId = `m${j * dimension + i}`;
      cell.id = cellId;
      row.appendChild(cell);
    }

    matrixElement.appendChild(row);
  }
  containerElement.appendChild(matrixElement);
};

export const updateMatrixElement = (m: number[] | Float32Array) => {
  m.forEach((data, i) => {
    const matrixElement = document.getElementById(`m${i}`);
    if (matrixElement) {
      matrixElement.innerText = data.toFixed(1);
    }
  });
};

export const createLowerLeftPanel = (title: string) => {
  const panel = document.createElement("div");
  panel.id = "lower-left-panel";

  // Create title bar
  const titleBar = document.createElement("div");
  titleBar.className = "title";
  titleBar.innerHTML = title;
  panel.appendChild(titleBar);

  // Append panel to body
  document.body.appendChild(panel);
};

export const updatePanelTitle = (id: string, title: string) => {
  const panelElement = document.getElementById(id);
  if (!panelElement) return;

  const titleElement = panelElement.getElementsByClassName("title")[0];
  if (!titleElement) return;
  titleElement.innerHTML = title;
};
