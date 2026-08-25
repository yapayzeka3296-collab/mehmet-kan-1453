import { createFileRoute } from '@tanstack/react-router';

const ASSETS = {
  earth: {
    url: 'https://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73630/world.topo.bathy.200403.3x5400x2700.jpg',
    contentType: 'image/jpeg',
  },
  clouds: {
    url: 'https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57747/cloud_combined_2048.jpg',
    contentType: 'image/jpeg',
  },
  provinces: {
    url: 'https://raw.githubusercontent.com/ttezer/turkiye-harita-verisi/master/dist/geojson/provinces.geojson',
    contentType: 'application/geo+json; charset=utf-8',
  },
} as const;

type AssetName = keyof typeof ASSETS;

export const Route = createFileRoute('/api/earth-assets')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const type = new URL(request.url).searchParams.get('type') as AssetName | null;
        if (!type || !(type in ASSETS)) {
          return new Response(JSON.stringify({ ok: false, reason: 'invalid_asset' }), {
            status: 400,
            headers: { 'content-type': 'application/json; charset=utf-8' },
          });
        }

        const asset = ASSETS[type];
        try {
          const upstream = await fetch(asset.url, {
            headers: { 'user-agent': 'MySkyParcel/1.0 Earth Globe asset proxy' },
          });
          if (!upstream.ok) {
            return new Response(JSON.stringify({ ok: false, reason: 'upstream_error', status: upstream.status }), {
              status: 502,
              headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
            });
          }

          const headers = new Headers();
          headers.set('content-type', asset.contentType);
          headers.set('cache-control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
          headers.set('access-control-allow-origin', '*');
          return new Response(upstream.body, { status: 200, headers });
        } catch (error) {
          console.error(`Earth asset proxy failed for ${type}`, error);
          return new Response(JSON.stringify({ ok: false, reason: 'proxy_error' }), {
            status: 502,
            headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
          });
        }
      },
    },
  },
});
