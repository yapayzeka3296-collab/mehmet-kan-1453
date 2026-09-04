// MySkyParcel cPanel / CloudLinux Passenger entry point.
// Passenger provides the HTTP port through PORT. Nitro's node-server preset
// must bind to that same port; otherwise the application can appear to work
// on the root while nested SSR routes are handled by the web server instead.
process.env.NODE_ENV = process.env.NODE_ENV || "production";
if (!process.env.NITRO_PORT && process.env.PORT) process.env.NITRO_PORT = process.env.PORT;
if (!process.env.NITRO_HOST && process.env.HOST) process.env.NITRO_HOST = process.env.HOST;

import("./.output/server/index.mjs").catch((error) => {
  console.error("Failed to start MySkyParcel Nitro server:", error);
  process.exitCode = 1;
});
