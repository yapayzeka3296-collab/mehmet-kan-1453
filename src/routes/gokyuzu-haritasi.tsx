import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/gokyuzu-haritasi")({
  beforeLoad: () => {
    throw redirect({
      to: "/turkiye-haritasi",
      replace: true,
    });
  },
});
