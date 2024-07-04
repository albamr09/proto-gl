import { readdir } from "fs/promises";
import {join} from "path";
import { promisify } from "util";
import { exec } from "child_process";

const execAsync = promisify(exec);

async function executeNodeOnJsFile(filePath: string): Promise<void> {
  try {
    const { stdout, stderr } = await execAsync(`node ${filePath}`);
    if (stdout) console.log(`Output of ${filePath}:\n${stdout}`);
    if (stderr) console.error(`Error output of ${filePath}:\n${stderr}`);
  } catch (error) {
    console.error(`Error executing ${filePath}: ${error}`);
  }
}

async function traverseAndExecute(dir: string): Promise<void> {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      await traverseAndExecute(fullPath);
    } else if (entry.isFile() && fullPath.endsWith(".js") && entry.name !== "main.js") {
      await executeNodeOnJsFile(fullPath);
    }
  }
}

const executeAllTests = () => {
  traverseAndExecute("./tests/");
}

executeAllTests();
