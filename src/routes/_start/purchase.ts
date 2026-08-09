import { createFileRoute } from '@tanstack/react-router';
import { POST as purchaseHandler } from '@/server-fns/purchase';

export const Route = createFileRoute('/_start/purchase')({
  server: {
    handlers: {
      POST: purchaseHandler,
    },
  },
});
