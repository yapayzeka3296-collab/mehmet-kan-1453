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
  // The Lovable wrapper's public config type does not expose Vite's build
  // options, but it forwards them to Vite at runtime. Keep these options
  // here so Netlen's shared-hosting build uses less peak memory.
  build: {
    minify: false,
    cssMinify: false,
    reportCompressedSize: false,
  },
} as any);
