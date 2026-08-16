type Maps = any;
type Point = { lat: number; lng: number };
type Segment = { a: Point; b: Point; color: string };
type Particle = Segment & { t: number; speed: number; phase: number };

const MAX_LIGHTS = 18;
const TRAIL_STEPS = 5;

function seededUnit(index: number) {
  const x = Math.sin(index * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Lightweight canvas-only light trails for the parcel grid.
 * It deliberately creates no Google Maps markers/polygons and pauses while
 * the map is being moved/zoomed. Parcel geometry is read only when refresh()
 * is called, so the animation loop never scans the parcel collection.
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

    onAdd() {
      const canvas = document.createElement("canvas");
      canvas.style.position = "absolute";
      canvas.style.left = "0";
      canvas.style.top = "0";
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.pointerEvents = "none";
      canvas.setAttribute("aria-hidden", "true");
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.getPanes()?.overlayLayer.appendChild(canvas);
      this.resize();
      this.schedule();
    }

    draw() {
      this.projection = this.getProjection();
      this.resize();
      this.render();
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
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
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
        const index = Math.floor((i * source.length) / count);
        const segment = source[index];
        next.push({
          ...segment,
          t: seededUnit(i + source.length * 0.013),
          speed: 0.000075 + seededUnit(i + 21) * 0.000055,
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
      ctx.lineJoin = "round";

      for (const particle of this.particles) {
        const a = this.project(particle.a);
        const b = this.project(particle.b);
        if (!a || !b) continue;

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const length = Math.hypot(dx, dy);
        if (length < 2) continue;
        const ux = dx / length;
        const uy = dy / length;
        const px = a.x + dx * particle.t;
        const py = a.y + dy * particle.t;

        const pulse = 0.62 + 0.38 * Math.sin((particle.t + particle.phase) * Math.PI * 2);
        const trailLength = Math.min(28, Math.max(9, length * 0.22));
        const tx = px - ux * trailLength;
        const ty = py - uy * trailLength;

        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = 0.22 * pulse;
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = 3.2;
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 7;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(px, py);
        ctx.stroke();

        ctx.globalAlpha = 0.9 * pulse;
        ctx.lineWidth = 1.2;
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(px, py);
        ctx.stroke();

        ctx.globalAlpha = 0.98 * pulse;
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(px, py, 1.65, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    tick = (time: number) => {
      if (this.destroyed) return;
      if (this.running) {
        for (const particle of this.particles) {
          particle.t += particle.speed * Math.min(time - (this.lastTime || time), 32);
          if (particle.t > 1) particle.t -= 1;
        }
        this.render();
      }
      this.lastTime = time;
      this.raf = window.requestAnimationFrame(this.tick);
    };

    lastTime = 0;

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
        this.schedule();
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
