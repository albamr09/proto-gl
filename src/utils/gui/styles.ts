const cssCode = `
#control-container {
  position: absolute;
  top: 20px;
  right: 10px;
  font-size: 14px;
  border: 1px dotted white;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
  gap: 10px;
  background: black;
  font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
}

.controller-element {
  width: 100%;
}

.form-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  color: white;
  padding: 0;
  margin: 0;
}

.numeric-input {
  width: 50px;
}

select {
  background: black;
  border: 1px solid white;
  color: white;
  font-family: inherit;
}
`;

export const setupStyles = () => {
  // Create a <style> element
  const styleElement = document.createElement("style");

  styleElement.appendChild(document.createTextNode(cssCode));

  // Append the <style> element to the <head>
  document.head.appendChild(styleElement);
};
