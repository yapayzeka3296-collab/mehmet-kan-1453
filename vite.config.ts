// MySkyParcel production build target: standard Node.js/Passenger hosting.
// The Lovable wrapper supplies TanStack Start, React, Tailwind, path aliases,
// and Nitro. We explicitly select Nitro's Node preset so the production build
// emits .output/server/index.mjs instead of the wrapper's default worker target.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: {
    preset: "node",
  },
});
