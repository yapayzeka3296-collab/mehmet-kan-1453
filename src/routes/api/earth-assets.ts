import { createFileRoute } from '@tanstack/react-router';

const ASSETS = {
  earth: {
    url: 'https://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73630/world.topo.bathy.200403.3x5400x2700.jpg',
    contentType: 'image/jpeg',
    cacheControl: 'public, max-age=2592000, s-maxage=2592000, stale-while-revalidate=604800, stale-if-error=2592000',
    source: 'NASA Earth Observatory / GSFC',
  },
  clouds: {
    url: 'https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57747/cloud_combined_2048.jpg',
    contentType: 'image/jpeg',
    cacheControl: 'public, max-age=2592000, s-maxage=2592000, stale-while-revalidate=604800, stale-if-error=2592000',
    source: 'NASA Earth Observatory / GSFC',
  },
  provinces: {
    // Lightweight 81-province GeoJSON (~241 KB), replacing the previous ~8 MB source.
    // This avoids large upstream fetches and makes the Vercel proxy much more reliable.
    url: 'https://raw.githubusercontent.com/cihadturhan/tr-geojson/master/geo/tr-cities-utf8.json',
    contentType: 'application/geo+json; charset=utf-8',
    cacheControl: 'public, max-age=2592000, s-maxage=2592000, stale-while-revalidate=604800, stale-if-error=2592000',
    source: 'cihadturhan/tr-geojson',
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
            cache: 'force-cache',
          });
          if (!upstream.ok) {
            return new Response(JSON.stringify({ ok: false, reason: 'upstream_error', status: upstream.status }), {
              status: 502,
              headers: {
                'content-type': 'application/json; charset=utf-8',
                'cache-control': 'no-store',
              },
            });
          }

          const body = await upstream.arrayBuffer();
          const headers = new Headers();
          headers.set('content-type', asset.contentType);
          headers.set('cache-control', asset.cacheControl);
          headers.set('access-control-allow-origin', '*');
          headers.set('x-myskyparcel-asset-source', asset.source);
          return new Response(body, { status: 200, headers });
        } catch (error) {
          console.error(`Earth asset proxy failed for ${type}`, error);
          return new Response(JSON.stringify({ ok: false, reason: 'proxy_error' }), {
            status: 502,
            headers: {
              'content-type': 'application/json; charset=utf-8',
              'cache-control': 'no-store',
            },
          });
        }
      },
    },
  },
});
