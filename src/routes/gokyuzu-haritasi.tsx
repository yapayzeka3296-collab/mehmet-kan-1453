import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/gokyuzu-haritasi")({
  beforeLoad: ({ search }) => {
    const city = typeof search === "object" && search && "city" in search ? String((search as { city?: unknown }).city ?? "") : "";
    throw redirect({
      to: "/turkiye-haritasi",
      search: city ? { city } : undefined,
      replace: true,
    });
  },
});
