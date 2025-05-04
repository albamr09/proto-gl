const linkGroups = [
  {
    topic: "Getting Started",
    links: [
      {
        title: "Canvas",
        description: "Creates a canvas",
        url: "ch01/01/",
      },
      {
        title: "Colorful Canvas",
        description: "Creates a canvas that changes its background color",
        url: "ch01/02/",
      },
    ],
  },
  {
    topic: "Rendering",
    links: [
      {
        title: "Square",
        description: "Renders a simple square",
        url: "ch02/01/",
      },
      {
        title: "Pentagon",
        description: "Renders a pentagon",
        url: "ch02/02/",
      },
      {
        title: "Square (drawElements)",
        description: "Renders a square using drawElements",
        url: "ch02/03/",
      },
      {
        title: "Square VAO",
        description:
          "Renders a simple square using Vertex Attribute Objects (VAO)",
        url: "ch02/04/",
      },
      {
        title: "Rendering modes",
        description:
          "Showcases how to use different rendering modes with drawElements",
        url: "ch02/05/",
      },
      {
        title: "Trapezoid",
        description: "Renders a trapezoid using 'TRIANGLES' mode.",
        url: "ch02/06/",
      },
      {
        title: "M",
        description: "Renders an M using 'LINES' mode.",
        url: "ch02/07/",
      },
      {
        title: "Trapezoid outline",
        description:
          "Renders the outline of a trapezoid using 'LINE_LOOP' rendering mode.",
        url: "ch02/08/",
      },
      {
        title: "Getting Info",
        description:
          "Shows how to obtain various information about VBOs and IBOs.",
        url: "ch02/09/",
      },
      {
        title: "JSON Data",
        description:
          "Shows how to obtain work with JSON data that define objects.",
        url: "ch02/10/",
      },
      {
        title: "Car",
        description: "Renders a Nissan car using JSON data as the input data.",
        url: "ch02/11/",
      },
    ],
  },
  {
    topic: "Lights",
    links: [
      {
        title: "Goraud Shading with Goraud Lights",
        description:
          "Renders an sphere while applying Goraud Shading in combination with the Lambert Light Model.",
        url: "ch03/01/",
      },
      {
        title: "Goraud Shading with Goraud Lights (animated)",
        description:
          "Renders an sphere while applying Goraud Shading in combination with the Lambert Light Model animating the light.",
        url: "ch03/02/",
      },
      {
        title: "Goraud Shading with Phong Lights",
        description:
          "Renders an sphere while applying Goraud Shading in combination with the Phong Light Model.",
        url: "ch03/03/",
      },
      {
        title: "Phong Shading with Phong Lights",
        description:
          "Renders an sphere while applying Phong Shading and the Phong Light Model.",
        url: "ch03/04/",
      },
      {
        title: "Moving lights with Goraud Shading and Goraud Lights",
        description:
          "Renders a wall while applying Goraud Shading and the Lambert Light Model, while also allowing you to move the light direction.",
        url: "ch03/05/",
      },
      {
        title: "Positional Lighting with Phong Lights",
        description:
          "Renders a moving scene that is iluminated by a single positional light using the Phong Shading model alongside the Phong Light model.",
        url: "ch03/06/",
      },
      {
        title: "Car with Lights",
        description:
          "Renders a moving scene showing a car iluminated by a positional light.",
        url: "ch03/07/",
      },
    ],
  },
  {
    topic: "Camera",
    links: [
      {
        title: "Camera Translation",
        description:
          "Renders a scene where you can translate the camera/objects depending on the transformation matrix you choose.",
        url: "ch04/01/",
      },
      {
        title: "Camera Rotation",
        description:
          "Renders a scene where you can rotate the camera/objects depending on the transformation matrix you choose.",
        url: "ch04/02/",
      },
      {
        title: "Camera Transformation",
        description:
          "Renders a scene where you can translate or rotate the camera/objects depending on the transformation matrix you choose.",
        url: "ch04/03/",
      },
      {
        title: "Camera Types",
        description:
          "Renders a scene that you can translate/rotate using the different camera types: tracking and orbiting.",
        url: "ch04/04/",
      },
      {
        title: "Camera Controller",
        description:
          "Renders a complex object (a car) and defines a camera that can be interacted with using the mouse.",
        url: "ch04/05/",
      },
      {
        title: "Camera Projections",
        description:
          "Interact with the scene using your mouse or your keyboard, this will make the camera 'move'. Also you are able to switch between projection modes using the controller on your right, so you can choose between perspective or orthographic mode.",
        url: "ch04/06/",
      },
      {
        title: "Canvas Size",
        description:
          "Test how changing the size of the viewport using gl.viewport changes how you render the scene.",
        url: "ch04/07/",
      },
    ],
  },
  {
    topic: "Animations",
    links: [
      {
        title: "Simple Animation",
        description:
          "Showcase a simple animation of two objects. Such that you can see how to apply both global and local transforms.",
        url: "ch05/01/",
      },
      {
        title: "Parametric Curves",
        description:
          "Show how to use parametric curves to control an animation.",
        url: "ch05/02/",
      },
      {
        title: "Linear Interpolation",
        description: "Showcase how the linear interpolation method work.",
        url: "ch05/03/",
      },
      {
        title: "Interpolation Methods",
        description: "Showcase how different interpolation methods work.",
        url: "ch05/04/",
      },
    ],
  },
  {
    topic: "Color, Depth Testing and Alpha Blending",
    links: [
      {
        title: "Per-Vertex Coloring",
        description:
          "Show the difference between constant coloring and per-vertex coloring.",
        url: "ch06/01/",
      },
      {
        title: "Multiple Lights",
        description:
          "Show how to render different light sources on the same scene.",
        url: "ch06/02/",
      },
      {
        title: "Uniform Arrays",
        description:
          "Show how to render different light sources on the same scene by using uniform arrays.",
        url: "ch06/03/",
      },
      {
        title: "Spot Lights",
        description:
          "Show how to use spotlights or what we call directional point lights.",
        url: "ch06/04/",
      },
      {
        title: "Attenuated Lights",
        description:
          "Show how to use spotlights or what we call directional point lights. But with a twist! We now add an attenuation factor based on the angle between the light and the surface that makes for a more realistic effect.",
        url: "ch06/05/",
      },
      {
        title: "Blending",
        description:
          "See how different blending configuration changes the scene.",
        url: "ch06/06/",
      },
      {
        title: "Face Culling",
        description: "Showcase how face culling works.",
        url: "ch06/07/",
      },
      {
        title: "Rendering Order",
        description:
          "Shows how rendering ordering affects the effect of transparency.",
        url: "ch06/08/",
      },
    ],
  },
  {
    topic: "Textures",
    links: [
      {
        title: "Rendering a Texture",
        description: "Show how to render a simple texture.",
        url: "ch07/01/",
      },
      {
        title: "Rendering Different Textures",
        description:
          "On this example we show how to pick between different images to act as a texture.",
        url: "ch07/02/",
      },
      {
        title: "Texture Filtering Modes",
        description: "We show how different texture filter modes work.",
        url: "ch07/03/",
      },
      {
        title: "Texture Wrapping Modes",
        description: "We show how to use the different texture wrapping modes.",
        url: "ch07/04/",
      },
      {
        title: "Multiple Textures",
        description: "This example shows how to use multiple textures.",
        url: "ch07/05/",
      },
      {
        title: "Cube Maps",
        description: "We demonstrate how to use cube maps.",
        url: "ch07/06/",
      },
    ],
  },
  {
    topic: "Picking",
    links: [
      {
        title: "Scene Editor with Picking",
        description:
          "We display a very simple scene editor that uses picking techniches to transform objects.",
        url: "ch08/01/",
      },
      {
        title: "Object Selection with Unique IDs",
        description:
          "We will showcase how we can use unique ids in order to determine which object is selected.",
        url: "ch08/02/",
      },
    ],
  },
  {
    topic: "Advanced",
    links: [
      {
        title: "Demo Application",
        description:
          "We will create a demo application using our WebGL library.",
        url: "ch09/01/",
      },
      {
        title: "Post-Processing Effects",
        description:
          "We show how to apply post-processing effects to your scene.",
        url: "ch10/01/",
      },
      {
        title: "Basic Particle Effects",
        description: "We will show how to render particle effects.",
        url: "ch10/02/",
      },
      {
        title: "Bubble Particle Effects",
        description:
          "We will show how to render particle effects for bubbles =).",
        url: "ch10/03/",
      },
      {
        title: "Normal Mapping",
        description: "We show how to use normal maps.",
        url: "ch10/04/",
      },
      {
        title: "Ray Tracing: Single Sphere",
        description: "We'll show how to use ray tracing to render a sphere.",
        url: "ch10/05/",
      },
      {
        title: "Ray Tracing: Multiple Spheres",
        description:
          "We'll show how to use ray tracing to render not one! but several spheres!",
        url: "ch10/06/",
      },
      {
        title: "Maplibre",
        description: "We'll show how to use integrate ProtoGL with Maplibre",
        url: "maplibre/custom/",
      },
    ],
  },
];

export default linkGroups;
