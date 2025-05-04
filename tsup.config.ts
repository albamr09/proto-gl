import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  clean: true,
  format: ["esm"],
  tsconfig: "./tsconfig.json",
  dts: true,
  platform: "browser",
  silent: false,
});
