// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // cPanel serves .output/public directly from public_html.
  // Keep browser assets root-relative so nested SSR routes never resolve
  // assets as /route/assets/....
  base: "/",
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
