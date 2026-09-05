import { createFileRoute } from '@tanstack/react-router';
import { createClient } from '@supabase/supabase-js';

const getEnv = (name: string) => process.env[name]?.trim() || '';

const escapeXml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const tierName = (tier: string) => ({ digital: 'DİJİTAL', elite: 'ÖZEL', premium: 'PREMİUM' } as Record<string, string>)[tier] || 'PARSEL';

export const Route = createFileRoute('/api/shopier/parcel-image')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const ids = [...new Set((url.searchParams.get('ids') || '').split(',').map((value) => value.trim()).filter(isUuid))].slice(0, 100);
        const supabaseUrl = getEnv('SUPABASE_URL') || getEnv('VITE_SUPABASE_URL');
        const serviceRoleKey = getEnv('SUPABASE_SECRET_KEY') || getEnv('SUPABASE_SERVICE_ROLE_KEY');

        if (!ids.length || !supabaseUrl || !serviceRoleKey) {
          return new Response('Invalid parcel thumbnail request', { status: 400 });
        }

        const supabase = createClient(supabaseUrl, serviceRoleKey, {
          auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
        });
        const { data, error } = await supabase
          .from('parcels')
          .select('parcel_number,tier')
          .in('id', ids);

        if (error || !data?.length) {
          return new Response('Parcel thumbnail unavailable', { status: 404 });
        }

        const parcels = data.map((row) => ({
          number: String(row.parcel_number || 'PARSEL'),
          tier: String(row.tier || 'digital'),
        }));
        const first = parcels[0];
        const countLabel = parcels.length > 1 ? `+${parcels.length - 1} PARSEL` : '1 PARSEL';
        const width = 800;
        const height = 500;

        const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#050b1f"/>
      <stop offset="55%" stop-color="#0b1d3a"/>
      <stop offset="100%" stop-color="#102b52"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="45%" r="60%">
      <stop offset="0%" stop-color="#d7b86a" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#d7b86a" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="800" height="500" rx="32" fill="url(#bg)"/>
  <rect width="800" height="500" rx="32" fill="url(#glow)"/>
  <g stroke="#d7b86a" stroke-opacity="0.18" stroke-width="1">
    <path d="M80 0V500M160 0V500M240 0V500M320 0V500M400 0V500M480 0V500M560 0V500M640 0V500M720 0V500"/>
    <path d="M0 80H800M0 160H800M0 240H800M0 320H800M0 400H800"/>
  </g>
  <rect x="42" y="42" width="716" height="416" rx="24" fill="none" stroke="#d7b86a" stroke-opacity="0.45" stroke-width="2"/>
  <text x="70" y="95" fill="#ffffff" font-family="Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="4">MYSKYPARCEL</text>
  <text x="730" y="95" text-anchor="end" fill="#d7b86a" font-family="Arial, sans-serif" font-size="17" font-weight="700">${escapeXml(tierName(first.tier))}</text>
  <rect x="105" y="135" width="590" height="205" rx="18" fill="#071226" stroke="#d7b86a" stroke-opacity="0.65" stroke-width="2"/>
  <path d="M135 285L205 215L275 270L355 185L440 265L520 205L665 300" fill="none" stroke="#d7b86a" stroke-opacity="0.75" stroke-width="3"/>
  <path d="M135 305L220 250L300 305L385 230L470 305L555 250L665 315" fill="none" stroke="#ffffff" stroke-opacity="0.3" stroke-width="2"/>
  <text x="400" y="205" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="34" font-weight="800" letter-spacing="2">${escapeXml(first.number)}</text>
  <text x="400" y="390" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="20" font-weight="700">${escapeXml(countLabel)}</text>
  <text x="400" y="425" text-anchor="middle" fill="#d7b86a" font-family="Arial, sans-serif" font-size="15" letter-spacing="2">SEÇİLEN PARSEL / PARSELLER</text>
</svg>`;

        return new Response(svg, {
          status: 200,
          headers: {
            'content-type': 'image/svg+xml; charset=utf-8',
            'cache-control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=3600',
            'access-control-allow-origin': '*',
          },
        });
      },
    },
  },
});
