import { useEffect, useRef } from "react";

type Props = { className?: string };

const EARTH_TEXTURE = "/api/earth-assets?type=earth";
const CLOUD_TEXTURE = "/api/earth-assets?type=clouds";
const RADIUS = 1.5;
const MIN_ZOOM = 3;
const MAX_ZOOM = 7;
const DEFAULT_ZOOM = 5.35;

export function MySkyParcelEarthGlobeSafe({ className = "" }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef(DEFAULT_ZOOM);

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    const start = async () => {
      const mount = mountRef.current;
      if (!mount) return;

      const fallback = () => {
        const el = document.createElement("div");
        el.className = "absolute inset-0 grid place-items-center";
        el.innerHTML = '<div style="width:min(62vw,520px);aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 32% 28%,#38bdf8,#0b4776 38%,#031329 72%);box-shadow:0 0 80px rgba(56,189,248,.22),inset -28px -22px 70px rgba(0,0,0,.72)"></div>';
        mount.appendChild(el);
        cleanup = () => el.remove();
      };

      try {
        const test = document.createElement("canvas");
        if (!(test.getContext("webgl") || test.getContext("experimental-webgl"))) throw new Error("WebGL unavailable");

        const THREE = await import("three");
        if (cancelled) return;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        renderer.setClearColor(0, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.domElement.style.cssText = "position:absolute;inset:0;display:block;width:100%;height:100%;max-width:100%;max-height:100%;touch-action:none;pointer-events:auto;user-select:none;-webkit-user-select:none;-webkit-user-drag:none;cursor:grab";
        mount.style.pointerEvents = "auto";
        mount.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(35, 1, 0.05, 100);
        camera.position.set(0, 0.35, zoomRef.current);
        scene.add(new THREE.AmbientLight(0x6e88ad, 0.34));
        const sun = new THREE.DirectionalLight(0xffffff, 2.8);
        sun.position.set(5, 3, 5);
        scene.add(sun);
        const fill = new THREE.DirectionalLight(0x3c6da8, 0.45);
        fill.position.set(-4, -2, -3);
        scene.add(fill);

        const loader = new THREE.TextureLoader();
        const earthTexture = loader.load(EARTH_TEXTURE);
        earthTexture.colorSpace = THREE.SRGBColorSpace;
        earthTexture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
        const cloudTexture = loader.load(CLOUD_TEXTURE);
        cloudTexture.colorSpace = THREE.SRGBColorSpace;
        cloudTexture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 2);

        const mobile = window.matchMedia("(max-width:767px)").matches ? 0.7 : 1;
        const radius = RADIUS * mobile;

        const earthGeometry = new THREE.SphereGeometry(radius, 128, 128);
        const earthMaterial = new THREE.MeshPhongMaterial({ map: earthTexture, shininess: 10, specular: new THREE.Color(0x28476a) });
        const earth = new THREE.Mesh(earthGeometry, earthMaterial);
        scene.add(earth);

        const cloudGeometry = new THREE.SphereGeometry(radius * 1.014, 96, 96);
        const cloudMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, alphaMap: cloudTexture, transparent: true, opacity: 0.43, depthWrite: false });
        const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
        scene.add(clouds);

        const atmosphereGeometry = new THREE.SphereGeometry(radius * 1.09, 96, 96);
        const atmosphereMaterial = new THREE.ShaderMaterial({
          uniforms: { glowColor: { value: new THREE.Color(0x536b80) }, glowPower: { value: 2.9 }, glowStrength: { value: 0.34 } },
          vertexShader: `varying vec3 vWorldNormal; varying vec3 vWorldPosition; void main(){vec4 worldPosition=modelMatrix*vec4(position,1.0);vWorldPosition=worldPosition.xyz;vWorldNormal=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*worldPosition;}`,
          fragmentShader: `uniform vec3 glowColor; uniform float glowPower; uniform float glowStrength; varying vec3 vWorldNormal; varying vec3 vWorldPosition; void main(){vec3 viewDirection=normalize(cameraPosition-vWorldPosition);float fresnel=pow(1.0-max(dot(vWorldNormal,viewDirection),0.0),glowPower);gl_FragColor=vec4(glowColor,fresnel*glowStrength);}`,
          side: THREE.BackSide,
          blending: THREE.AdditiveBlending,
          transparent: true,
          depthWrite: false,
        });
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        scene.add(atmosphere);

        const createStarField = () => {
          const count = 4200;
          const positions = new Float32Array(count * 3);
          const sizes = new Float32Array(count);
          const phases = new Float32Array(count);
          const colors = new Float32Array(count * 3);
          const palette = [new THREE.Color(0xffffff), new THREE.Color(0xbfd8ff), new THREE.Color(0xfff0c2), new THREE.Color(0xd7e7ff)];
          for (let i = 0; i < count; i++) {
            const distance = 12 + Math.random() * 29;
            const theta = Math.random() * Math.PI * 2;
            const z = Math.random() * 2 - 1;
            const xy = Math.sqrt(1 - z * z);
            positions[i * 3] = distance * xy * Math.cos(theta);
            positions[i * 3 + 1] = distance * z;
            positions[i * 3 + 2] = distance * xy * Math.sin(theta);
            sizes[i] = 0.025 + Math.pow(Math.random(), 2.8) * 0.085;
            phases[i] = Math.random() * Math.PI * 2;
            const color = palette[Math.floor(Math.random() * palette.length)];
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
          }
          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
          geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
          geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
          geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
          const material = new THREE.ShaderMaterial({
            uniforms: { uTime: { value: 0 } },
            vertexShader: `attribute float aSize; attribute float aPhase; attribute vec3 aColor; varying vec3 vColor; varying float vTwinkle; uniform float uTime; void main(){vColor=aColor;vTwinkle=0.72+0.28*sin(uTime*(0.55+aPhase*0.08)+aPhase);vec4 mvPosition=modelViewMatrix*vec4(position,1.0);gl_PointSize=aSize*92.0*vTwinkle/max(1.0,-mvPosition.z*0.035);gl_Position=projectionMatrix*mvPosition;}`,
            fragmentShader: `varying vec3 vColor; varying float vTwinkle; void main(){vec2 uv=gl_PointCoord-0.5;float d=length(uv);float core=smoothstep(0.16,0.0,d);float glow=smoothstep(0.5,0.05,d);float alpha=(core*0.95+glow*0.38)*vTwinkle;if(alpha<0.01)discard;gl_FragColor=vec4(vColor,alpha);}`,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          });
          const points = new THREE.Points(geometry, material);
          scene.add(points);
          return { geometry, material, points };
        };

        const createMilkyWay = () => {
          const count = 3200;
          const positions = new Float32Array(count * 3);
          const sizes = new Float32Array(count);
          const phases = new Float32Array(count);
          const colors = new Float32Array(count * 3);
          const colorA = new THREE.Color(0xc8dcff);
          const colorB = new THREE.Color(0xffe5c4);
          for (let i = 0; i < count; i++) {
            const radiusDistance = 15 + Math.random() * 17;
            const angle = Math.random() * Math.PI * 2;
            const band = (Math.random() - 0.5) * 4.2;
            const arm = Math.sin(angle * 3.0) * 0.8 + Math.sin(angle * 7.0) * 0.35;
            positions[i * 3] = Math.cos(angle) * radiusDistance;
            positions[i * 3 + 1] = band + arm * 0.22;
            positions[i * 3 + 2] = Math.sin(angle) * radiusDistance;
            sizes[i] = 0.018 + Math.random() * 0.045;
            phases[i] = Math.random() * Math.PI * 2;
            const mixed = colorA.clone().lerp(colorB, Math.random());
            colors[i * 3] = mixed.r;
            colors[i * 3 + 1] = mixed.g;
            colors[i * 3 + 2] = mixed.b;
          }
          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
          geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
          geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
          geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
          const material = new THREE.ShaderMaterial({
            uniforms: { uTime: { value: 0 } },
            vertexShader: `attribute float aSize; attribute float aPhase; attribute vec3 aColor; varying vec3 vColor; varying float vTwinkle; uniform float uTime; void main(){vColor=aColor;vTwinkle=0.68+0.22*sin(uTime*0.45+aPhase);vec4 mvPosition=modelViewMatrix*vec4(position,1.0);gl_PointSize=aSize*82.0*vTwinkle/max(1.0,-mvPosition.z*0.035);gl_Position=projectionMatrix*mvPosition;}`,
            fragmentShader: `varying vec3 vColor; varying float vTwinkle; void main(){vec2 uv=gl_PointCoord-0.5;float d=length(uv);float alpha=smoothstep(0.5,0.02,d)*0.18*vTwinkle;if(alpha<0.005)discard;gl_FragColor=vec4(vColor,alpha);}`,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          });
          const points = new THREE.Points(geometry, material);
          points.rotation.z = 0.28;
          scene.add(points);
          return { geometry, material, points };
        };

        const stars = createStarField();
        const milkyWay = createMilkyWay();
        const pointers = new Map<number, { x: number; y: number }>();
        let frame = 0;
        let dragging = false;
        let lastX = 0;
        let lastY = 0;
        let pinch: number | null = null;

        const syncStarsToEarth = () => stars.points.rotation.copy(earth.rotation);
        const setZoom = (z: number) => { zoomRef.current = THREE.MathUtils.clamp(z, MIN_ZOOM, MAX_ZOOM); camera.position.z = zoomRef.current; };
        const wheel = (event: WheelEvent) => { event.preventDefault(); event.stopPropagation(); setZoom(camera.position.z + THREE.MathUtils.clamp(event.deltaY, -160, 160) * 0.008); };
        const down = (event: PointerEvent) => {
          event.preventDefault();
          pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
          try { renderer.domElement.setPointerCapture(event.pointerId); } catch { /* pointer capture unavailable */ }
          if (pointers.size === 2) {
            const [a, b] = [...pointers.values()];
            pinch = Math.max(1, Math.hypot(a.x - b.x, a.y - b.y));
            dragging = false;
            return;
          }
          dragging = true;
          lastX = event.clientX;
          lastY = event.clientY;
          renderer.domElement.style.cursor = "grabbing";
        };
        const move = (event: PointerEvent) => {
          if (!pointers.has(event.pointerId)) return;
          event.preventDefault();
          const previous = pointers.get(event.pointerId)!;
          pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
          if (pointers.size === 2 && pinch) {
            const [a, b] = [...pointers.values()];
            const distance = Math.max(1, Math.hypot(a.x - b.x, a.y - b.y));
            setZoom(camera.position.z / (distance / pinch));
            pinch = distance;
            return;
          }
          if (!dragging) return;
          const dx = event.clientX - previous.x;
          const dy = event.clientY - previous.y;
          lastX = event.clientX;
          lastY = event.clientY;
          earth.rotation.y += dx * 0.008;
          earth.rotation.x = THREE.MathUtils.clamp(earth.rotation.x + dy * 0.005, -1.15, 1.15);
          clouds.rotation.y += dx * 0.003;
          clouds.rotation.x += dy * 0.0016;
          syncStarsToEarth();
        };
        const up = (event: PointerEvent) => {
          pointers.delete(event.pointerId);
          if (pointers.size < 2) pinch = null;
          dragging = pointers.size === 1;
          if (dragging) {
            const remaining = [...pointers.values()][0];
            lastX = remaining.x;
            lastY = remaining.y;
          }
          renderer.domElement.style.cursor = dragging ? "grabbing" : "grab";
          try { renderer.domElement.releasePointerCapture(event.pointerId); } catch { /* already released */ }
        };

        const resize = () => { const width = Math.max(1, Math.floor(mount.clientWidth)); const height = Math.max(1, Math.floor(mount.clientHeight)); camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height, false); };
        let lastWidth = 0; let lastHeight = 0;
        const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => { const width = Math.floor(mount.clientWidth); const height = Math.floor(mount.clientHeight); if (width === lastWidth && height === lastHeight) return; lastWidth = width; lastHeight = height; resize(); }) : undefined;
        resizeObserver?.observe(mount); window.addEventListener("resize", resize); resize();
        renderer.domElement.addEventListener("wheel", wheel, { passive: false });
        renderer.domElement.addEventListener("pointerdown", down, { passive: false });
        renderer.domElement.addEventListener("pointermove", move, { passive: false });
        renderer.domElement.addEventListener("pointerup", up);
        renderer.domElement.addEventListener("pointercancel", up);
        renderer.domElement.addEventListener("lostpointercapture", up);

        const clock = new THREE.Clock();
        const animate = () => {
          if (cancelled) return;
          frame = requestAnimationFrame(animate);
          const delta = clock.getDelta(); const elapsed = clock.elapsedTime;
          if (!dragging && !pointers.size) { earth.rotation.y += delta * 0.018; clouds.rotation.y += delta * 0.004; syncStarsToEarth(); }
          stars.material.uniforms.uTime.value = elapsed;
          milkyWay.material.uniforms.uTime.value = elapsed * 0.7;
          milkyWay.points.rotation.y += delta * 0.0007;
          renderer.render(scene, camera);
        };
        animate();

        cleanup = () => {
          cancelled = true; cancelAnimationFrame(frame); resizeObserver?.disconnect(); window.removeEventListener("resize", resize);
          renderer.domElement.removeEventListener("wheel", wheel); renderer.domElement.removeEventListener("pointerdown", down); renderer.domElement.removeEventListener("pointermove", move); renderer.domElement.removeEventListener("pointerup", up); renderer.domElement.removeEventListener("pointercancel", up); renderer.domElement.removeEventListener("lostpointercapture", up);
          earthTexture.dispose(); cloudTexture.dispose(); earthGeometry.dispose(); earthMaterial.dispose(); cloudGeometry.dispose(); cloudMaterial.dispose(); atmosphereGeometry.dispose(); atmosphereMaterial.dispose(); stars.geometry.dispose(); stars.material.dispose(); milkyWay.geometry.dispose(); milkyWay.material.dispose(); renderer.dispose(); renderer.domElement.remove();
        };
      } catch (error) {
        console.error("MySkyParcel globe fallback", error);
        fallback();
      }
    };

    void start();
    return () => { cancelled = true; cleanup?.(); };
  }, []);

  return (
    <div className={`relative z-0 h-[560px] w-full min-w-0 max-w-full overflow-hidden rounded-3xl border border-sky-200/15 bg-background shadow-2xl shadow-black/40 ${className}`}>
      <div ref={mountRef} className="absolute inset-0 z-0 min-h-0 min-w-0 max-w-full overflow-hidden pointer-events-auto" aria-label="MySkyParcel gerçek 3D Dünya küresi" />
      <div className="pointer-events-none absolute inset-0 z-10" />
      <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-[10px] text-white/60 backdrop-blur-md">Sürükle: döndür · iki parmak: yakınlaştır · fare tekerleği: zoom</div>
    </div>
  );
}
