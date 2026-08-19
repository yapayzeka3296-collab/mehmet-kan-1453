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
  build: {
    // Netlen's shared hosting has a tight build-time memory budget.
    // Disabling JS/CSS minification reduces peak Vite/Rollup memory usage
    // without changing application behavior. The output is still a normal
    // production build and is served by the same Nitro Node preset.
    minify: false,
    cssMinify: false,
    reportCompressedSize: false,
  },
});
