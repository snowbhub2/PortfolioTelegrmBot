const http = require("http");
const fs = require("fs");
const { execSync } = require("child_process");

const hostname = "0.0.0.0";
const port = 3000;

// Try to extract the zip file first
function extractZip() {
  try {
    console.log("Attempting to extract nova-landing.zip...");
    execSync("unzip -o nova-landing.zip", { stdio: "inherit" });
    console.log("Successfully extracted nova-landing.zip");
    return true;
  } catch (error) {
    console.log("Could not extract with unzip, trying Python...");
    try {
      execSync("python3 manual_extract.py", { stdio: "inherit" });
      console.log("Successfully extracted with Python");
      return true;
    } catch (pythonError) {
      console.log("Python extraction also failed:", pythonError.message);
      return false;
    }
  }
}

// Check if zip file exists and extract it
if (fs.existsSync("nova-landing.zip")) {
  extractZip();
}

// List current directory contents
try {
  const files = fs.readdirSync(".");
  console.log("Current directory contents:");
  files.forEach((file) => {
    console.log(` - ${file}`);
  });
} catch (err) {
  console.log("Error reading directory:", err);
}

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html");

  // Check if we have extracted files
  let content = "";
  try {
    const files = fs.readdirSync(".");
    const hasHtmlFiles = files.some((file) => file.endsWith(".html"));
    const hasPackageJson = files.includes("package.json");

    if (hasHtmlFiles) {
      // Try to serve index.html if it exists
      if (files.includes("index.html")) {
        try {
          content = fs.readFileSync("index.html", "utf8");
        } catch (err) {
          content = generateStatusPage(files);
        }
      } else {
        content = generateStatusPage(files);
      }
    } else {
      content = generateStatusPage(files);
    }
  } catch (err) {
    content = generateErrorPage(err);
  }

  res.end(content);
});

function generateStatusPage(files) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Nova Landing - Project Status</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 2rem;
                background-color: #f5f5f5;
            }
            .container {
                background: white;
                padding: 2rem;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .file-list {
                background: #f8f9fa;
                padding: 1rem;
                border-radius: 4px;
                margin: 1rem 0;
            }
            .file-item {
                padding: 0.25rem 0;
                border-bottom: 1px solid #eee;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 Nova Landing Project</h1>
            <p>Server is running! Here's what we found in the project:</p>
            
            <div class="file-list">
                <h3>Project Files (${files.length} total):</h3>
                ${files.map((file) => `<div class="file-item">📄 ${file}</div>`).join("")}
            </div>
            
            <p><strong>Status:</strong> Project extraction ${files.length > 3 ? "appears successful" : "may need attention"}</p>
            <p><strong>Next steps:</strong> ${files.includes("index.html") ? "Found index.html - ready to serve" : "Looking for main HTML file"}</p>
        </div>
    </body>
    </html>
    `;
}

function generateErrorPage(error) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Nova Landing - Error</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background-color: #f0f0f0;
            }
            .container {
                text-align: center;
                padding: 2rem;
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>⚠�� Error Loading Project</h1>
            <p>There was an issue loading the Nova Landing project:</p>
            <pre>${error.message}</pre>
        </div>
    </body>
    </html>
    `;
}

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
