// MySkyParcel cPanel / CloudLinux Passenger entry point.
// Passenger supplies PORT; Nitro must listen on that same port.
// Keep the Node server responsible for HTML/SSR routes while Apache/LiteSpeed
// serves the copied .output/public assets directly.
process.env.NODE_ENV = process.env.NODE_ENV || "production";
process.env.NITRO_HOST = process.env.NITRO_HOST || process.env.HOST || "0.0.0.0";
if (process.env.PORT) process.env.NITRO_PORT = process.env.PORT;

import("./.output/server/index.mjs").catch((error) => {
  console.error("Failed to start MySkyParcel Nitro server:", error);
  process.exit(1);
});
