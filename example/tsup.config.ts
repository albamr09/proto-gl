import { defineConfig } from "tsup";
import fs from "fs/promises";
import path from "path";
import { glob } from "glob";

async function copyFiles(pattern: string, baseDir = ".") {
  try {
    const files = await glob(pattern);

    for (const file of files) {
      const relativePath = path.relative(baseDir, file);
      const outputPath = path.join("dist", relativePath);
      const outputDir = path.dirname(outputPath);

      await fs.mkdir(outputDir, { recursive: true });
      await fs.copyFile(file, outputPath);
    }
  } catch (error) {
    console.error(`Error copying files matching "${pattern}":`, error);
  }
}

const isDev = process.env.NODE_ENV === "development";

export default defineConfig({
  entry: ["src/**/*.ts"],
  clean: true,
  format: ["esm"],
  tsconfig: "./tsconfig.json",
  dts: false,
  platform: "browser",
  silent: false,
  minify: isDev ? "terser" : undefined,
  splitting: true,
  // Bundles local library together with examples
  noExternal: ["@proto-gl"],
  watch: isDev ? ["src/**/*.{ts,html}", "../dist/index.js"] : undefined,
  // Copy html files
  async onSuccess() {
    console.log("Build succeeded, copying static files...");
    await copyFiles("src/**/*.html", "src");
    await copyFiles("data/**/*.{json,png,jpg}", ".");
    await copyFiles("public/**/*", ".");
  },
});
