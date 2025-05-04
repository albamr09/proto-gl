# CS10CG

Computer Graphics Library on the Web.

---

## How to run

First of all you will need to install the dependencies by running:

```bash
yarn
```

### Production

You build the project as follows:

```bash
yarn build
```

This will transpile the `typescript` code as well as minify it.

### Testing

In order to run the unit test, execute the following:

```bash
yarn test
```

### Examples

First you have to install de dependencies

```bash
cd example && yarn
```

If you want to run in development mode

```bash
yarn dev
```

Now you have a live environment that reloads everytime you make a change on the examples or on the source code of the library. Also a local server is started pointing to the build folder, such that you can access the examples by opening your browser on `localhost:3000`.

If you want to build the examples:

```bash
yarn build
```

This will create a `dist` folder that you can serve.
