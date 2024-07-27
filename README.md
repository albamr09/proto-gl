# CS10CG

Real Time Computer Graphics with WebGL

---

## How to run

First of all you will need to install the dependencies by running:

```bash
yarn
```

### Development

First serve the files with:

```bash
yarn serve
```

Then run:

```bash
yarn start
```

This will simply transpile the `typescript` code and update the transpilation whenever there is change on the source code. To see changes you will have to refresh the page.

### Production

You build the project as follows:

```bash
yarn build
```

This will transpile the `typescript` code as well as minify it.

And you deploy it with:

```bash
yarn serve
```

Without custom configuration, the server will commonly run on port $3000$. To preview the GUI on you browser open http://localhost:3000.

You can now easily navigate through the folders of this project, that contains all the examples from the book.

### Testing

In order to run the unit test, execute the following:

```bash
yarn test
```

## Code

### Chapter 1: Getting Started

- [Canvas](./src/ch01/01/): Creates a canvas
- [Colorful Canvas](./src/ch01/01/): Creates a canvas that changes its background color.

### Chapter 2: Rendering

- [Square](./src/ch02/01/): Renders a simple square
- [Pentagon](./src/ch02/02/): Renders a pentagon
- [Square](./src/ch02/03/): Renders a square using `drawElements`.
- [Square VAO](./src/ch02/04/): Renders a simple square using Vertex Attribute Objects (VAO)
- [Rendering modes](./src/ch02/05/): Showcases how to use different rendering modes with `drawElements`.
- [Trapezoid](./src/ch02/06/): Renders a trapezoid using `TRIANGLES` mode.
- [M](./src/ch02/07/): Renders a M using `LINES` mode.
- [Trapezoid outline](./src/ch02/08/): Renders the outline of a trapezoid using `LINE_LOOP` rendering mode.
- [Getting Info](./src/ch02/09/): Shows how to obtain various information about VBOs and IBOs.
- [JSON Data](./src/ch02/10/): Shows how to obtain work with JSON data that defines objects.
- [Car](./src/ch02/11/): Renders a Nissan car using JSON data as the input data.

### Chapter 3: Lights

- [Goraud Shading with Goraud Lights](./src/ch03/01/): Renders an sphere while applying Goraud Shading in combination with the Lambert Light Model.
- [Goraud Shading with Goraud Lights](./src/ch03/02/): Modifies the previous example to animate the ligth.
- [Goraud Shading with Phong Lights](./src/ch03/03/): Renders an sphere while applying Goraud Shading in combination with the Phong Light Model.
- [Phong Shading with Phong Lights](./src/ch03/04/): Renders an sphere while applying Phong Shading and the Phong Light Model.
- [Moving lights with Goraud Shading and Goraud Lights](./src/ch03/05/): Renders a wall while applying Goraud Shading and the Lambert Light Model, while also allowing you to move the light direction.
- [Positional Lighting with Phong Lights](./src/ch03/06/): Renders a moving scene that is iluminated by a single positional light using the Phong Shading model alongside the Phong Light model.
- [Car with Lights](./src/ch03/07/): Renders a moving scene showing a car iluminated by a positional light.

---

## Reference code

Assets: https://github.com/PacktPublishing/Real-Time-3D-Graphics-with-WebGL-2
