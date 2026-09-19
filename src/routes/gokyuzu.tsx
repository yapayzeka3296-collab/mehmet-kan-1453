import { createFileRoute, Link } from '@tanstack/react-router';
import * as THREE from 'three';
import { useEffect, useRef, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { useAuth } from '@/hooks/useAuth';
import './gokyuzu.css';

export const Route = createFileRoute('/gokyuzu')({ ssr: false, component: GokyuzuPage });

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
  const [worldLoaded, setWorldLoaded] = useState(0);
  const [detectedCity, setDetectedCity] = useState<string | null>(null);
  const [locationMessage, setLocationMessage] = useState('Konumunuz alınıyor…');
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedParcel) {
      setSelectedAd(null);
      setSelectedIsOwner(false);
      setAdMessage('');
      return;
    }

    let cancelled = false;
    const loadParcelAd = async () => {
      setAdMessage('');
      const [{ data: ownerData }, { data: adData }] = await Promise.all([
        user
          ? supabaseBrowser.rpc('is_parcel_owner', { p_parcel_id: selectedParcel.id })
          : Promise.resolve({ data: false }),
        supabaseBrowser
          .from('parcel_advertisements')
          .select('id,parcel_id,title,image_path,link_url,is_active')
          .eq('parcel_id', selectedParcel.id)
          .maybeSingle(),
      ]);
      if (cancelled) return;
      setSelectedIsOwner(Boolean(ownerData));
      setSelectedAd((adData as ParcelAd | null) ?? null);
      setAdTitle((adData as ParcelAd | null)?.title ?? '');
      setAdLink((adData as ParcelAd | null)?.link_url ?? '');
    };

    void loadParcelAd();
    return () => { cancelled = true; };
  }, [selectedParcel, user]);

  const saveAdvertisement = async () => {
    if (!selectedParcel || !user || !selectedIsOwner) return;
    if (!adFile && !selectedAd) {
      setAdMessage('Bir reklam görseli seçin.');
      return;
    }
    if (adFile && (!adFile.type.startsWith('image/') || adFile.size > 5 * 1024 * 1024)) {
      setAdMessage('Görsel JPG, PNG, WEBP veya GIF olmalı ve 5 MB altında olmalı.');
      return;
    }

    setAdSaving(true);
    setAdMessage('');

    try {
      let imagePath = selectedAd?.image_path ?? '';
      if (adFile) {
        const extension = adFile.name.split('.').pop()?.toLowerCase() || 'jpg';
        const nextPath = user.id + '/' + selectedParcel.id + '/' + crypto.randomUUID() + '.' + extension;
        const upload = await supabaseBrowser.storage
          .from('parcel-ads')
          .upload(nextPath, adFile, { contentType: adFile.type, upsert: false });
        if (upload.error) throw upload.error;
        imagePath = nextPath;
      }

      const payload = {
        parcel_id: selectedParcel.id,
        title: adTitle.trim() || 'Parsel Reklamı',
        image_path: imagePath,
        link_url: adLink.trim() || null,
        is_active: true,
      };

      const { data, error } = await supabaseBrowser
        .from('parcel_advertisements')
        .upsert(payload, { onConflict: 'parcel_id' })
        .select('id,parcel_id,title,image_path,link_url,is_active')
        .single();

      if (error) throw error;
      setSelectedAd(data as ParcelAd);
      setAdFile(null);
      setAdMessage('Reklam bu parsele yayınlandı.');
    } catch (error) {
      console.error('Parsel reklamı kaydedilemedi:', error);
      setAdMessage(error instanceof Error ? error.message : 'Reklam kaydedilemedi.');
    } finally {
      setAdSaving(false);
    }
  };

  const removeAdvertisement = async () => {
    if (!selectedParcel || !selectedIsOwner || !selectedAd) return;
    setAdSaving(true);
    setAdMessage('');
    try {
      const { error } = await supabaseBrowser
        .from('parcel_advertisements')
        .delete()
        .eq('parcel_id', selectedParcel.id);
      if (error) throw error;
      await supabaseBrowser.storage.from('parcel-ads').remove([selectedAd.image_path]);
      setSelectedAd(null);
      setAdTitle('');
      setAdLink('');
      setAdMessage('Reklam kaldırıldı.');
    } catch (error) {
      console.error('Parsel reklamı kaldırılamadı:', error);
      setAdMessage(error instanceof Error ? error.message : 'Reklam kaldırılamadı.');
    } finally {
      setAdSaving(false);
    }
  };

  const getAdUrl = (ad: ParcelAd) =>
    supabaseBrowser.storage.from('parcel-ads').getPublicUrl(ad.image_path).data.publicUrl;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      52,
      Math.max(mount.clientWidth, 1) / Math.max(mount.clientHeight, 1),
      0.1,
      20000,
    );
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.touchAction = 'none';
    renderer.domElement.style.cursor = 'grab';
    mount.appendChild(renderer.domElement);

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    const skyTexture = loader.load(SKY_IMAGE_URL);
    skyTexture.colorSpace = THREE.SRGBColorSpace;
    skyTexture.mapping = THREE.EquirectangularReflectionMapping;
    const skyGeometry = new THREE.SphereGeometry(8000, 48, 24);
    skyGeometry.scale(-1, 1, 1);
    const skyMaterial = new THREE.MeshBasicMaterial({
      map: skyTexture,
      side: THREE.BackSide,
      depthWrite: false,
    });
    scene.add(new THREE.Mesh(skyGeometry, skyMaterial));

    const cameraTarget = new THREE.Vector3(0, 2.5, 0);
    const zoomPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -2.58);
    const zoomWorldBefore = new THREE.Vector3();
    const zoomWorldAfter = new THREE.Vector3();
    const zoomRay = new THREE.Ray();
    camera.position.set(0, 32, 34);
    camera.lookAt(cameraTarget);

    const parcelGroup = new THREE.Group();
    scene.add(parcelGroup);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    raycaster.params.Line.threshold = 2.5;

    let panX = 0;
    let panZ = 0;
    let velocityX = 0;
    let velocityZ = 0;
    let dragging = false;
    let dragMoved = false;
    let lastPointerX = 0;
    let lastPointerY = 0;
    let pointerDownX = 0;
    let pointerDownY = 0;
    const pointers = new Map<number, { x: number; y: number }>();
    let pinchDistance: number | null = null;

    const getFitDistance = () => {
      const verticalFov = THREE.MathUtils.degToRad(camera.fov);
      const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * Math.max(camera.aspect, 0.1));
      const fitWidth = (PARCEL_COLUMNS * TILE_SIZE) / (2 * Math.tan(horizontalFov / 2));
      const fitDepth = (PARCEL_ROWS * TILE_SIZE) / (2 * Math.tan(verticalFov / 2));
      return Math.ceil(Math.max(fitWidth, fitDepth) * 1.18);
    };

    const setZoom = (distance: number, focusX?: number, focusY?: number) => {
      const maxZoomDistance = Math.max(120, getFitDistance());
      const clamped = THREE.MathUtils.clamp(distance, 18, maxZoomDistance);
      camera.position.y = THREE.MathUtils.clamp(clamped * 0.9, 14, 520);
      camera.position.z = clamped;
      camera.lookAt(cameraTarget);
      if (focusX == null || focusY == null) return;

      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((focusX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((focusY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      if (!raycaster.ray.intersectPlane(zoomPlane, zoomWorldAfter)) return;
      const shiftX = zoomWorldBefore.x - zoomWorldAfter.x;
      const shiftZ = zoomWorldBefore.z - zoomWorldAfter.z;
      applyPan(
        THREE.MathUtils.clamp(panX + shiftX, -maxPanX, maxPanX),
        THREE.MathUtils.clamp(panZ + shiftZ, -maxPanZ, maxPanZ),
      );
    };

    const maxPanX = (PARCEL_COLUMNS * TILE_SIZE) * 0.5 - 20;
    const maxPanZ = (PARCEL_ROWS * TILE_SIZE) * 0.5 - 20;
    const dragScale = 0.1;
    const friction = 0.9;
    const inertiaStop = 0.015;

    const applyPan = (x: number, z: number) => {
      panX = x;
      panZ = z;
      parcelGroup.position.set(panX, 0, panZ);
    };

    const applyDrag = (dx: number, dy: number) => {
      const nextX = THREE.MathUtils.clamp(panX + dx * dragScale, -maxPanX, maxPanX);
      const nextZ = THREE.MathUtils.clamp(panZ + dy * dragScale, -maxPanZ, maxPanZ);
      const movementX = nextX - panX;
      const movementZ = nextZ - panZ;
      velocityX = velocityX * 0.65 + movementX * 0.35;
      velocityZ = velocityZ * 0.65 + movementZ * 0.35;
      if (nextX === -maxPanX || nextX === maxPanX) velocityX = 0;
      if (nextZ === -maxPanZ || nextZ === maxPanZ) velocityZ = 0;
      applyPan(nextX, nextZ);
    };

    const stopInertia = () => {
      velocityX = 0;
      velocityZ = 0;
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const current = Math.max(18, camera.position.z);
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      if (raycaster.ray.intersectPlane(zoomPlane, zoomWorldBefore)) {
        setZoom(
          current + THREE.MathUtils.clamp(event.deltaY, -160, 160) * 0.12,
          event.clientX,
          event.clientY,
        );
      } else {
        setZoom(current + THREE.MathUtils.clamp(event.deltaY, -160, 160) * 0.12);
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      event.preventDefault();
      event.stopPropagation();
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      pointerDownX = event.clientX;
      pointerDownY = event.clientY;
      try { renderer.domElement.setPointerCapture(event.pointerId); } catch { /* unsupported */ }

      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinchDistance = Math.max(1, Math.hypot(a.x - b.x, a.y - b.y));
        dragging = false;
        stopInertia();
        return;
      }

      dragging = true;
      dragMoved = false;
      stopInertia();
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
      renderer.domElement.style.cursor = 'grabbing';
    };

    const onPointerMove = (event: PointerEvent) => {
      const previous = pointers.get(event.pointerId);
      if (!previous) {
        updateHover(event);
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (pointers.size === 2 && pinchDistance) {
        const [a, b] = [...pointers.values()];
        const distance = Math.max(1, Math.hypot(a.x - b.x, a.y - b.y));
        const current = Math.max(18, camera.position.z);
        const rect = renderer.domElement.getBoundingClientRect();
        const focusX = (a.x + b.x) / 2;
        const focusY = (a.y + b.y) / 2;
        pointer.x = ((focusX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((focusY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        if (raycaster.ray.intersectPlane(zoomPlane, zoomWorldBefore)) {
          setZoom(current / (distance / pinchDistance), focusX, focusY);
        } else {
          setZoom(current / (distance / pinchDistance));
        }
        pinchDistance = distance;
        renderer.domElement.style.cursor = 'grab';
        return;
      }

      if (!dragging) {
        updateHover(event);
        return;
      }

      const dx = event.clientX - lastPointerX;
      const dy = event.clientY - lastPointerY;
      if (Math.hypot(dx, dy) > 1) dragMoved = true;
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
      clearHover();
      applyDrag(dx, dy);
    };

    const onPointerUp = (event: PointerEvent) => {
      pointers.delete(event.pointerId);
      if (pointers.size < 2) pinchDistance = null;
      dragging = pointers.size === 1;
      if (pointers.size === 0 && dragMoved) {
        dragMoved = true;
      }
      if (dragging) {
        const remaining = [...pointers.values()][0];
        lastPointerX = remaining.x;
        lastPointerY = remaining.y;
      } else {
        renderer.domElement.style.cursor = 'grab';
      }
      try { renderer.domElement.releasePointerCapture(event.pointerId); } catch { /* unsupported */ }
    };

    let hoveredIndex: number | null = null;
    let parcelMesh: THREE.InstancedMesh | null = null;
    const parcelBaseColors: THREE.Color[] = [];

    const clearHover = () => {
      if (hoveredIndex == null || !parcelMesh) return;
      const color = parcelBaseColors[hoveredIndex];
      if (color) parcelMesh.setColorAt(hoveredIndex, color);
      parcelMesh.instanceColor!.needsUpdate = true;
      hoveredIndex = null;
      renderer.domElement.style.cursor = dragging ? 'grabbing' : 'grab';
    };

    const updateHover = (event: PointerEvent) => {
      if (!parcelMesh || dragging || pointers.size > 1) {
        clearHover();
        return;
      }
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObject(parcelMesh, false)[0];
      const nextIndex = hit?.instanceId ?? null;
      if (nextIndex === hoveredIndex) return;
      clearHover();
      if (nextIndex == null || !parcelBaseColors[nextIndex]) return;
      hoveredIndex = nextIndex;
      parcelMesh.setColorAt(nextIndex, new THREE.Color(0xffd166));
      parcelMesh.instanceColor!.needsUpdate = true;
      renderer.domElement.style.cursor = 'pointer';
    };

    const loadAllWorldData = async () => {
      setWorldLoading(true);
      setWorldLoaded(0);
      setDetectedCity(null);
      setLocationError(null);
      setLocationMessage('Konumunuz alınıyor…');

      if (!navigator.geolocation) {
        throw new Error('Bu cihazda konum özelliği desteklenmiyor.');
      }

      const citiesResult = await supabaseBrowser
        .from('cities')
        .select('name,code')
        .eq('is_active', true);

      if (citiesResult.error) throw citiesResult.error;

      const cities = (citiesResult.data ?? []).map((city) => ({
        name: city.name,
        code: city.code,
      }));

      if (cities.length === 0) {
        throw new Error('Aktif il kaydı bulunamadı.');
      }

      const getPosition = (options: PositionOptions) =>
        new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, options);
        });

      let position: GeolocationPosition;
      try {
        position = await getPosition({
          enableHighAccuracy: true,
          timeout: 12_000,
          maximumAge: 5 * 60_000,
        });
      } catch (firstError) {
        const code = (firstError as GeolocationPositionError)?.code;
        if (code === GeolocationPositionError.PERMISSION_DENIED) {
          throw new Error('Konum izni verilmedi. Tarayıcıdan konum iznini açıp sayfayı yenileyin.');
        }
        setLocationMessage('GPS sinyali bekleniyor, ikinci konum denemesi yapılıyor…');
        position = await getPosition({
          enableHighAccuracy: false,
          timeout: 10_000,
          maximumAge: 10 * 60_000,
        });
      }

      const { latitude, longitude } = position.coords;
      setLocationMessage('Bulunduğunuz il belirleniyor…');

      const provinceResponse = await fetch('/api/earth-assets?type=provinces', {
        cache: 'force-cache',
      });
      if (!provinceResponse.ok) throw new Error('İl sınırları alınamadı.');
      const provinceGeoJson = await provinceResponse.json();
      const provinceName = findProvinceFromGeoJson(longitude, latitude, provinceGeoJson);

      if (!provinceName) {
        throw new Error('Konumunuz Türkiye sınırları içinde bir ile eşleştirilemedi.');
      }

      const normalizedProvince = normalizeCityName(provinceName);
      const city = cities.find((item) => normalizeCityName(item.name) === normalizedProvince);

      if (!city) {
        throw new Error('Konumunuzdaki il MySkyParcel il listesinde bulunamadı.');
      }

      setDetectedCity(city.name);
      setLocationMessage(city.name + ' · 1.000 parsel hazırlanıyor…');

      const { data: parcelData, error: parcelError } = await supabaseBrowser
        .from('parcel_map_public')
        .select('id,parcel_number,status,price,tier,city_name,city_code,layer_number,sector_number,grid_x,grid_y')
        .eq('city_name', city.name)
        .order('grid_y', { ascending: true })
        .order('grid_x', { ascending: true })
        .range(0, REAL_PARCELS_PER_CITY - 1);

      if (parcelError) throw parcelError;

      const allParcels = (parcelData ?? []) as RealSkyParcel[];
      if (allParcels.length !== REAL_PARCELS_PER_CITY) {
        throw new Error(city.name + ' için 1.000 parsel yerine ' + allParcels.length.toLocaleString('tr-TR') + ' parsel bulundu.');
      }
      setWorldLoaded(allParcels.length);

      const adsResult = await supabaseBrowser
        .from('parcel_advertisements')
        .select('id,parcel_id,title,image_path,link_url,is_active')
        .eq('is_active', true);

      if (adsResult.error) throw adsResult.error;

      const gridPositions = new Float32Array(REAL_PARCEL_COUNT * 4 * 2 * 3);
      let gridCursor = 0;
      const halfWorldX = (PARCEL_COLUMNS * TILE_SIZE) / 2;
      const halfWorldZ = (PARCEL_ROWS * TILE_SIZE) / 2;

      for (let globalZ = 0; globalZ < PARCEL_ROWS; globalZ += 1) {
        for (let globalX = 0; globalX < PARCEL_COLUMNS; globalX += 1) {
          const x = globalX * TILE_SIZE - halfWorldX;
          const z = globalZ * TILE_SIZE - halfWorldZ;
          const x2 = x + TILE_SIZE;
          const z2 = z + TILE_SIZE;
          const values = [
            [x, 2.15, z], [x2, 2.15, z],
            [x2, 2.15, z], [x2, 2.15, z2],
            [x2, 2.15, z2], [x, 2.15, z2],
            [x, 2.15, z2], [x, 2.15, z],
          ];
          for (const point of values) {
            gridPositions[gridCursor++] = point[0];
            gridPositions[gridCursor++] = point[1];
            gridPositions[gridCursor++] = point[2];
          }
        }
      }

      const gridGeometry = new THREE.BufferGeometry();
      gridGeometry.setAttribute('position', new THREE.BufferAttribute(gridPositions, 3));
      const gridMaterial = new THREE.LineBasicMaterial({
        color: 0xffd166,
        transparent: true,
        opacity: 1,
        depthWrite: false,
        depthTest: false,
      });
      const gridLines = new THREE.LineSegments(gridGeometry, gridMaterial);
      parcelGroup.add(gridLines);

      const parcelGeometry = new THREE.PlaneGeometry(TILE_SIZE * 0.92, TILE_SIZE * 0.92);
      parcelMesh = new THREE.InstancedMesh(
        parcelGeometry,
        new THREE.MeshBasicMaterial({
          transparent: true,
          opacity: 0.72,
          side: THREE.DoubleSide,
          depthWrite: false,
          depthTest: false,
          vertexColors: true,
        }),
        REAL_PARCEL_COUNT,
      );
      parcelMesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);

      const baseColor = new THREE.Color();
      const matrix = new THREE.Matrix4();
      const adMap = new Map((adsResult.data ?? []).map((ad) => [ad.parcel_id, ad as ParcelAd]));

      for (let i = 0; i < allParcels.length; i += 1) {
        const parcel = allParcels[i];
        if (parcel.grid_x == null || parcel.grid_y == null) continue;

        const globalX = parcel.grid_x;
        const globalZ = parcel.grid_y;
        const x = globalX * TILE_SIZE - halfWorldX + TILE_SIZE / 2;
        const z = globalZ * TILE_SIZE - halfWorldZ + TILE_SIZE / 2;

        matrix.makeTranslation(x, 2.58, z);
        matrix.multiply(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
        parcelMesh.setMatrixAt(i, matrix);

        if (parcel.status === 'sold') baseColor.set(0xdc2626);
        else if (parcel.status === 'reserved') baseColor.set(0xffc857);
        else if (parcel.status === 'available') baseColor.set(0x2ee6a6);
        else baseColor.set(0x8ea0b8);

        const color = baseColor.clone();
        parcelBaseColors[i] = color;
        parcelMesh.setColorAt(i, color);
      }

      parcelMesh.userData.parcels = allParcels;
      parcelMesh.userData.ads = adMap;
      parcelMesh.instanceMatrix.needsUpdate = true;
      if (parcelMesh.instanceColor) parcelMesh.instanceColor.needsUpdate = true;
      parcelGroup.add(parcelMesh);

      const soldLabelCanvas = document.createElement('canvas');
      soldLabelCanvas.width = 256;
      soldLabelCanvas.height = 64;
      const soldLabelContext = soldLabelCanvas.getContext('2d');
      if (soldLabelContext) {
        soldLabelContext.fillStyle = '#b91c1c';
        soldLabelContext.roundRect(4, 8, 248, 48, 12);
        soldLabelContext.fill();
        soldLabelContext.font = '700 30px Arial';
        soldLabelContext.textAlign = 'center';
        soldLabelContext.textBaseline = 'middle';
        soldLabelContext.fillStyle = '#ffffff';
        soldLabelContext.fillText('SATILDI', 128, 32);
      }
      const soldLabelTexture = new THREE.CanvasTexture(soldLabelCanvas);
      soldLabelTexture.colorSpace = THREE.SRGBColorSpace;
      const soldLabelMaterial = new THREE.SpriteMaterial({
        map: soldLabelTexture,
        transparent: true,
        depthWrite: false,
        depthTest: false,
      });
      const adGroup = new THREE.Group();
      parcelGroup.add(adGroup);

      for (let i = 0; i < allParcels.length; i += 1) {
        const parcel = allParcels[i];
        if (parcel.grid_x == null || parcel.grid_y == null) continue;
        const x = parcel.grid_x * TILE_SIZE - halfWorldX + TILE_SIZE / 2;
        const z = parcel.grid_y * TILE_SIZE - halfWorldZ + TILE_SIZE / 2;

        if (parcel.status === 'sold') {
          const label = new THREE.Sprite(soldLabelMaterial);
          label.position.set(x, 5.2, z);
          label.scale.set(7.2, 1.8, 1);
          label.userData.kind = 'sold-label';
          adGroup.add(label);
        }

        const ad = adMap.get(parcel.id);
        if (ad?.is_active && ad.image_path) {
          const adUrl = getAdUrl(ad);
          loader.load(adUrl, (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            const material = new THREE.SpriteMaterial({
              map: texture,
              transparent: true,
              depthWrite: false,
              depthTest: false,
            });
            const logo = new THREE.Sprite(material);
            logo.position.set(x, 6.8, z);
            logo.scale.set(6.2, 4.2, 1);
            logo.userData.kind = 'parcel-ad-logo';
            adGroup.add(logo);
          });
        }
      }

      setWorldLoading(false);
      setWorldLoaded(allParcels.length);
      setLocationMessage(city.name + ' · 1.000 parsel yüklendi');
    };

    void loadAllWorldData().catch((error) => {
      console.error('Parsel Dünyası yüklenemedi:', error);
      setWorldLoading(false);
      setLocationError(error instanceof Error ? error.message : 'Parsel Dünyası yüklenemedi.');
      setLocationMessage('Konum/parsel yükleme işlemi tamamlanamadı.');
    });

    const onSelectPointerDown = (event: PointerEvent) => {
      pointerDownX = event.clientX;
      pointerDownY = event.clientY;
    };

    const onSelectPointerUp = (event: PointerEvent) => {
      if (!parcelMesh) return;
      if (dragMoved || Math.hypot(event.clientX - pointerDownX, event.clientY - pointerDownY) > 8) {
        dragMoved = false;
        return;
      }

      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObject(parcelMesh, false)[0];
      if (hit?.instanceId == null) return;

      const parcels = parcelMesh.userData.parcels as RealSkyParcel[] | undefined;
      const parcel = parcels?.[hit.instanceId];
      if (parcel) setSelectedParcel(parcel);
      dragMoved = false;
    };

    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('pointercancel', onPointerUp);
    renderer.domElement.addEventListener('pointerdown', onSelectPointerDown);
    renderer.domElement.addEventListener('pointerup', onSelectPointerUp);

    const resize = () => {
      const width = Math.max(mount.clientWidth, 1);
      const height = Math.max(mount.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', resize);
    resize();

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);

      if (!dragging && pointers.size === 0 && (Math.abs(velocityX) > inertiaStop || Math.abs(velocityZ) > inertiaStop)) {
        const nextX = THREE.MathUtils.clamp(panX + velocityX, -maxPanX, maxPanX);
        const nextZ = THREE.MathUtils.clamp(panZ + velocityZ, -maxPanZ, maxPanZ);
        if (nextX === -maxPanX || nextX === maxPanX) velocityX = 0;
        if (nextZ === -maxPanZ || nextZ === maxPanZ) velocityZ = 0;
        applyPan(nextX, nextZ);
        velocityX *= friction;
        velocityZ *= friction;
        if (Math.abs(velocityX) <= inertiaStop) velocityX = 0;
        if (Math.abs(velocityZ) <= inertiaStop) velocityZ = 0;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      renderer.domElement.removeEventListener('wheel', onWheel);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointercancel', onPointerUp);
      renderer.domElement.removeEventListener('pointerdown', onSelectPointerDown);
      renderer.domElement.removeEventListener('pointerup', onSelectPointerUp);
      window.removeEventListener('resize', resize);

      skyTexture.dispose();
      skyGeometry.dispose();
      skyMaterial.dispose();
      if (parcelMesh) {
        parcelMesh.geometry.dispose();
        (parcelMesh.material as THREE.Material).dispose();
      }
      soldLabelTexture.dispose();
      soldLabelMaterial.dispose();
      parcelGroup.traverse((object) => {
        if (object instanceof THREE.Sprite) {
          const material = object.material as THREE.SpriteMaterial;
          if (material !== soldLabelMaterial) {
            material.map?.dispose();
            material.dispose();
          }
        }
        if (object instanceof THREE.LineSegments && object.geometry !== skyGeometry) {
          object.geometry.dispose();
          (object.material as THREE.Material).dispose();
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <main className="gokyuzu-page">
      <div
        ref={mountRef}
        className="gokyuzu-canvas"
        aria-label="Konuma göre bulunduğunuz ilin 1.000 gerçek gökyüzü parselinden oluşan sürüklenebilir parsel dünyası"
      />

      <header className="gokyuzu-header">
        <div>
          <div className="gokyuzu-kicker">MYSKYPARCEL · PARSEL DÜNYASI</div>
          <h1>Gökyüzü</h1>
          <p>
            {detectedCity ? detectedCity + ' ilindeki 1.000 gerçek gökyüzü parselini keşfet.' : 'Konumunuza göre yalnızca bulunduğunuz ilin 1.000 gerçek gökyüzü parseli yüklenir.'}
            Açılışta bu ilin parselleri doğrudan yüklenir; sürüklediğinde yeni veri beklemezsin.
          </p>
        </div>

        <div className="gokyuzu-badge">
          <span className="sun-dot" />
          <span>{worldLoading ? worldLoaded.toLocaleString('tr-TR') + ' / ' + REAL_PARCELS_PER_CITY.toLocaleString('tr-TR') + ' YÜKLENİYOR' : detectedCity ? detectedCity.toLocaleUpperCase('tr-TR') + ' · ' + REAL_PARCELS_PER_CITY.toLocaleString('tr-TR') + ' GERÇEK PARSEL' : locationMessage}</span>
        </div>
      </header>

      {locationError && !worldLoading && (
        <div className="gokyuzu-loading" role="alert">
          <strong>Konum alınamadı</strong>
          <span>{locationError}</span>
        </div>
      )}

      {worldLoading && (
        <div className="gokyuzu-loading" role="status">
          <strong>Parsel Dünyası hazırlanıyor</strong>
          <span>{locationMessage} {worldLoaded > 0 ? '· ' + worldLoaded.toLocaleString('tr-TR') + ' / ' + REAL_PARCELS_PER_CITY.toLocaleString('tr-TR') : ''}</span>
        </div>
      )}

      <div className="gokyuzu-controls">
        <span>👆 Parmağınla sürükle</span>
        <span>🖱️ Fareyle sürükle</span>
        <span>↕️ Yakınlaştır / uzaklaştır</span>
        <span>▦ {detectedCity ? detectedCity + ' · 1.000 parsel' : 'Konuma göre 1.000 parsel'}</span>
      </div>

      {selectedParcel && (
        <aside className="gokyuzu-parcel-panel">
          <button className="gokyuzu-parcel-close" onClick={() => setSelectedParcel(null)} aria-label="Parsel panelini kapat">×</button>
          <div className="gokyuzu-parcel-kicker">{selectedParcel.city_name ?? 'Türkiye'} · Katman {selectedParcel.layer_number ?? 1} · Sektör {selectedParcel.sector_number ?? 1}</div>
          <h2>PARSEL #{selectedParcel.parcel_number}</h2>
          <div className="gokyuzu-parcel-meta">
            <span>{selectedParcel.status === 'available' ? 'Satın alınabilir' : selectedParcel.status === 'sold' ? 'Satıldı' : 'Rezerve'}</span>
            {selectedParcel.price != null && <strong>{selectedParcel.price.toLocaleString('tr-TR')} TL</strong>}
          </div>

          {selectedAd && (
            <div className="gokyuzu-ad-card">
              <div className="gokyuzu-ad-label">PARSEL REKLAMI</div>
              <img src={getAdUrl(selectedAd)} alt={selectedAd.title} />
              <strong>{selectedAd.title}</strong>
              {selectedAd.link_url && (
                <a href={selectedAd.link_url} target="_blank" rel="noreferrer">Reklamı ziyaret et</a>
              )}
            </div>
          )}

          {selectedParcel.status === 'available' && (
            <Link to="/parsel-satin-al" search={{ parcels: selectedParcel.id }} className="gokyuzu-buy-button">Bu parseli satın al</Link>
          )}

          {selectedIsOwner && selectedParcel.status === 'sold' && (
            <div className="gokyuzu-ad-editor">
              <div className="gokyuzu-ad-editor-title">Bu parsele reklam ver</div>
              <input
                value={adTitle}
                onChange={(event) => setAdTitle(event.target.value)}
                maxLength={120}
                placeholder="Mağaza / işletme adı"
                aria-label="Reklam başlığı"
              />
              <input
                value={adLink}
                onChange={(event) => setAdLink(event.target.value)}
                maxLength={500}
                placeholder="Web sitesi (isteğe bağlı)"
                aria-label="Reklam bağlantısı"
              />
              <label className="gokyuzu-ad-file">
                <span>{adFile?.name ?? (selectedAd ? 'Yeni görsel seç' : 'Mağaza görseli seç')}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(event) => setAdFile(event.target.files?.[0] ?? null)}
                />
              </label>
              <button type="button" onClick={() => void saveAdvertisement()} disabled={adSaving} className="gokyuzu-ad-save">
                {adSaving ? 'YAYINLANIYOR…' : selectedAd ? 'REKLAMI GÜNCELLE' : 'REKLAMI YAYINLA'}
              </button>
              {selectedAd && (
                <button type="button" onClick={() => void removeAdvertisement()} disabled={adSaving} className="gokyuzu-ad-remove">
                  Reklamı kaldır
                </button>
              )}
              {adMessage && <p className="gokyuzu-ad-message">{adMessage}</p>}
            </div>
          )}
        </aside>
      )}
    </main>
  );
}
