import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["tests/src/**/*.ts"],
  outDir: "tests/build",
  clean: true,
  format: ["esm"],
  tsconfig: "./tests/tsconfig.json",
  dts: true,
  silent: true,
});
