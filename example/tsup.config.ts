import { defineConfig } from "tsup";
import fs from "fs/promises";
import path from "path";
import { glob } from "glob";

// Function to copy HTML files
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
      console.log(`Copied: ${file} -> ${outputPath}`);
    }
  } catch (error) {
    console.error("Error copying HTML files:", error);
  }
}

const isDev = process.env.NODE_ENV === 'development';

export default defineConfig({
  entry: ["src/ch01/**/*.ts", "src/utilities/**/*.ts"],
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
  ...(isDev && { watch: ['src/**/*.{ts,tsx}', '../src/**/*.ts'] }),
  // Copy html files
  async onSuccess() {
    console.log("Build succeeded, copying HTML files...");
    await copyHtmlFiles();
  }
});
