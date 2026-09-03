// MySkyParcel production configuration: TanStack Start + Nitro Node server.
// cPanel/CloudLinux is the production target, so the build always uses Nitro's
// standard node-server preset. No Vercel-specific runtime branching is used.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: {
    preset: "node-server",
  },
});
