import { createFileRoute, Link } from '@tanstack/react-router';
import * as THREE from 'three';
import { useEffect, useRef, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { useAuth } from '@/hooks/useAuth';
import { SiteHeader } from '@/components/SiteHeader';
import './gokyuzu.css';

export const Route = createFileRoute('/gokyuzu')({ component: GokyuzuPage });

const SKY_IMAGE_URL =
  'https://cdn.polyhaven.com/asset_img/primary/kloppenheim_03_puresky.png?height=2048';

const REAL_PARCELS_PER_CITY = 1_000;
const CITY_GRID_WIDTH = 40;
const CITY_GRID_HEIGHT = 25;
const PARCEL_COLUMNS = CITY_GRID_WIDTH;
const PARCEL_ROWS = CITY_GRID_HEIGHT;
const REAL_PARCEL_COUNT = REAL_PARCELS_PER_CITY;
const TOTAL_PARCELS = 81_000_000;
const TILE_SIZE = 10;

type RealSkyParcel = {
  id: string;
  parcel_number: string;
  status: string;
  price: number | null;
  tier: string | null;
  city_name: string | null;
  city_code: string | null;
  layer_number: number | null;
  sector_number: number | null;
  grid_x: number | null;
  grid_y: number | null;
};

type ParcelAd = {
  id: string;
  parcel_id: string;
  title: string;
  image_path: string;
  link_url: string | null;
  is_active: boolean;
};

const specialProvinceNumbers: Record<string, number> = {
  ANK: 6,
  ANT: 7,
  BUR: 16,
  GZT: 27,
  IST: 34,
  IZM: 35,
  KAY: 38,
};

const normalizeCityName = (value: string) =>
  value
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\\u0300-\\u036f]/g, '')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]/g, '');

const pointInRing = (longitude: number, latitude: number, ring: number[][]) => {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i]?.[0] ?? 0;
    const yi = ring[i]?.[1] ?? 0;
    const xj = ring[j]?.[0] ?? 0;
    const yj = ring[j]?.[1] ?? 0;
    const intersects =
      yi > latitude !== yj > latitude &&
      longitude < ((xj - xi) * (latitude - yi)) / ((yj - yi) || Number.EPSILON) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
};

const pointInPolygon = (longitude: number, latitude: number, coordinates: number[][][]) => {
  if (!coordinates[0] || !pointInRing(longitude, latitude, coordinates[0])) return false;
  for (let i = 1; i < coordinates.length; i += 1) {
    if (coordinates[i] && pointInRing(longitude, latitude, coordinates[i])) return false;
  }
  return true;
};

const findProvinceFromGeoJson = (
  longitude: number,
  latitude: number,
  geoJson: {
    features?: Array<{
      properties?: Record<string, unknown>;
      geometry?: { type?: string; coordinates?: unknown };
    }>;
  },
) => {
  for (const feature of geoJson.features ?? []) {
    const geometry = feature.geometry;
    if (!geometry?.coordinates) continue;
    const coordinates = geometry.coordinates;
    let matched = false;
    if (geometry.type === 'Polygon') {
      matched = pointInPolygon(longitude, latitude, coordinates as number[][][]);
    } else if (geometry.type === 'MultiPolygon') {
      matched = (coordinates as number[][][][]).some((polygon) =>
        pointInPolygon(longitude, latitude, polygon),
      );
    }
    if (!matched) continue;

    const properties = feature.properties ?? {};
    const name =
      properties.name ??
      properties.NAME_1 ??
      properties.NAME ??
      properties.il_adi ??
      properties.IL_ADI ??
      properties.province;
    if (typeof name === 'string' && name.trim()) return name.trim();
  }
  return null;
};

function GokyuzuPage() {
  const { user } = useAuth();
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedParcel, setSelectedParcel] = useState<RealSkyParcel | null>(null);
  const [selectedAd, setSelectedAd] = useState<ParcelAd | null>(null);
  const [selectedIsOwner, setSelectedIsOwner] = useState(false);
  const [adTitle, setAdTitle] = useState('');
  const [adLink, setAdLink] = useState('');
  const [adFile, setAdFile] = useState<File | null>(null);
  const [adSaving, setAdSaving] = useState(false);
  const [adMessage, setAdMessage] = useState('');
  const [worldLoading, setWorldLoading] = useState(true);