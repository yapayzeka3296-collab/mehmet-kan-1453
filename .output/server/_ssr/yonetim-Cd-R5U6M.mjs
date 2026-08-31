import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as useAuth, s as supabaseBrowser } from "./router-Db-WtvAA.mjs";
import { A as LogOut, K as FileText, T as PackageCheck, b as RefreshCw, ct as Boxes, et as CreditCard, g as ShieldAlert, h as ShieldCheck, lt as Bell, n as X, nt as ClipboardList, r as Users, rt as CircleX, ut as Award, y as Search } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/yonetim-Cd-R5U6M.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminCertificateOverride({ rows: externalRows, onRefresh: externalRefresh }) {
	const [rows, setRows] = (0, import_react.useState)(externalRows ?? []);
	const [physicalRows, setPhysicalRows] = (0, import_react.useState)([]);
	const [message, setMessage] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(null);
	const [openAddress, setOpenAddress] = (0, import_react.useState)(null);
	async function loadRows() {
		if (!supabaseBrowser) return;
		const { data, error: rpcError } = await supabaseBrowser.rpc("admin_list_certificates", {
			p_limit: 100,
			p_offset: 0
		});
		if (rpcError) setError(rpcError.message);
		else setRows(data ?? []);
		const { data: physical, error: physicalError } = await supabaseBrowser.rpc("admin_list_physical_certificate_requests", {
			p_limit: 100,
			p_offset: 0
		});
		if (physicalError) setError(physicalError.message);
		else setPhysicalRows(physical ?? []);
	}
	(0, import_react.useEffect)(() => {
		if (externalRows) {
			setRows(externalRows);
			loadPhysical();
		} else loadRows();
	}, [externalRows]);
	async function loadPhysical() {
		if (!supabaseBrowser) return;
		const { data, error: rpcError } = await supabaseBrowser.rpc("admin_list_physical_certificate_requests", {
			p_limit: 100,
			p_offset: 0
		});
		if (rpcError) setError(rpcError.message);
		else setPhysicalRows(data ?? []);
	}
	async function refresh() {
		if (externalRefresh) await externalRefresh();
		await loadPhysical();
		if (!externalRefresh) await loadRows();
	}
	async function updateCertificate(id, action) {
		if (!supabaseBrowser) return;
		const needsReason = action === "reject" || action === "revoke";
		const reason = needsReason ? window.prompt("Gerekçe (isteğe bağlı):") : null;
		if (needsReason && reason === null) return;
		setBusy(`${action}:${id}`);
		setMessage(null);
		setError(null);
		const { error: rpcError } = await supabaseBrowser.rpc("admin_update_certificate", {
			p_certificate_id: id,
			p_action: action,
			p_reason: reason
		});
		setBusy(null);
		if (rpcError) setError(rpcError.message);
		else {
			setMessage(action === "approve" ? "Sertifika talebi onaylandı." : action === "reject" ? "Sertifika talebi reddedildi." : "Sertifika iptal edildi.");
			await refresh();
		}
	}
	async function updatePhysical(id, status) {
		if (!supabaseBrowser) return;
		let company = null;
		let tracking = null;
		let reason = null;
		if (status === "shipped") {
			company = window.prompt("Kargo firması:")?.trim() || null;
			tracking = window.prompt("Takip numarası:")?.trim() || null;
		}
		if (status === "rejected") reason = window.prompt("Red gerekçesi (isteğe bağlı):")?.trim() || null;
		setBusy(`physical:${id}`);
		setMessage(null);
		setError(null);
		const { error: rpcError } = await supabaseBrowser.rpc("admin_update_physical_certificate_request", {
			p_request_id: id,
			p_status: status,
			p_shipping_company: company,
			p_tracking_number: tracking,
			p_rejection_reason: reason
		});
		setBusy(null);
		if (rpcError) setError(rpcError.message);
		else {
			setMessage("Fiziksel sertifika talebi güncellendi.");
			await loadPhysical();
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "mt-0.5 h-5 w-5 shrink-0 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-semibold",
						children: "Sertifika kayıtları"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: "Yeni sertifikalar kullanıcı tarafından oluşturulur; admin onayı gerekmez."
					})] })]
				}),
				message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 rounded-md border border-green-500/30 bg-green-500/5 p-3 text-sm",
					children: message
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					role: "alert",
					className: "mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive",
					children: error
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 overflow-auto rounded-md border border-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full min-w-[900px] text-left text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-3",
									children: "Durum"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-3",
									children: "Parsel"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-3",
									children: "Kullanıcı"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-3",
									children: "Tier"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-3",
									children: "Sertifika No"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-3",
									children: "İşlem"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((row) => {
							const status = row.status;
							const id = row.id;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b border-border/50 align-top",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "p-3 font-medium",
										children: status ?? "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "p-3",
										children: row.parcel_id ?? "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "p-3",
										children: row.user_id ?? "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "p-3",
										children: row.tier ?? "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "p-3",
										children: row.certificate_number ?? "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "p-3",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex flex-wrap gap-2",
											children: status === "issued" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												disabled: busy !== null,
												onClick: () => void updateCertificate(id, "revoke"),
												className: "inline-flex items-center gap-1 rounded-md border border-destructive/40 px-3 py-1.5 text-destructive disabled:opacity-50",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "h-3.5 w-3.5" }), "İptal Et"]
											})
										})
									})
								]
							}, id);
						}) })]
					})
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel p-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackageCheck, { className: "mt-0.5 h-5 w-5 shrink-0 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-semibold",
					children: "Fiziksel sertifika gönderimleri"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-muted-foreground",
					children: "Yalnızca Elit ve Premium kullanıcıların fiziksel sertifika talepleri burada görünür."
				})] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 overflow-auto rounded-md border border-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[1100px] text-left text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-3",
								children: "Durum"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-3",
								children: "Parsel"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-3",
								children: "Tier"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-3",
								children: "Adres"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-3",
								children: "Kargo"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-3",
								children: "İşlem"
							})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: physicalRows.map((row) => {
						const address = [
							row.shipping_full_name,
							row.shipping_phone,
							row.shipping_address_line,
							row.shipping_district,
							row.shipping_city,
							row.shipping_postal_code
						].filter(Boolean).join(", ");
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border/50 align-top",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "p-3 font-medium",
									children: row.status
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "p-3",
									children: row.parcel_id
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "p-3",
									children: row.tier
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "p-3 max-w-[360px]",
									children: address
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "p-3",
									children: [row.shipping_company || "—", row.tracking_number ? ` · ${row.tracking_number}` : ""]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "p-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap gap-2",
										children: [
											row.status === "requested" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												disabled: busy !== null,
												onClick: () => void updatePhysical(row.id, "processing"),
												className: "inline-flex items-center gap-1 rounded-md border border-gold/40 px-3 py-1.5 text-gold disabled:opacity-50",
												children: "İşleme Al"
											}),
											row.status === "processing" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												disabled: busy !== null,
												onClick: () => void updatePhysical(row.id, "shipped"),
												className: "inline-flex items-center gap-1 rounded-md border border-gold/40 px-3 py-1.5 text-gold disabled:opacity-50",
												children: "Kargoya Ver"
											}),
											row.status === "shipped" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												disabled: busy !== null,
												onClick: () => void updatePhysical(row.id, "delivered"),
												className: "inline-flex items-center gap-1 rounded-md border border-green-500/40 px-3 py-1.5 text-green-400 disabled:opacity-50",
												children: "Teslim Edildi"
											}),
											["requested", "processing"].includes(row.status) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												disabled: busy !== null,
												onClick: () => void updatePhysical(row.id, "rejected"),
												className: "inline-flex items-center gap-1 rounded-md border border-destructive/40 px-3 py-1.5 text-destructive disabled:opacity-50",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "h-3.5 w-3.5" }), "Reddet"]
											})
										]
									})
								})
							]
						}, row.id);
					}) })]
				})
			})]
		})]
	});
}
function Admin() {
	const navigate = useNavigate();
	const { signOut } = useAuth();
	const [authorized, setAuthorized] = (0, import_react.useState)(false);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [module, setModule] = (0, import_react.useState)("dashboard");
	const [stats, setStats] = (0, import_react.useState)(null);
	const [rows, setRows] = (0, import_react.useState)([]);
	const [name, setName] = (0, import_react.useState)("Yönetici");
	const [error, setError] = (0, import_react.useState)("");
	const [dashboardRefreshKey, setDashboardRefreshKey] = (0, import_react.useState)(0);
	async function guard() {
		if (!supabaseBrowser) {
			await navigate({ to: "/giris" });
			return false;
		}
		const { data, error } = await supabaseBrowser.auth.getUser();
		if (error || !data.user) {
			await navigate({ to: "/giris" });
			return false;
		}
		const { data: profile } = await supabaseBrowser.from("profiles").select("full_name,role").eq("id", data.user.id).maybeSingle();
		if (profile?.role !== "admin") {
			await navigate({ to: "/ana-sayfa" });
			return false;
		}
		setName(profile.full_name?.trim() || "Yönetici");
		setAuthorized(true);
		return true;
	}
	async function load() {
		setError("");
		if (!await guard()) {
			setLoading(false);
			return;
		}
		if (!supabaseBrowser) return;
		setLoading(true);
		if (module === "dashboard") {
			const { data, error } = await supabaseBrowser.rpc("admin_dashboard_stats");
			if (error) setError(error.message);
			else setStats(data);
		} else {
			const rpc = {
				users: "admin_list_users",
				parcels: "admin_list_parcels",
				orders: "admin_list_orders",
				payments: "admin_list_payments",
				certificates: "admin_list_certificates",
				audit: "admin_list_audit"
			}[module];
			const { data, error } = await supabaseBrowser.rpc(rpc, {
				p_limit: 100,
				p_offset: 0
			});
			if (error) setError(error.message);
			else setRows(data ?? []);
		}
		setDashboardRefreshKey((current) => current + 1);
		setLoading(false);
	}
	(0, import_react.useEffect)(() => {
		load();
		const sub = supabaseBrowser?.auth.onAuthStateChange((e) => {
			if (e === "SIGNED_OUT") navigate({ to: "/ana-sayfa" });
		});
		return () => sub?.data.subscription.unsubscribe();
	}, [module]);
	async function logout() {
		setError("");
		const result = await signOut();
		if (!result.success) {
			setError(result.error);
			return;
		}
		await navigate({ to: "/ana-sayfa" });
	}
	async function call(name, args) {
		if (!supabaseBrowser) return;
		setError("");
		const { error } = await supabaseBrowser.rpc(name, args);
		if (error) setError(error.message);
		else await load();
	}
	if (loading && !authorized) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-screen place-items-center bg-background text-sm text-muted-foreground",
		children: "Admin yetkisi doğrulanıyor..."
	});
	if (!authorized) return null;
	const menu = [
		{
			id: "dashboard",
			label: "Dashboard",
			icon: ShieldCheck
		},
		{
			id: "users",
			label: "Kullanıcılar",
			icon: Users
		},
		{
			id: "parcels",
			label: "Parseller",
			icon: Boxes
		},
		{
			id: "orders",
			label: "Siparişler",
			icon: ClipboardList
		},
		{
			id: "payments",
			label: "Ödemeler",
			icon: CreditCard
		},
		{
			id: "certificates",
			label: "Sertifikalar",
			icon: Award
		},
		{
			id: "audit",
			label: "Audit Günlüğü",
			icon: FileText
		}
	];
	const title = menu.find((m) => m.id === module)?.label ?? "Dashboard";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background lg:grid lg:grid-cols-[250px_1fr]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "border-r border-border bg-navy-deep p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 px-2 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-7 w-7 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "font-display font-bold",
						children: ["MySky", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-gold",
							children: "Parcel"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[8px] tracking-[0.25em] text-muted-foreground",
						children: "YÖNETİM PANELİ"
					})] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 rounded-lg border border-gold/30 p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-sm font-medium",
						children: name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-gold",
						children: "ADMIN"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "mt-5 space-y-1",
					children: menu.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setModule(m.id),
						className: `flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm ${module === m.id ? "bg-accent text-gold" : "text-foreground/80 hover:bg-accent"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(m.icon, { className: "h-4 w-4" }), m.label]
					}, m.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => void logout(),
					className: "mt-6 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm hover:bg-accent",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-4 w-4" }), "Çıkış Yap"]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center justify-between border-b border-border px-4 py-4 lg:px-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					disabled: loading,
					onClick: () => void load(),
					className: "flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs hover:border-gold disabled:cursor-wait disabled:opacity-60",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `h-4 w-4 ${loading ? "animate-spin" : ""}` }), "Yenile"]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-6 p-4 lg:p-6",
				children: [error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					role: "alert",
					className: "rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive",
					children: error
				}), module === "dashboard" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dashboard, {
					stats,
					refreshToken: dashboardRefreshKey
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModuleView, {
					module,
					rows,
					onCall: call
				})]
			})]
		})]
	});
}
function Dashboard({ stats, refreshToken }) {
	const [notifications, setNotifications] = (0, import_react.useState)([]);
	const [notificationLoading, setNotificationLoading] = (0, import_react.useState)(true);
	const [deletingNotification, setDeletingNotification] = (0, import_react.useState)(null);
	async function loadNotifications() {
		if (!supabaseBrowser) {
			setNotificationLoading(false);
			return;
		}
		const { data, error } = await supabaseBrowser.from("admin_notifications").select("id,type,title,message,is_read,created_at,metadata").order("created_at", { ascending: false }).limit(20);
		if (error) console.error("Admin notifications load failed", error);
		setNotifications(data ?? []);
		setNotificationLoading(false);
	}
	(0, import_react.useEffect)(() => {
		setNotificationLoading(true);
		loadNotifications();
	}, [refreshToken]);
	(0, import_react.useEffect)(() => {
		if (!supabaseBrowser) return;
		const channel = supabaseBrowser.channel("admin-notifications-live").on("postgres_changes", {
			event: "INSERT",
			schema: "public",
			table: "admin_notifications"
		}, (payload) => {
			setNotifications((current) => [payload.new, ...current.filter((item) => item.id !== payload.new.id)].slice(0, 20));
		}).subscribe();
		return () => {
			supabaseBrowser?.removeChannel(channel);
		};
	}, []);
	async function markRead(id) {
		if (!supabaseBrowser) return;
		const { error } = await supabaseBrowser.from("admin_notifications").update({ is_read: true }).eq("id", id);
		if (error) console.error("Admin notification update failed", error);
		else setNotifications((current) => current.map((item) => item.id === id ? {
			...item,
			is_read: true
		} : item));
	}
	async function deleteNotification(id) {
		if (!supabaseBrowser) return;
		setDeletingNotification(id);
		const { data, error } = await supabaseBrowser.rpc("admin_delete_notification", { p_notification_id: id });
		setDeletingNotification(null);
		if (error) {
			console.error("Admin notification delete failed", error);
			return;
		}
		if (data === true) setNotifications((current) => current.filter((item) => item.id !== id));
	}
	const items = (0, import_react.useMemo)(() => stats ? [
		["Toplam parsel", stats.parcels_inventory_total],
		["Satışa açık", stats.parcels_available],
		["Satılmış", stats.parcels_sold],
		["Kullanıcı", stats.users_total],
		["Sertifika", stats.certificates_total],
		["Bekleyen sertifika", stats.certificates_pending],
		["Sipariş", stats.orders_total],
		["Başarılı ödeme", stats.payments_succeeded]
	] : [], [stats]);
	const unread = notifications.filter((item) => !item.is_read).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
		children: [
			items.map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 font-display text-3xl",
					children: Number(value).toLocaleString("tr-TR")
				})]
			}, String(label))),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel p-5 sm:col-span-2 xl:col-span-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-5 w-5 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-semibold",
							children: "Bildirimler"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "rounded-full border border-gold/30 px-2 py-1 text-xs text-gold",
						children: [unread, " okunmamış"]
					})]
				}), notificationLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm text-muted-foreground",
					children: "Bildirimler yükleniyor..."
				}) : notifications.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm text-muted-foreground",
					children: "Yeni bildirim yok."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 space-y-2",
					children: notifications.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: `rounded-md border p-3 ${item.is_read ? "border-border/60" : "border-gold/40 bg-gold/5"}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium",
										children: item.title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs text-muted-foreground whitespace-pre-line",
										children: item.message
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-[10px] text-muted-foreground",
										children: item.created_at ? new Date(item.created_at).toLocaleString("tr-TR") : ""
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex shrink-0 items-center gap-2",
								children: [!item.is_read && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => void markRead(item.id),
									className: "rounded-md border border-border px-2 py-1 text-[10px] hover:border-gold",
									children: "Okundu"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									disabled: deletingNotification === item.id,
									onClick: () => void deleteNotification(item.id),
									className: "rounded-md border border-destructive/40 p-1.5 text-destructive hover:bg-destructive/10 disabled:cursor-wait disabled:opacity-50",
									"aria-label": "Bildirimi sil",
									title: "Bildirimi kalıcı olarak sil",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
								})]
							})]
						})
					}, item.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel p-5 sm:col-span-2 xl:col-span-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-semibold",
					children: "Güvenlik"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Tüm yönetim işlemleri Supabase tarafında admin yetkisi ile doğrulanır ve kritik değişiklikler audit günlüğüne yazılır."
				})]
			})
		]
	});
}
function ModuleView({ module, rows, onCall }) {
	if (module === "certificates") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminCertificateOverride, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "panel p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mb-4 font-semibold",
			children: "Mevcut sertifikalar"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
			rows,
			columns: [
				"id",
				"user_id",
				"parcel_id",
				"tier",
				"status",
				"certificate_number",
				"issued_at",
				"revoked_at"
			]
		})]
	})] });
	if (module === "users") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UsersModule, {
		rows,
		onCall
	});
	if (module === "parcels") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ParcelsModule, {
		rows,
		onCall
	});
	if (module === "orders") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrdersModule, {
		rows,
		onCall
	});
	if (module === "payments") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaymentsModule, {
		rows,
		onCall
	});
	if (module === "audit") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuditModule, { rows });
	return null;
}
function AuditModule(props) {
	const rows = props.rows;
	const [clearing, setClearing] = (0, import_react.useState)(false);
	const [message, setMessage] = (0, import_react.useState)("");
	async function clear() {
		if (!supabaseBrowser || clearing) return;
		if (!window.confirm("DİKKAT: Sistemdeki tüm audit günlükleri kalıcı olarak silinecek. Bu işlem geri alınamaz. Devam edilsin mi?")) return;
		setClearing(true);
		setMessage("");
		const { data, error } = await supabaseBrowser.rpc("admin_clear_all_audit_logs");
		setClearing(false);
		if (error) {
			setMessage(`Günlükler temizlenemedi: ${error.message}`);
			return;
		}
		setMessage(`${Number(data ?? 0).toLocaleString("tr-TR")} audit kaydı temizlendi.`);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "panel overflow-auto p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-semibold",
					children: "Son yönetim hareketleri"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-muted-foreground",
					children: "Sistemdeki uygulama audit günlükleri burada gösterilir."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled: clearing,
					onClick: () => void clear(),
					className: "rounded-md border border-destructive/50 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:cursor-wait disabled:opacity-50",
					children: clearing ? "Temizleniyor..." : "Günlüğü Temizle"
				})]
			}),
			message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-4 rounded-md border border-gold/30 bg-gold/5 p-3 text-sm",
				children: message
			}),
			rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "py-4 text-sm text-muted-foreground",
				children: "Audit günlüğü boş."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
				rows,
				columns: [
					"created_at",
					"entity_type",
					"action",
					"entity_id",
					"actor_id"
				]
			})
		]
	});
}
function UsersModule({ rows, onCall }) {
	const [id, setId] = (0, import_react.useState)("");
	const [name, setName] = (0, import_react.useState)("");
	const [role, setRole] = (0, import_react.useState)("user");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function lifecycle(action) {
		if (!supabaseBrowser) return;
		setBusy(true);
		const payload = action === "create" ? {
			action,
			email,
			password,
			full_name: name,
			role
		} : {
			action,
			user_id: id
		};
		const { error } = await supabaseBrowser.functions.invoke("admin-user-management", { body: payload });
		setBusy(false);
		if (error) alert(error.message);
		else window.location.reload();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel p-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-semibold",
				children: "Kullanıcı oluştur"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: (e) => {
					e.preventDefault();
					lifecycle("create");
				},
				className: "mt-4 grid gap-3 md:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "rounded-md border bg-background p-2 text-sm",
						placeholder: "E-posta",
						type: "email",
						value: email,
						onChange: (e) => setEmail(e.target.value),
						required: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "rounded-md border bg-background p-2 text-sm",
						placeholder: "Geçici şifre (10+ karakter)",
						type: "password",
						minLength: 10,
						value: password,
						onChange: (e) => setPassword(e.target.value),
						required: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "rounded-md border bg-background p-2 text-sm",
						placeholder: "Ad soyad",
						value: name,
						onChange: (e) => setName(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "rounded-md border bg-background p-2 text-sm",
						value: role,
						onChange: (e) => setRole(e.target.value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "user",
							children: "user"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "admin",
							children: "admin"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						disabled: busy,
						className: "btn-gold rounded-md px-4 py-2 text-sm md:col-span-4",
						children: "Kullanıcı oluştur"
					})
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-semibold",
					children: "Profil / rol düzenle veya hesabı devre dışı bırak"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: (e) => {
						e.preventDefault();
						onCall("admin_update_user_profile", {
							p_user_id: id,
							p_full_name: name,
							p_role: role
						});
					},
					className: "mt-4 grid gap-3 md:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "rounded-md border bg-background p-2 text-sm",
							placeholder: "User UUID",
							value: id,
							onChange: (e) => setId(e.target.value),
							required: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "rounded-md border bg-background p-2 text-sm",
							placeholder: "Ad soyad",
							value: name,
							onChange: (e) => setName(e.target.value)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: "rounded-md border bg-background p-2 text-sm",
							value: role,
							onChange: (e) => setRole(e.target.value),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "user",
								children: "user"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "admin",
								children: "admin"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "btn-gold rounded-md px-4 py-2 text-sm",
							children: "Kaydet"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						disabled: !id || busy,
						onClick: () => void lifecycle("disable"),
						className: "rounded-md border border-destructive/40 px-3 py-2 text-xs text-destructive",
						children: "Hesabı devre dışı bırak"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						disabled: !id || busy,
						onClick: () => void lifecycle("enable"),
						className: "rounded-md border border-green-500/40 px-3 py-2 text-xs text-green-500",
						children: "Hesabı etkinleştir"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs text-muted-foreground",
					children: "Auth kullanıcıları hard-delete edilmez; finansal/sertifika kayıtlarının bütünlüğü için hesaplar devre dışı bırakılır."
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
			rows,
			columns: [
				"id",
				"email",
				"full_name",
				"role",
				"created_at"
			]
		})
	] });
}
function ParcelsModule({ rows, onCall }) {
	const [city, setCity] = (0, import_react.useState)("");
	const [query, setQuery] = (0, import_react.useState)("");
	const [results, setResults] = (0, import_react.useState)([]);
	const [searching, setSearching] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(null);
	const [confirm, setConfirm] = (0, import_react.useState)(null);
	const [message, setMessage] = (0, import_react.useState)("");
	async function searchParcels() {
		if (!supabaseBrowser) return;
		setSearching(true);
		setMessage("");
		const { data, error } = await supabaseBrowser.rpc("admin_search_parcels", {
			p_city_slug: city.trim() || null,
			p_query: query.trim() || null,
			p_only_sold: false
		});
		setSearching(false);
		if (error) setMessage(error.message);
		else setResults(data ?? []);
	}
	async function purchase(parcel) {
		if (!supabaseBrowser) return;
		setBusy(parcel.parcel_id);
		setMessage("");
		const { error } = await supabaseBrowser.rpc("admin_purchase_parcel", { p_parcel_id: parcel.parcel_id });
		setBusy(null);
		if (error) setMessage(error.message);
		else {
			setMessage(`${parcel.city_name ?? ""} · ${parcel.parcel_number} admin hesabına satın alındı.`);
			setResults((current) => current.filter((item) => item.parcel_id !== parcel.parcel_id));
			await onCall("admin_list_parcels", {
				p_limit: 100,
				p_offset: 0
			});
		}
	}
	async function release() {
		if (!supabaseBrowser || !confirm) return;
		setBusy(confirm.id);
		setMessage("");
		const { error } = await supabaseBrowser.rpc("admin_release_parcel", { p_parcel_id: confirm.id });
		setBusy(null);
		setConfirm(null);
		if (error) setMessage(error.message);
		else {
			setMessage(`${confirm.parcel_number} tekrar satışa açıldı.`);
			await onCall("admin_list_parcels", {
				p_limit: 100,
				p_offset: 0
			});
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-semibold",
						children: "Parsel ara ve admin hesabına al"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: "İl ve parsel numarasıyla gerçek Supabase kayıtlarında arama yapın."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => {
							setCity("");
							setQuery("");
							setResults([]);
							setMessage("");
						},
						className: "rounded-md border border-border px-3 py-2 text-xs hover:border-gold",
						children: "Temizle"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: (e) => {
						e.preventDefault();
						searchParcels();
					},
					className: "mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "rounded-md border bg-background p-2 text-sm",
							placeholder: "İl adı / kodu",
							value: city,
							onChange: (e) => setCity(e.target.value)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "rounded-md border bg-background p-2 text-sm",
							placeholder: "Parsel numarası",
							value: query,
							onChange: (e) => setQuery(e.target.value)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							disabled: searching,
							className: "btn-gold flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-4 w-4" }), searching ? "Aranıyor..." : "Ara"]
						})
					]
				}),
				message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 rounded-md border border-gold/30 bg-gold/5 p-3 text-sm",
					children: message
				}),
				results.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 overflow-auto rounded-md border border-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full min-w-[850px] text-left text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-2",
									children: "İl"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-2",
									children: "Parsel"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-2",
									children: "Durum"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-2",
									children: "Kademe"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-2",
									children: "Fiyat"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-2",
									children: "İşlem"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: results.map((parcel) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border/50",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "p-2",
									children: parcel.city_name ?? parcel.city_slug ?? "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "p-2 font-medium",
									children: parcel.parcel_number
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "p-2",
									children: parcel.status
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "p-2",
									children: parcel.tier ?? "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "p-2",
									children: parcel.price != null ? `${Number(parcel.price).toLocaleString("tr-TR")} ₺` : "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "p-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										disabled: busy === parcel.parcel_id,
										onClick: () => void purchase(parcel),
										className: "btn-gold rounded-md px-3 py-1.5 text-xs",
										children: busy === parcel.parcel_id ? "Kaydediliyor..." : "Admin olarak satın al"
									})
								})
							]
						}, parcel.parcel_id)) })]
					})
				}),
				!searching && city + query && results.length === 0 && !message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm text-muted-foreground",
					children: "Uygun parsel bulunamadı."
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel overflow-auto p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-semibold",
						children: "Adminin satın aldığı parseller"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: "Yalnızca satılmış ve sahipli parseller gösterilir. X ile tekrar satışa açabilirsiniz."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[900px] text-left text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-2",
								children: "Parsel"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-2",
								children: "Durum"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-2",
								children: "Fiyat"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-2",
								children: "Kademe"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-2",
								children: "İşlem"
							})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((parcel) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border/50",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "p-2 font-medium",
								children: parcel.parcel_number
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "p-2",
								children: parcel.status
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "p-2",
								children: parcel.price != null ? `${Number(parcel.price).toLocaleString("tr-TR")} ₺` : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "p-2",
								children: parcel.tier ?? "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "p-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex items-center gap-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										disabled: busy === parcel.id,
										onClick: () => setConfirm(parcel),
										className: "rounded-md border border-destructive/40 p-1.5 text-destructive hover:bg-destructive/10",
										"aria-label": "Parseli tekrar satışa aç",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
									})
								})
							})
						]
					}, parcel.id)) })]
				}),
				rows.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "py-4 text-sm text-muted-foreground",
					children: "Admin hesabına ait satın alınmış parsel bulunmuyor."
				})
			]
		}),
		confirm && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "fixed inset-0 z-50 grid place-items-center bg-black/50 p-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "dialog",
				"aria-modal": "true",
				className: "w-full max-w-md rounded-lg border border-border bg-background p-5 shadow-xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-semibold",
						children: "Parseli tekrar satışa aç?"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm text-muted-foreground",
						children: [confirm.parcel_number, " parseli admin hesabından çıkarılacak ve tekrar satın alınabilir hale getirilecek."]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 flex justify-end gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setConfirm(null),
							className: "rounded-md border border-border px-4 py-2 text-sm",
							children: "İptal"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: busy === confirm.id,
							onClick: () => void release(),
							className: "rounded-md bg-destructive px-4 py-2 text-sm text-destructive-foreground",
							children: "Evet, satışa aç"
						})]
					})
				]
			})
		})
	] });
}
function OrdersModule({ rows, onCall }) {
	const [id, setId] = (0, import_react.useState)("");
	const [status, setStatus] = (0, import_react.useState)("pending");
	const [user, setUser] = (0, import_react.useState)("");
	const [parcel, setParcel] = (0, import_react.useState)("");
	const [amount, setAmount] = (0, import_react.useState)("0");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "panel p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-semibold",
			children: "Sipariş"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: (e) => {
				e.preventDefault();
				onCall(id ? "admin_update_order" : "admin_create_order", id ? {
					p_order_id: id,
					p_status: status
				} : {
					p_user_id: user,
					p_parcel_id: parcel || null,
					p_amount: Number(amount),
					p_currency: "TRY"
				});
			},
			className: "mt-4 grid gap-3 md:grid-cols-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "rounded-md border bg-background p-2 text-sm",
					placeholder: "Order UUID (düzenleme)",
					value: id,
					onChange: (e) => setId(e.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "rounded-md border bg-background p-2 text-sm",
					placeholder: "User UUID (yeni)",
					value: user,
					onChange: (e) => setUser(e.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "rounded-md border bg-background p-2 text-sm",
					placeholder: "Parcel UUID",
					value: parcel,
					onChange: (e) => setParcel(e.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "rounded-md border bg-background p-2 text-sm",
					type: "number",
					min: "0",
					step: "0.01",
					value: amount,
					onChange: (e) => setAmount(e.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					className: "rounded-md border bg-background p-2 text-sm",
					value: status,
					onChange: (e) => setStatus(e.target.value),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "pending" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "paid" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "failed" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "cancelled" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "refunded" })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn-gold rounded-md px-4 py-2 text-sm md:col-span-5",
					children: id ? "Siparişi güncelle" : "Sipariş oluştur"
				})
			]
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
		rows,
		columns: [
			"id",
			"user_id",
			"parcel_id",
			"amount",
			"currency",
			"status",
			"created_at"
		]
	})] });
}
function PaymentsModule({ rows, onCall }) {
	const [id, setId] = (0, import_react.useState)("");
	const [order, setOrder] = (0, import_react.useState)("");
	const [amount, setAmount] = (0, import_react.useState)("0");
	const [status, setStatus] = (0, import_react.useState)("pending");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "panel p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-semibold",
				children: "Ödeme"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: (e) => {
					e.preventDefault();
					onCall(id ? "admin_update_payment" : "admin_create_payment", id ? {
						p_payment_id: id,
						p_status: status
					} : {
						p_order_id: order,
						p_amount: Number(amount),
						p_currency: "TRY",
						p_status: status
					});
				},
				className: "mt-4 grid gap-3 md:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "rounded-md border bg-background p-2 text-sm",
						placeholder: "Payment UUID (düzenleme)",
						value: id,
						onChange: (e) => setId(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "rounded-md border bg-background p-2 text-sm",
						placeholder: "Order UUID (yeni)",
						value: order,
						onChange: (e) => setOrder(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "rounded-md border bg-background p-2 text-sm",
						type: "number",
						min: "0",
						step: "0.01",
						value: amount,
						onChange: (e) => setAmount(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "rounded-md border bg-background p-2 text-sm",
						value: status,
						onChange: (e) => setStatus(e.target.value),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "pending" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "succeeded" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "failed" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "refunded" })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "btn-gold rounded-md px-4 py-2 text-sm md:col-span-4",
						children: id ? "Ödemeyi güncelle" : "Ödeme kaydı oluştur"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs text-muted-foreground",
				children: "Bu modül ödeme sağlayıcısını taklit etmez; yalnızca güvenilir ödeme kayıtlarını yönetir."
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
		rows,
		columns: [
			"id",
			"order_id",
			"user_id",
			"amount",
			"currency",
			"status",
			"provider",
			"created_at"
		]
	})] });
}
function DataTable({ rows, columns }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "panel overflow-auto p-5",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full min-w-[900px] text-left text-xs",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
				className: "border-b border-border",
				children: columns.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
					className: "p-2",
					children: c
				}, c))
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
				className: "border-b border-border/50",
				children: columns.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					className: "max-w-[260px] truncate p-2",
					children: c.endsWith("_at") && r[c] ? new Date(r[c]).toLocaleString("tr-TR") : String(r[c] ?? "—")
				}, c))
			}, r.id ?? i)) })]
		})
	});
}
//#endregion
export { Admin as component };
