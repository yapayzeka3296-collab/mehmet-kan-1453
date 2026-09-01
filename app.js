// Phusion Passenger production entry point.
// Passenger starts this file after the production build has generated
// .output/server/index.mjs.
process.env.NODE_ENV ??= "production";

await import("./.output/server/index.mjs");
