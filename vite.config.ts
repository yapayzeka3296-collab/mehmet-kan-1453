// MySkyParcel production build target: standard Node.js/Passenger hosting.
// The Lovable wrapper supplies TanStack Start, React, Tailwind, path aliases,
// and Nitro. We explicitly select Nitro's Node preset so the production build
// emits .output/server/index.mjs for Netlen's Node.js hosting environment.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: {
    preset: "node",
  },
  // Netlen is now on the 4 GB Professional plan. Production builds are
  // generated in GitHub Actions, not on the shared hosting account, so the
  // previous low-memory workaround is no longer appropriate. Keep Vite's
  // normal production minification enabled to reduce the runtime asset size.
} as any);
