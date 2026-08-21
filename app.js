// Netlen/cPanel Passenger startup file for the Nitro/TanStack Start SSR build.
// Keep Passenger's working directory anchored to the project root so the
// production server can always resolve .output/server/index.mjs correctly.
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.chdir(__dirname);

import(path.join(__dirname, ".output", "server", "index.mjs"))
  .then(() => {
    console.log("MySkyParcel Nitro sunucusu Passenger üzerinde başlatıldı.");
  })
  .catch((error) => {
    console.error("MySkyParcel production server failed to start:", error);
    process.exit(1);
  });
