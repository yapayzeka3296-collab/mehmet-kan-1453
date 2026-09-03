// cPanel / CloudLinux Passenger entry point for the Nitro node-server build.
// Passenger executes this CommonJS file from the application root.
// Nitro itself owns the HTTP server and reads Passenger's PORT for reverse binding.
process.env.NODE_ENV = process.env.NODE_ENV || "production";

const path = require("node:path");
const { pathToFileURL } = require("node:url");

const nitroEntry = path.join(__dirname, ".output", "server", "index.mjs");

// Use an absolute file URL so startup does not depend on Passenger's current
// working directory. This is important when the application root and domain
// document root are different directories on cPanel.
import(pathToFileURL(nitroEntry).href).catch((error) => {
  console.error("Failed to start Nitro server:", error);
  process.exit(1);
});
