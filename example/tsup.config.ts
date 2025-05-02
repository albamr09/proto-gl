import { defineConfig } from "tsup";
import fs from "fs/promises";
import path from "path";
import { glob } from "glob";

async function copyHtmlFiles() {
  try {
    // Find all HTML files in src directory
    const htmlFiles = await glob("src/**/*.html");

    for (const file of htmlFiles) {
      // Determine output path (maintaining directory structure)
      const relativePath = path.relative("src", file);
      const outputPath = path.join("dist", relativePath);
      const outputDir = path.dirname(outputPath);

      // Create directory if it doesn't exist
      await fs.mkdir(outputDir, { recursive: true });

      // Copy the HTML file
      await fs.copyFile(file, outputPath);
    }
  } catch (error) {
    console.error("Error copying HTML files:", error);
  }
}

async function copyDataFiles() {
  try {
    const dataFiles = await glob("data/**/*.{json,png}");

    for (const file of dataFiles) {
      const outputPath = path.join("dist", file);
      const outputDir = path.dirname(outputPath);

      await fs.mkdir(outputDir, { recursive: true });
      await fs.copyFile(file, outputPath);
    }
  } catch (error) {
    console.error("Error copying data files:", error);
  }
}

const isDev = process.env.NODE_ENV === "development";

export default defineConfig({
  entry: [
    "src/ch01/**/*.ts",
    "src/ch02/**/*.ts",
    "src/ch03/**/*.ts",
    "src/ch04/**/*.ts",
    "src/utilities/**/*.ts",
  ],
  clean: true,
  format: ["esm"],
  tsconfig: "./tsconfig.json",
  dts: false, // Generate type definitions
  platform: "browser",
  silent: false,
  minify: "terser",
  splitting: false,
  // Bundles local library together with examples
  noExternal: ["@proto-gl"],
  ...(isDev && { watch: ["src/**/*.{ts,tsx}", "../src/**/*.ts"] }),
  // Copy html files
  async onSuccess() {
    console.log("Build succeeded, copying HTML files...");
    await copyHtmlFiles();
    await copyDataFiles();
  },
});
