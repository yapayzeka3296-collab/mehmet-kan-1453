// Phusion Passenger entry point (CommonJS).
// cPanel/CloudLinux Passenger expects app.js to be a CommonJS entry file.
// The Nitro production server remains the ESM build output.
process.env.NODE_ENV = process.env.NODE_ENV || "production";

import("./.output/server/index.mjs").catch((error) => {
  console.error("Failed to start Nitro server:", error);
  process.exitCode = 1;
});
