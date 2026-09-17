import { i as __toESM } from "../_runtime.mjs";
import { n as supabaseBrowser } from "./supabaseBrowser-BU58SfZL.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/gokyuzunu-tara-D58HEjya.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var EARTH_RADIUS_M = 6371e3;
var DEG = Math.PI / 180;
function distanceMeters(a, b) {
	const lat1 = a.latitude * DEG;
	const lat2 = b.latitude * DEG;
	const dLat = (b.latitude - a.latitude) * DEG;
	const dLon = (b.longitude - a.longitude) * DEG;
	const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
	return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}
function bearingDegrees(a, b) {
	const lat1 = a.latitude * DEG;
	const lat2 = b.latitude * DEG;
	const dLon = (b.longitude - a.longitude) * DEG;
	const y = Math.sin(dLon) * Math.cos(lat2);
	const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
	return (Math.atan2(y, x) / DEG + 360) % 360;
}
function normalizeAngle(angle) {
	return (angle + 540) % 360 - 180;
}
/**
* MySkyParcel's virtual sky layer. The DB latitude/longitude define the
* parcel's horizontal world coordinate; altitude is deliberately virtual,
* so parcels are displayed above the real horizon instead of on the ground.
*/
function skyAltitudeMeters(parcel, observerAltitude = 0) {
	const layer = Math.max(1, parcel.layer_number ?? 1);
	const sector = Math.max(1, parcel.sector_number ?? 1);
	return observerAltitude + 120 + (layer - 1) * 30 + Math.min(sector, 12) * 2;
}
function projectSkyParcel(observer, heading, parcel, viewport, options = {}) {
	const horizontalFov = options.horizontalFov ?? 70;
	const verticalFov = options.verticalFov ?? 50;
	const distance = distanceMeters(observer, parcel);
	const bearing = bearingDegrees(observer, parcel);
	const bearingDelta = normalizeAngle(bearing - heading);
	const altitude = skyAltitudeMeters(parcel, observer.altitude ?? 0);
	const elevation = Math.atan2(altitude - (observer.altitude ?? 0), Math.max(distance, 1)) / DEG;
	return {
		x: viewport.width / 2 + bearingDelta / (horizontalFov / 2) * (viewport.width / 2),
		y: viewport.height / 2 - elevation / (verticalFov / 2) * (viewport.height / 2),
		visible: Math.abs(bearingDelta) <= horizontalFov / 2 && Math.abs(elevation) <= verticalFov / 2,
		distance,
		bearing,
		bearingDelta,
		elevation,
		altitude
	};
}
function boundingBox(point, radiusMeters) {
	const latDelta = radiusMeters / 111320;
	const lonDelta = radiusMeters / (111320 * Math.max(Math.cos(point.latitude * DEG), .15));
	return {
		minLat: point.latitude - latDelta,
		maxLat: point.latitude + latDelta,
		minLon: point.longitude - lonDelta,
		maxLon: point.longitude + lonDelta
	};
}
var MAX_RESULTS = 120;
async function loadNearbySkyParcels(latitude, longitude, radiusMeters = 25e3) {
	const box = boundingBox({
		latitude,
		longitude
	}, radiusMeters);
	const { data, error } = await supabaseBrowser.from("parcel_map_public").select("id,parcel_number,status,price,tier,city_name,latitude,longitude,layer_number,sector_number,grid_x,grid_y").not("latitude", "is", null).not("longitude", "is", null).gte("latitude", box.minLat).lte("latitude", box.maxLat).gte("longitude", box.minLon).lte("longitude", box.maxLon).order("parcel_number", { ascending: true }).limit(MAX_RESULTS);
	if (error) throw new Error(`Parseller yüklenemedi: ${error.message}`);
	return data ?? [];
}
function SkyScannerPage() {
	const videoRef = (0, import_react.useRef)(null);
	const frameRef = (0, import_react.useRef)(null);
	const streamRef = (0, import_react.useRef)(null);
	const [cameraReady, setCameraReady] = (0, import_react.useState)(false);
	const [scanning, setScanning] = (0, import_react.useState)(false);
	const [sensor, setSensor] = (0, import_react.useState)({
		heading: null,
		location: null,
		accuracy: null
	});
	const [parcels, setParcels] = (0, import_react.useState)([]);
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [viewport, setViewport] = (0, import_react.useState)({
		width: 1,
		height: 1
	});
	const startScanner = (0, import_react.useCallback)(async () => {
		setError(null);
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: {
					facingMode: { ideal: "environment" },
					width: { ideal: 1920 },
					height: { ideal: 1080 }
				},
				audio: false
			});
			streamRef.current = stream;
			if (videoRef.current) {
				videoRef.current.srcObject = stream;
				await videoRef.current.play();
			}
			setCameraReady(true);
			setScanning(true);
			if (!navigator.geolocation) throw new Error("Bu cihaz konum bilgisini desteklemiyor.");
			navigator.geolocation.getCurrentPosition(({ coords }) => setSensor({
				heading: null,
				location: {
					latitude: coords.latitude,
					longitude: coords.longitude,
					altitude: coords.altitude ?? 0
				},
				accuracy: coords.accuracy
			}), (positionError) => setError(`GPS açılamadı: ${positionError.message}`), {
				enableHighAccuracy: true,
				maximumAge: 2e3,
				timeout: 15e3
			});
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "Kamera başlatılamadı.");
		}
	}, []);
	(0, import_react.useEffect)(() => {
		if (!scanning) return;
		let watchId;
		const onOrientation = (event) => {
			const webkitHeading = event.webkitCompassHeading;
			const heading = typeof webkitHeading === "number" ? webkitHeading : typeof event.alpha === "number" ? (360 - event.alpha) % 360 : null;
			if (heading != null) setSensor((current) => ({
				...current,
				heading
			}));
		};
		const updateSize = () => {
			const rect = frameRef.current?.getBoundingClientRect();
			if (rect) setViewport({
				width: rect.width,
				height: rect.height
			});
		};
		if (navigator.geolocation) watchId = navigator.geolocation.watchPosition(({ coords }) => setSensor((current) => ({
			...current,
			location: {
				latitude: coords.latitude,
				longitude: coords.longitude,
				altitude: coords.altitude ?? 0
			},
			accuracy: coords.accuracy
		})), () => void 0, {
			enableHighAccuracy: true,
			maximumAge: 1500,
			timeout: 1e4
		});
		window.addEventListener("deviceorientationabsolute", onOrientation, true);
		window.addEventListener("deviceorientation", onOrientation, true);
		updateSize();
		window.addEventListener("resize", updateSize);
		return () => {
			if (watchId != null) navigator.geolocation.clearWatch(watchId);
			window.removeEventListener("deviceorientationabsolute", onOrientation, true);
			window.removeEventListener("deviceorientation", onOrientation, true);
			window.removeEventListener("resize", updateSize);
		};
	}, [scanning]);
	(0, import_react.useEffect)(() => {
		if (!sensor.location) return;
		let cancelled = false;
		loadNearbySkyParcels(sensor.location.latitude, sensor.location.longitude, 25e3).then((items) => {
			if (!cancelled) setParcels(items);
		}).catch((cause) => {
			if (!cancelled) setError(cause instanceof Error ? cause.message : "Parseller alınamadı.");
		});
		return () => {
			cancelled = true;
		};
	}, [sensor.location?.latitude, sensor.location?.longitude]);
	(0, import_react.useEffect)(() => () => streamRef.current?.getTracks().forEach((track) => track.stop()), []);
	const projected = (0, import_react.useMemo)(() => {
		if (!sensor.location || sensor.heading == null) return [];
		return parcels.map((parcel) => ({
			parcel,
			projection: projectSkyParcel(sensor.location, sensor.heading, parcel, viewport)
		})).filter(({ projection }) => projection.visible).sort((a, b) => a.projection.distance - b.projection.distance);
	}, [
		parcels,
		sensor.location,
		sensor.heading,
		viewport
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		style: {
			minHeight: "100dvh",
			background: "#020617",
			color: "#fff",
			position: "relative",
			overflow: "hidden"
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			ref: frameRef,
			style: {
				position: "fixed",
				inset: 0
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
					ref: videoRef,
					playsInline: true,
					muted: true,
					autoPlay: true,
					style: {
						position: "absolute",
						inset: 0,
						width: "100%",
						height: "100%",
						objectFit: "cover",
						background: "#020617"
					}
				}),
				!cameraReady && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						position: "absolute",
						inset: 0,
						display: "grid",
						placeItems: "center",
						padding: 24,
						background: "radial-gradient(circle at 50% 30%, #12345d 0, #020617 65%)"
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							maxWidth: 420,
							textAlign: "center"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: 56,
									marginBottom: 12
								},
								children: "☁️"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								style: {
									fontSize: 32,
									margin: 0
								},
								children: "Gökyüzünü Tara"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								style: {
									opacity: .82,
									lineHeight: 1.6
								},
								children: "Kamerayı gökyüzüne doğrult. Gerçek MySkyParcel parselleri konum, yön ve sanal gökyüzü katmanına göre görüntünün içine yerleştirilecek."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: startScanner,
								style: {
									marginTop: 18,
									border: 0,
									borderRadius: 14,
									padding: "14px 22px",
									fontWeight: 800,
									fontSize: 16,
									cursor: "pointer"
								},
								children: "Kamerayı Aç"
							}),
							error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								style: { color: "#fecaca" },
								children: error
							})
						]
					})
				}),
				cameraReady && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							position: "absolute",
							top: 16,
							left: 16,
							right: 16,
							display: "flex",
							gap: 8,
							justifyContent: "space-between",
							pointerEvents: "none"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								padding: "9px 12px",
								borderRadius: 12,
								background: "rgba(2,6,23,.72)",
								backdropFilter: "blur(10px)",
								fontSize: 13
							},
							children: [
								"GPS ",
								sensor.accuracy != null ? `±${Math.round(sensor.accuracy)} m` : "bekleniyor",
								" · Yön ",
								sensor.heading != null ? `${Math.round(sensor.heading)}°` : "bekleniyor"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								padding: "9px 12px",
								borderRadius: 12,
								background: "rgba(2,6,23,.72)",
								backdropFilter: "blur(10px)",
								fontSize: 13
							},
							children: [parcels.length, " gerçek parsel"]
						})]
					}),
					projected.map(({ parcel, projection }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setSelected(parcel),
						style: {
							position: "absolute",
							left: projection.x,
							top: projection.y,
							transform: "translate(-50%,-50%)",
							border: "1px solid rgba(255,255,255,.45)",
							borderRadius: 14,
							padding: "9px 11px",
							background: parcel.status === "available" ? "rgba(8,47,73,.9)" : "rgba(69,10,10,.9)",
							color: "#fff",
							boxShadow: "0 8px 30px rgba(0,0,0,.35)",
							cursor: "pointer",
							whiteSpace: "nowrap"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
							style: { display: "block" },
							children: ["PARSEL #", parcel.parcel_number]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
							Math.round(projection.distance),
							" m · ",
							Math.round(projection.elevation),
							"°"
						] })]
					}, parcel.id)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
						position: "absolute",
						left: "50%",
						top: "50%",
						width: 28,
						height: 28,
						transform: "translate(-50%,-50%)",
						border: "2px solid rgba(255,255,255,.8)",
						borderRadius: "50%",
						pointerEvents: "none"
					} }),
					error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							position: "absolute",
							left: 16,
							right: 16,
							bottom: 18,
							padding: 12,
							borderRadius: 12,
							background: "rgba(127,29,29,.9)"
						},
						children: error
					})
				] })
			]
		}), selected && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			style: {
				position: "fixed",
				left: 16,
				right: 16,
				bottom: 18,
				zIndex: 10,
				padding: 18,
				borderRadius: 18,
				background: "rgba(2,6,23,.94)",
				border: "1px solid rgba(255,255,255,.16)",
				backdropFilter: "blur(16px)"
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setSelected(null),
					style: {
						float: "right",
						background: "transparent",
						color: "#fff",
						border: 0,
						fontSize: 20
					},
					children: "×"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						fontSize: 12,
						opacity: .7
					},
					children: [
						selected.city_name,
						" · Katman ",
						selected.layer_number ?? 1,
						" · Sektör ",
						selected.sector_number ?? 1
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					style: { margin: "6px 0" },
					children: ["PARSEL #", selected.parcel_number]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					style: {
						margin: "4px 0 14px",
						opacity: .8
					},
					children: selected.status === "available" ? "Satın alınabilir" : "Satılmış"
				}),
				selected.status === "available" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/parsel-satin-al",
					search: { parcels: selected.id },
					style: {
						display: "inline-block",
						padding: "12px 16px",
						borderRadius: 12,
						background: "#fff",
						color: "#020617",
						fontWeight: 800,
						textDecoration: "none"
					},
					children: "Bu parseli satın al"
				})
			]
		})]
	});
}
//#endregion
export { SkyScannerPage as component };
