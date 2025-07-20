const { spawn } = require("child_process");
const fs = require("fs");

// Try to run Python extraction
const python = spawn("python3", ["manual_extract.py"], {
  stdio: ["pipe", "pipe", "pipe"],
});

python.stdout.on("data", (data) => {
  console.log(data.toString());
});

python.stderr.on("data", (data) => {
  console.error(data.toString());
});

python.on("close", (code) => {
  console.log(`Python script exited with code ${code}`);

  // List current directory contents after extraction
  fs.readdir(".", (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return;
    }
    console.log("\nCurrent directory contents:");
    files.forEach((file) => {
      console.log(` - ${file}`);
    });
  });
});
