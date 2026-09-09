// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // cPanel serves .output/public directly from public_html.
  // The production build uses root-relative /assets/... URLs, so assets remain
  // valid when a prerendered HTML file is opened at any public route.
  tanstackStart: {
    server: { entry: "server" },
  },
  // Keep the cPanel Passenger/Node build unchanged, but let Vercel use
  // Nitro's native Vercel deployment output when the build runs there.
  // This preserves one source tree for both deployment targets.
  nitro: {
    preset: process.env.VERCEL ? "vercel" : "node-server",
  },
});
