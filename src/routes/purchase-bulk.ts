import { createFileRoute } from '@tanstack/react-router';
import { POST as purchaseBulkHandler } from '@/server-fns/purchase-bulk';

export const Route = createFileRoute('/purchase-bulk')({
  server: {
    handlers: {
      POST: purchaseBulkHandler,
    },
  },
});
