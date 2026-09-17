import { i as __toESM } from "../_runtime.mjs";
import { n as supabaseBrowser } from "./supabaseBrowser-BU58SfZL.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/gokyuzunu-tara-GZmY86jg.mjs
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
* MySkyParcel sky coordinates are anchored to the real parcel latitude/longitude
* and compass bearing. The vertical component is virtual: every parcel receives
* a stable elevation angle above the local horizon so it remains visible in the
* sky instead of being pinned to the ground or to the camera screen.
*/
function skyElevationDegrees(parcel) {
	const layer = Math.max(1, parcel.layer_number ?? 1);
	const sector = Math.max(1, parcel.sector_number ?? 1);
	return Math.min(42, 9 + (layer - 1) * 1.6 + Math.min(sector - 1, 20) * .12);
}
function skyAltitudeMeters(parcel, observer, distance) {
	const elevation = skyElevationDegrees(parcel) * DEG;
	const base = Math.max(120, distance * Math.tan(elevation));
	const layer = Math.max(1, parcel.layer_number ?? 1);
	return (observer.altitude ?? 0) + base + (layer - 1) * 20;
}
function projectSkyParcel(observer, heading, pitch, parcel, viewport, options = {}) {
	const horizontalFov = options.horizontalFov ?? 70;
	const verticalFov = options.verticalFov ?? 55;
	const distance = distanceMeters(observer, parcel);
	const bearing = bearingDegrees(observer, parcel);
	const bearingDelta = normalizeAngle(bearing - heading);
	const elevation = skyElevationDegrees(parcel);
	const altitude = skyAltitudeMeters(parcel, observer, distance);
	const elevationDelta = elevation - pitch;
	return {
		x: viewport.width / 2 + bearingDelta / (horizontalFov / 2) * (viewport.width / 2),
		y: viewport.height / 2 - elevationDelta / (verticalFov / 2) * (viewport.height / 2),
		visible: Math.abs(bearingDelta) <= horizontalFov / 2 && Math.abs(elevationDelta) <= verticalFov / 2,
		distance,
		bearing,
		bearingDelta,
		elevation,
		elevationDelta,
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
	const locationWatchRef = (0, import_react.useRef)(null);
	const [cameraReady, setCameraReady] = (0, import_react.useState)(false);
	const [scanning, setScanning] = (0, import_react.useState)(false);
	const [sensor, setSensor] = (0, import_react.useState)({
		heading: null,
		pitch: null,
		roll: null,
		location: null,
		accuracy: null,
		absolute: false
	});
	const [parcels, setParcels] = (0, import_react.useState)([]);
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [viewport, setViewport] = (0, import_react.useState)({
		width: 1,
		height: 1
	});
	const readLocation = (0, import_react.useCallback)(() => {
		if (!navigator.geolocation) {
			setError("Bu cihaz konum bilgisini desteklemiyor.");
			return;
		}
		navigator.geolocation.getCurrentPosition(({ coords }) => setSensor((current) => ({
			...current,
			location: {
				latitude: coords.latitude,
				longitude: coords.longitude,
				altitude: coords.altitude ?? 0
			},
			accuracy: coords.accuracy
		})), (positionError) => setError(positionError.code === 3 ? "GPS konumu zaman aşımına uğradı. Telefonda Konum/GPS açıkken açık havada tekrar deneyin." : `GPS açılamadı: ${positionError.message}`), {
			enableHighAccuracy: true,
			maximumAge: 1e4,
			timeout: 3e4
		});
	}, []);
	const startScanner = (0, import_react.useCallback)(async () => {
		setError(null);
		try {
			const orientation = window.DeviceOrientationEvent;
			if (typeof orientation.requestPermission === "function") {
				if (await orientation.requestPermission(true) !== "granted") throw new Error("Yön sensörü izni verilmedi. Gerçek konum tabanlı parseller için yön izni gereklidir.");
			}
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
			readLocation();
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "Kamera başlatılamadı.");
		}
	}, [readLocation]);
	(0, import_react.useEffect)(() => {
		if (!scanning) return;
		const onOrientation = (event) => {
			const webkitHeading = event.webkitCompassHeading;
			const heading = typeof webkitHeading === "number" ? webkitHeading : event.absolute && typeof event.alpha === "number" ? (360 - event.alpha) % 360 : null;
			const pitch = typeof event.beta === "number" ? Math.max(-89, Math.min(89, 90 - event.beta)) : null;
			const roll = typeof event.gamma === "number" ? event.gamma : null;
			if (heading != null || pitch != null) setSensor((current) => ({
				...current,
				heading: heading ?? current.heading,
				pitch: pitch ?? current.pitch,
				roll: roll ?? current.roll,
				absolute: current.absolute || Boolean(event.absolute) || typeof webkitHeading === "number"
			}));
		};
		const updateSize = () => {
			const rect = frameRef.current?.getBoundingClientRect();
			if (rect) setViewport({
				width: rect.width,
				height: rect.height
			});
		};
		if (navigator.geolocation) locationWatchRef.current = navigator.geolocation.watchPosition(({ coords }) => setSensor((current) => ({
			...current,
			location: {
				latitude: coords.latitude,
				longitude: coords.longitude,
				altitude: coords.altitude ?? 0
			},
			accuracy: coords.accuracy
		})), (positionError) => {
			if (positionError.code !== 3) setError(`GPS açılamadı: ${positionError.message}`);
		}, {
			enableHighAccuracy: true,
			maximumAge: 1e4,
			timeout: 3e4
		});
		window.addEventListener("deviceorientationabsolute", onOrientation, true);
		window.addEventListener("deviceorientation", onOrientation, true);
		updateSize();
		window.addEventListener("resize", updateSize);
		return () => {
			if (locationWatchRef.current != null) navigator.geolocation.clearWatch(locationWatchRef.current);
			locationWatchRef.current = null;
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
		if (!sensor.location || sensor.heading == null || sensor.pitch == null) return [];
		const raw = parcels.map((parcel) => ({
			parcel,
			projection: projectSkyParcel(sensor.location, sensor.heading, sensor.pitch, parcel, viewport, {
				horizontalFov: 70,
				verticalFov: 55
			})
		})).filter(({ projection }) => projection.visible).sort((a, b) => a.projection.distance - b.projection.distance).slice(0, 40);
		const occupied = [];
		return raw.map((item) => {
			const base = item.projection;
			let x = base.x;
			let y = base.y;
			for (let ring = 0; ring < 5; ring += 1) {
				if (!occupied.some((point) => Math.hypot(point.x - x, point.y - y) < 54)) break;
				const angle = (item.parcel.sector_number ?? item.parcel.grid_x ?? 0) * .9 + ring * 2.1;
				x = base.x + Math.cos(angle) * (26 + ring * 10);
				y = base.y + Math.sin(angle) * (18 + ring * 8);
			}
			occupied.push({
				x,
				y
			});
			return {
				...item,
				displayX: x,
				displayY: y
			};
		});
	}, [
		parcels,
		sensor.location,
		sensor.heading,
		sensor.pitch,
		viewport
	]);
	const sensorReady = sensor.heading != null && sensor.pitch != null;
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
								children: "Kamerayı gökyüzüne doğrult. Gerçek MySkyParcel parselleri GPS, pusula ve telefonun fiziksel eğimine göre gerçek dünya yönünde yerleştirilecek."
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
								" · Pusula ",
								sensor.heading != null ? `${Math.round(sensor.heading)}°` : "bekleniyor",
								" · Eğim ",
								sensor.pitch != null ? `${Math.round(sensor.pitch)}°` : "bekleniyor"
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
					!sensorReady && sensor.location && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							position: "absolute",
							left: 18,
							right: 18,
							top: "50%",
							transform: "translateY(-50%)",
							padding: 16,
							borderRadius: 16,
							background: "rgba(2,6,23,.86)",
							border: "1px solid rgba(255,255,255,.15)",
							textAlign: "center",
							zIndex: 5
						},
						children: "Telefon yönü algılanıyor. Pusulayı açmak için telefonu 8 şeklinde birkaç kez hareket ettir ve kamerayı gökyüzüne doğrult."
					}),
					projected.map(({ parcel, projection, displayX, displayY }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setSelected(parcel),
						style: {
							position: "absolute",
							left: displayX,
							top: displayY,
							transform: `translate(-50%,-50%) scale(${Math.max(.72, Math.min(1.2, 180 / Math.max(projection.distance, 180)))})`,
							transformOrigin: "center",
							border: "1px solid rgba(255,255,255,.55)",
							borderRadius: 12,
							padding: "7px 9px",
							background: parcel.status === "available" ? "rgba(8,47,73,.82)" : "rgba(69,10,10,.82)",
							color: "#fff",
							boxShadow: "0 8px 30px rgba(0,0,0,.35)",
							cursor: "pointer",
							whiteSpace: "nowrap",
							zIndex: 4
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
							style: {
								display: "block",
								fontSize: 12
							},
							children: ["PARSEL #", parcel.parcel_number]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", {
							style: { opacity: .78 },
							children: [
								Math.round(projection.distance),
								" m · ",
								Math.round(projection.elevation),
								"°"
							]
						})]
					}, parcel.id)),
					sensorReady && parcels.length > 0 && projected.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							position: "absolute",
							left: 16,
							right: 16,
							bottom: 18,
							padding: 14,
							borderRadius: 14,
							background: "rgba(2,6,23,.86)",
							textAlign: "center",
							zIndex: 5
						},
						children: "Bu gerçek GPS konumunda parseller mevcut, ancak şu an telefonun baktığı yönde değiller. Telefonu yavaşça sağa-sola çevir."
					}),
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
							background: "rgba(127,29,29,.9)",
							zIndex: 6
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
