import { defineConfig } from "tsup";

const isDev = process.env.NODE_ENV === "development";

export default defineConfig({
  entry: ["src/index.ts"],
  clean: true,
  format: ["esm"],
  tsconfig: "./tsconfig.json",
  dts: true,
  platform: "browser",
  silent: false,
  onSuccess: async () => {
    console.log("🔧 ProtoGL rebuilt successfully");
  },
});
