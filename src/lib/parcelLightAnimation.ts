type Maps = any;
type Point = { lat: number; lng: number };
type Segment = { a: Point; b: Point; color: string };
type Particle = Segment & { t: number; speed: number; phase: number };

// Keep the effect visually obvious while keeping the cost independent of parcel count.
const MAX_LIGHTS = 12;
const FRAME_INTERVAL = 1000 / 30;

function seededUnit(index: number) {
  const x = Math.sin(index * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Lightweight canvas overlay for the moving parcel lights.
 * It never creates Google Maps markers/polygons and pauses while the map moves.
 */
export function attachParcelLightAnimation(
  maps: Maps,
  map: any,
  getSegments: () => Segment[],
) {
  const OverlayView = maps.OverlayView;
  if (!OverlayView) return { refresh: () => {}, destroy: () => {} };

  class ParcelLightOverlay extends OverlayView {
    canvas: HTMLCanvasElement | null = null;
    ctx: CanvasRenderingContext2D | null = null;
    projection: any = null;
    particles: Particle[] = [];
    raf = 0;
    running = true;
    destroyed = false;
    width = 0;
    height = 0;
    lastTime = 0;
    lastFrame = 0;

    onAdd() {
      const canvas = document.createElement("canvas");
      canvas.style.position = "absolute";
      canvas.style.left = "0";
      canvas.style.top = "0";
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.pointerEvents = "none";
      canvas.style.zIndex = "20";
      canvas.setAttribute("aria-hidden", "true");
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d", { alpha: true });

      // This pane sits above Google Maps polygons but below the map controls.
      const pane = this.getPanes()?.overlayMouseTarget;
      if (pane) pane.appendChild(canvas);

      this.resize();
      this.schedule();
    }

    draw() {
      this.projection = this.getProjection();
      this.resize();
      // During pan/zoom the animation is paused, but redraw immediately so
      // the visible lights stay locked to the moved parcel lines.
      if (!this.running) this.render();
    }

    onRemove() {
      this.stop();
      this.canvas?.remove();
      this.canvas = null;
      this.ctx = null;
      this.projection = null;
      this.destroyed = true;
    }

    resize() {
      if (!this.canvas || !this.ctx) return;
      const host = map.getDiv?.() as HTMLElement | undefined;
      const width = Math.max(1, host?.clientWidth ?? this.canvas.clientWidth);
      const height = Math.max(1, host?.clientHeight ?? this.canvas.clientHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      const pixelWidth = Math.round(width * dpr);
      const pixelHeight = Math.round(height * dpr);
      if (this.canvas.width !== pixelWidth || this.canvas.height !== pixelHeight) {
        this.canvas.width = pixelWidth;
        this.canvas.height = pixelHeight;
        this.width = width;
        this.height = height;
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    }

    refresh() {
      const source = getSegments();
      if (!source.length) {
        this.particles = [];
        this.clear();
        return;
      }

      const count = Math.min(MAX_LIGHTS, source.length);
      const next: Particle[] = [];
      for (let i = 0; i < count; i += 1) {
        // Spread the lights over the available parcel edges instead of using
        // only the first few edges, so they are visible across the whole map.
        const index = Math.min(source.length - 1, Math.floor(((i + 0.37) * source.length) / count));
        const segment = source[index];
        if (!segment) continue;
        next.push({
          a: segment.a,
          b: segment.b,
          color: segment.color,
          // Start at different positions so several lights are visible at once.
          t: (seededUnit(i + source.length * 0.013) + i * 0.071) % 1,
          // About 2.5–4.0 seconds per edge: clearly moving, but not frantic.
          speed: 0.00025 + seededUnit(i + 21) * 0.00015,
          phase: seededUnit(i + 47),
        });
      }
      this.particles = next;
      this.render();
    }

    clear() {
      if (!this.ctx) return;
      this.ctx.clearRect(0, 0, this.width, this.height);
    }

    project(point: Point) {
      if (!this.projection) return null;
      return this.projection.fromLatLngToDivPixel(new maps.LatLng(point.lat, point.lng));
    }

    render() {
      const ctx = this.ctx;
      if (!ctx || !this.projection || !this.particles.length) {
        this.clear();
        return;
      }

      ctx.clearRect(0, 0, this.width, this.height);
      ctx.lineCap = "round";

      for (const particle of this.particles) {
        const a = this.project(particle.a);
        const b = this.project(particle.b);
        if (!a || !b) continue;

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const length = Math.hypot(dx, dy);
        if (length < 6) continue;

        const ux = dx / length;
        const uy = dy / length;
        const px = a.x + dx * particle.t;
        const py = a.y + dy * particle.t;
        const pulse = 0.82 + 0.18 * Math.sin((particle.t + particle.phase) * Math.PI * 2);
        const trailLength = Math.min(34, Math.max(12, length * 0.24));
        const tx = px - ux * trailLength;
        const ty = py - uy * trailLength;

        // Bright colored trail.
        ctx.globalAlpha = 0.88 * pulse;
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(px, py);
        ctx.stroke();

        // White-hot head with a small colored halo. No shadowBlur or
        // compositing is used, keeping this cheap on satellite maps.
        ctx.globalAlpha = 1;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(px, py, 4.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(px, py, 2.1, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    }

    tick = (time: number) => {
      if (this.destroyed) return;
      if (this.running && time - this.lastFrame >= FRAME_INTERVAL) {
        const delta = Math.min(time - (this.lastTime || time), 48);
        for (const particle of this.particles) {
          particle.t += particle.speed * delta;
          if (particle.t > 1) particle.t -= 1;
        }
        this.render();
        this.lastFrame = time;
      }
      this.lastTime = time;
      this.raf = window.requestAnimationFrame(this.tick);
    };

    schedule() {
      if (!this.raf) this.raf = window.requestAnimationFrame(this.tick);
    }

    stop() {
      if (this.raf) window.cancelAnimationFrame(this.raf);
      this.raf = 0;
    }

    setRunning(value: boolean) {
      this.running = value;
      if (value) {
        this.lastTime = 0;
        this.lastFrame = 0;
        this.schedule();
      } else {
        this.render();
      }
    }
  }

  const overlay = new ParcelLightOverlay();
  overlay.setMap(map);
  overlay.refresh();

  const pause = () => overlay.setRunning(false);
  const resume = () => overlay.setRunning(!document.hidden);
  const listeners = [
    map.addListener("dragstart", pause),
    map.addListener("zoom_changed", pause),
    map.addListener("idle", resume),
  ];
  const visibility = () => overlay.setRunning(!document.hidden);
  document.addEventListener("visibilitychange", visibility);

  return {
    refresh: () => overlay.refresh(),
    destroy: () => {
      listeners.forEach((listener: any) => listener?.remove?.());
      document.removeEventListener("visibilitychange", visibility);
      overlay.setMap(null);
    },
  };
}
