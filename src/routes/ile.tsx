import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/ile")({
  beforeLoad: () => {
    throw redirect({ to: "/iletisim", replace: true });
  },
});
