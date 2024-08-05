const cssCode = `
body {
  margin: 0;
}

#control-panel {
  position: fixed;
  top: 10px;
  right: 10px;
  width: 300px;
  border: 1px solid #ccc;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  z-index: 1000;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
}

#control-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
  gap: 10px;
  padding: 10px;
}

.title {
  background-color: #f2f2f2;
  padding: 10px;
  cursor: pointer;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.controller-element {
  width: 100%;
}

.form-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  color: black;
  padding: 0;
  margin: 0;
}

.numeric-input {
  width: 50px;
}

#collapsiblePanel {
  position: fixed;
  top: 10px;
  left: 10px;
  width: 300px;
  border: 1px solid #ccc;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  z-index: 1000;
  font-size: 14px;
}

#collapsiblePanel .content {
  padding: 10px;
  display: none; /* Hidden by default */
}

.caret {
  border: solid black;
  border-width: 0 2px 2px 0;
  display: inline-block;
  padding: 3px;
  transform: rotate(45deg);
  transition: transform 0.3s;
}

.caret.open {
  transform: rotate(-135deg);
}
`;

export const setupStyles = () => {
  // Create a <style> element
  const styleElement = document.createElement("style");

  styleElement.appendChild(document.createTextNode(cssCode));

  // Append the <style> element to the <head>
  document.head.appendChild(styleElement);
};
