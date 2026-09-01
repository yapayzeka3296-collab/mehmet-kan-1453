import { createFileRoute } from "@tanstack/react-router";
import { POST as shopierWebhookHandler } from "@/server-fns/shopier-webhook";

export const Route = createFileRoute("/api/shopier/webhook")({
  server: {
    handlers: {
      POST: shopierWebhookHandler,
    },
  },
});
