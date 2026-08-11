import { createFileRoute } from "@tanstack/react-router";
import { GET as adminCheckHandler } from "@/server-fns/admin-check";

export const Route = createFileRoute("/admin-check")({
  server: {
    handlers: {
      GET: adminCheckHandler,
    },
  },
});
