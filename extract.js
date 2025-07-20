const fs = require("fs");
const { execSync } = require("child_process");

// Try using node's built-in modules to handle the zip
try {
  // Check if unzip is available
  execSync("unzip -qq nova-landing.zip", { stdio: "inherit" });
  console.log("Extracted successfully with unzip");
} catch (error) {
  console.log("Unzip failed, trying alternative method...");
  console.log("Error:", error.message);
}
