// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // cPanel/CloudLinux runs this application as a normal Node.js Passenger app.
  // The Lovable wrapper defaults Nitro to Cloudflare; that output is not the correct
  // runtime target for cPanel. Keep the existing .output/server/index.mjs startup path,
  // but generate it with Nitro's standard Node server preset.
  nitro: {
    preset: "node-server",
  },
});
