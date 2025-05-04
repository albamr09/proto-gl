const cssCode = `
html, body {
  height: 100vh;
  margin: 0px;
  /* Prevents body scrolling */
  overflow: hidden; 
}

.right-panel {
  position: fixed;
  top: 10px;
  right: 10px;
  width: fit-content;
  max-width: 500px;
  min-width: 300px;
  border: 1px solid #ccc;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  z-index: 1000;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
  overflow: hidden;
}

#control-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
  gap: 5px;
  margin: 0;
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

.left-panel {
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

#lower-left-panel {
  position: fixed;
  bottom: 10px;
  right: 10px;
  border: 1px solid #ccc;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  z-index: 1000;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
}

table {
  font-size: 14px;
  border: 1px dotted black;
  margin: 10px;
}

tr {
  color: black;
}

td {
  padding: 5px 15px;
}

button {
  background: #f2f2f2;
  width: 100%;
  border: 1px solid #e1e1e1;
  border-radius: 3px;
  padding: 5px;
  font-weight: bold;
}

button:hover {
  background: #e9e9e9;
}

.collapsible-container {
  width: 100%;
}

.collapsible-content {
  padding: 5px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.collapsible-toggle {
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
`;

export const createFavIcon = () => {
  // Create a <link> element to fav icon
  const favIcon = document.createElement("link");
  favIcon.setAttribute("rel", "icon");
  favIcon.setAttribute("type", "image/x-icon");
  favIcon.setAttribute("href", "/public/favicon.ico");
  // Append the <link> element to the <head>
  document.head.appendChild(favIcon);
};

export const setupStyles = () => {
  // Create a <style> element
  const styleElement = document.createElement("style");
  styleElement.appendChild(document.createTextNode(cssCode));

  // Create a <link> element to fav icon
  createFavIcon();

  // Append the <style> element to the <head>
  document.head.appendChild(styleElement);
};
