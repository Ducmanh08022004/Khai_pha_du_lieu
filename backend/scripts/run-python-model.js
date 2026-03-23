const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const scriptName = process.argv[2];

if (!scriptName) {
  console.error("Missing python script name. Example: node scripts/run-python-model.js text_inference_api.py");
  process.exit(1);
}

const backendDir = path.resolve(__dirname, "..");
const pythonDir = path.join(backendDir, "python");

const candidates = [];

// Prefer repo-root venv if present.
candidates.push(path.join(backendDir, "..", ".venv", "Scripts", "python.exe"));

// Only accept PYTHON_BIN when it points to an existing executable.
if (process.env.PYTHON_BIN && process.env.PYTHON_BIN !== "python") {
  candidates.push(process.env.PYTHON_BIN);
}

// Fallback to system python.
candidates.push("python");

const pythonBin = candidates.find((candidate) => {
  if (candidate === "python") {
    return true;
  }

  return fs.existsSync(candidate);
});

console.log(`[model-runner] Using Python: ${pythonBin}`);

const child = spawn(pythonBin, [scriptName], {
  cwd: pythonDir,
  stdio: "inherit",
  shell: false
});

child.on("error", (err) => {
  console.error(`[model-runner] Failed to start ${scriptName}:`, err.message);
  process.exit(1);
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
