// Netlen/cPanel Passenger startup file.
// The production Nitro build is generated before Passenger starts this file.
import("./.output/server/index.mjs").catch((error) => {
  console.error("MySkyParcel production server failed to start:", error);
  process.exit(1);
});
