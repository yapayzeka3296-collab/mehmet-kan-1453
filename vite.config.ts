// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // cPanel serves .output/public directly from public_html.
  // The Lovable config's typed options do not expose Vite's `base` here.
  // Root-relative asset URLs are the correct cPanel layout because the public
  // build is copied directly into /public_html.
  tanstackStart: {
    server: { entry: "server" },
  },
  // MySkyParcel production runtime is cPanel + Passenger + Nitro node-server.
  // Keep the build deterministic and never select a platform-specific preset
  // from an unrelated environment variable.
  nitro: {
    preset: "node-server",
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
  },
});
