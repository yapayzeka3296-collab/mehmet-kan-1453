// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // cPanel serves .output/public directly from public_html.
  // The generated production HTML uses root-relative /assets/... URLs,
  // which keeps assets working on every SSR route.
  tanstackStart: {
    server: { entry: "server" },
    // Legal/informational pages are static content. Explicitly ENABLE
    // prerendering so Nitro actually writes the route HTML files.
    prerender: {
      enabled: true,
      routes: [
        "/uyelik-sozlesmesi",
        "/mesafeli-satis-sozlesmesi",
        "/on-bilgilendirme-formu",
        "/iade-iptal-politikasi",
        "/kvkk",
        "/gizlilik-politikasi",
        "/kullanim-sartlari",
        "/cerez-politikasi",
        "/iletisim",
      ],
      crawlLinks: false,
      failOnError: true,
      retryCount: 2,
      autoSubfolderIndex: true,
    },
  },
  // MySkyParcel production runtime is cPanel + Passenger + Nitro node-server.
  // Keep the build deterministic and never select a platform-specific preset
  // from an unrelated environment variable.
  nitro: {
    preset: "node-server",
  },
});
