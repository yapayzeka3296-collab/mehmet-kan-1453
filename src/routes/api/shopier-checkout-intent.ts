import { createFileRoute } from '@tanstack/react-router';

/**
 * Backward-compatible alias for older payment pages/clients.
 * The canonical endpoint is /api/shopier/checkout. Keeping this alias prevents
 * stale browser HTML from turning a valid checkout attempt into a 404 while
 * the new build propagates through cPanel caches.
 */
export const Route = createFileRoute('/api/shopier-checkout-intent')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const target = new URL('/api/shopier/checkout', request.url);
        const headers = new Headers(request.headers);
        headers.delete('host');
        headers.delete('content-length');

        const response = await fetch(target, {
          method: 'POST',
          headers,
          body: await request.arrayBuffer(),
        });

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      },
    },
  },
});
