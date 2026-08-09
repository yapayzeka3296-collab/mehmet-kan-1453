import { createFileRoute } from '@tanstack/react-router';
import { POST as purchaseHandler } from '@/server-fns/purchase';

export const Route = createFileRoute('/purchase')({
  server: {
    handlers: {
      POST: purchaseHandler,
    },
  },
});
