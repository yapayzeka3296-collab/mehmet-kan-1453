// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // cPanel deploys .output/public directly into public_html, so all browser
  // assets must resolve from the domain root (/assets, /images, etc.).
  base: "/",
  tanstackStart: {
    server: { entry: "server" },
  },
  // Keep the same source compatible with both deployment targets.
  nitro: {
    preset: process.env.VERCEL ? "vercel" : "node-server",
  },
});
