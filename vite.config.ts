// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  base: "./",
  tanstackStart: {
    // Use the project's explicit SSR server entry in both runtimes.
    server: { entry: "server" },
  },
  // cPanel/CloudLinux needs the Node server preset, while Vercel needs Nitro's
  // Vercel deployment preset. Selecting from VERCEL keeps one source tree usable
  // on both platforms without changing the Node.js startup path on cPanel.
  nitro: {
    preset: process.env.VERCEL ? "vercel" : "node-server",
  },
});
