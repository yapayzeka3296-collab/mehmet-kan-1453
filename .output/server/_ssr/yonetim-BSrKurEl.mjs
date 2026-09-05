import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as supabaseBrowser, s as useAuth } from "./router-kyhCymue.mjs";
import { A as LogOut, T as PackageCheck, a as UserRound, b as RefreshCw, c as Trash2, ct as Bell, ft as Activity, g as ShieldAlert, h as ShieldCheck, lt as Award, nt as CircleX, p as ShoppingCart, q as FileText, r as Users, st as Boxes, tt as ClipboardList, y as Search } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/yonetim-BSrKurEl.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
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
function AdminUserSearch({ initialRows }) {
	const [query, setQuery] = (0, import_react.useState)("");
	const [rows, setRows] = (0, import_react.useState)(initialRows);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	async function search() {
		setError("");
		setLoading(true);
		const { data, error: rpcError } = await supabaseBrowser.rpc("admin_search_users", {
			p_query: query.trim() || null,
			p_limit: 100,
			p_offset: 0
		});
		if (rpcError) setError(rpcError.message);
		else setRows(data ?? []);
		setLoading(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-3 sm:flex-row",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: query,
							onChange: (event) => setQuery(event.target.value),
							onKeyDown: (event) => {
								if (event.key === "Enter") search();
							},
							placeholder: "Ad soyad veya e-posta ara...",
							className: "w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-gold"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						disabled: loading,
						onClick: () => void search(),
						className: "rounded-md border border-border px-4 py-2 text-sm hover:border-gold disabled:opacity-60",
						children: loading ? "Aranıyor..." : "Ara"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-xs text-muted-foreground",
					children: "Arama kullanıcı adı veya e-posta üzerinden veritabanında sunucu tarafında yapılır."
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "alert",
					className: "mt-3 text-sm text-destructive",
					children: error
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel overflow-auto p-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full min-w-[800px] text-left text-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
					className: "border-b border-border",
					children: [
						"Ad Soyad",
						"E-posta",
						"Rol",
						"Kayıt Tarihi"
					].map((label) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "p-2",
						children: label
					}, label))
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b border-border/50",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, { className: "h-3.5 w-3.5 text-muted-foreground" }), row.full_name || "Belirtilmemiş"]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-2",
							children: row.email || "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-2",
							children: row.role || "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-2",
							children: row.created_at ? new Date(row.created_at).toLocaleString("tr-TR") : "—"
						})
					]
				}, row.id)) })]
			}), rows.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "py-4 text-sm text-muted-foreground",
				children: "Kullanıcı bulunamadı."
			})]
		})]
	});
}
var ADMIN_EMAIL = "incememet3296@gmail.com";
var menus = [
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
		label: "Askıdaki Siparişler",
		icon: ClipboardList
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
	async function guard() {
		const { data, error: authError } = await supabaseBrowser.auth.getUser();
		if (authError || !data.user) {
			await navigate({ to: "/giris" });
			return false;
		}
		const email = data.user.email?.trim().toLowerCase() ?? "";
		const { data: profile, error: profileError } = await supabaseBrowser.from("profiles").select("full_name,role").eq("id", data.user.id).maybeSingle();
		if (profileError) console.error("Admin profile lookup failed", profileError);
		if (!(email === ADMIN_EMAIL || profile?.role === "admin")) {
			await navigate({ to: "/ana-sayfa" });
			return false;
		}
		setName(profile?.full_name?.trim() || "Yönetici");
		setAuthorized(true);
		return true;
	}
	async function load() {
		setError("");
		if (!await guard()) {
			setLoading(false);
			return;
		}
		setLoading(true);
		if (module === "dashboard") {
			const { data, error: rpcError } = await supabaseBrowser.rpc("admin_dashboard_stats");
			if (rpcError) setError(rpcError.message);
			else setStats(data);
		} else {
			const { data, error: rpcError } = await supabaseBrowser.rpc({
				users: "admin_list_users",
				parcels: "admin_list_parcels",
				orders: "admin_list_orders",
				certificates: "admin_list_certificates",
				audit: "admin_list_audit"
			}[module], {
				p_limit: 100,
				p_offset: 0
			});
			if (rpcError) setError(rpcError.message);
			else setRows(data ?? []);
		}
		setLoading(false);
	}
	(0, import_react.useEffect)(() => {
		load();
		const sub = supabaseBrowser.auth.onAuthStateChange((event) => {
			if (event === "SIGNED_OUT") navigate({ to: "/ana-sayfa" });
		});
		return () => sub.data.subscription.unsubscribe();
	}, [module]);
	async function logout() {
		const result = await signOut();
		if (!result.success) {
			setError(result.error);
			return;
		}
		await navigate({ to: "/ana-sayfa" });
	}
	if (loading && !authorized) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-screen place-items-center bg-background text-sm text-muted-foreground",
		children: "Admin yetkisi doğrulanıyor..."
	});
	if (!authorized) return null;
	const title = menus.find((item) => item.id === module)?.label ?? "Dashboard";
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
					children: menus.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setModule(item.id),
						className: `flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm ${module === item.id ? "bg-accent text-gold" : "text-foreground/80 hover:bg-accent"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "h-4 w-4" }), item.label]
					}, item.id))
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
					className: "flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs hover:border-gold disabled:opacity-60",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `h-4 w-4 ${loading ? "animate-spin" : ""}` }), "Yenile"]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-6 p-4 lg:p-6",
				children: [error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					role: "alert",
					className: "rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive",
					children: error
				}), module === "dashboard" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dashboard, { stats }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModuleView, {
					module,
					rows,
					onReload: load
				})]
			})]
		})]
	});
}
function Dashboard({ stats }) {
	const [notifications, setNotifications] = (0, import_react.useState)([]);
	const [siteStats, setSiteStats] = (0, import_react.useState)(null);
	const [siteStatsError, setSiteStatsError] = (0, import_react.useState)("");
	const [notificationError, setNotificationError] = (0, import_react.useState)("");
	const [clearingNotification, setClearingNotification] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		(async () => {
			const { data } = await supabaseBrowser.from("admin_notifications").select("id,title,message,is_read,created_at").order("created_at", { ascending: false }).limit(20);
			setNotifications(data ?? []);
		})();
	}, []);
	(0, import_react.useEffect)(() => {
		(async () => {
			const { data, error: rpcError } = await supabaseBrowser.rpc("admin_site_statistics");
			if (rpcError) {
				setSiteStatsError(rpcError.message);
				return;
			}
			setSiteStats(data);
		})();
	}, []);
	async function clearNotification(id) {
		setNotificationError("");
		setClearingNotification(id);
		const { error: rpcError } = await supabaseBrowser.rpc("admin_delete_notification", { p_notification_id: id });
		if (rpcError) setNotificationError(rpcError.message);
		else setNotifications((current) => current.filter((item) => item.id !== id));
		setClearingNotification("");
	}
	const items = stats ? [
		["Toplam parsel", stats.parcels_inventory_total],
		["Satışa açık", stats.parcels_available],
		["Satılmış", stats.parcels_sold],
		["Kullanıcı", stats.users_total],
		["Sertifika", stats.certificates_total],
		["Bekleyen sertifika", stats.certificates_pending],
		["Askıdaki sipariş", stats.orders_total]
	] : [];
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
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "h-5 w-5 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-semibold",
						children: "Canlı Site İstatistikleri"
					})]
				}), siteStatsError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm text-destructive",
					children: siteStatsError
				}) : siteStats ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5",
					children: [
						["Şu an aktif", siteStats.active_now],
						["Bugün", siteStats.today],
						["Bu hafta", siteStats.week],
						["Bu ay", siteStats.month],
						["Toplam", siteStats.total]
					].map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-md border border-border p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-display text-2xl",
							children: Number(value).toLocaleString("tr-TR")
						})]
					}, String(label)))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm text-muted-foreground",
					children: "Canlı istatistikler yükleniyor..."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel p-5 sm:col-span-2 xl:col-span-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-5 w-5 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-semibold",
							children: "Bildirimler"
						})]
					}),
					notificationError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "alert",
						className: "mt-3 text-sm text-destructive",
						children: notificationError
					}),
					notifications.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm text-muted-foreground",
						children: "Yeni bildirim yok."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 space-y-2",
						children: notifications.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-3 rounded-md border border-border p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium",
									children: n.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 whitespace-pre-line text-xs text-muted-foreground",
									children: n.message
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								"aria-label": "Bildirimi temizle",
								title: "Bildirimi temizle",
								disabled: clearingNotification === n.id,
								onClick: () => void clearNotification(n.id),
								className: "shrink-0 rounded-md border border-border p-2 text-muted-foreground hover:border-destructive hover:text-destructive disabled:opacity-60",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
							})]
						}, n.id))
					})
				]
			})
		]
	});
}
function ModuleView({ module, rows, onReload }) {
	if (module === "certificates") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminCertificateOverride, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
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
	})] });
	if (module === "users") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminUserSearch, { initialRows: rows });
	if (module === "parcels") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ParcelModule, { initialRows: rows });
	if (module === "orders") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
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
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuditModule, {
		rows,
		onReload
	});
}
function ParcelModule({ initialRows }) {
	const [query, setQuery] = (0, import_react.useState)("");
	const [searchRows, setSearchRows] = (0, import_react.useState)(initialRows);
	const [searching, setSearching] = (0, import_react.useState)(false);
	const [actionError, setActionError] = (0, import_react.useState)("");
	const [actionLoading, setActionLoading] = (0, import_react.useState)("");
	async function search() {
		setActionError("");
		setSearching(true);
		const { data, error } = await supabaseBrowser.rpc("admin_search_parcels", {
			p_city_slug: null,
			p_query: query.trim() || null,
			p_only_sold: false
		});
		if (error) setActionError(error.message);
		else setSearchRows(data ?? []);
		setSearching(false);
	}
	async function buy(id) {
		if (!window.confirm("Bu parseli yönetici hesabına satın almak istediğinizden emin misiniz?")) return;
		setActionError("");
		setActionLoading(id + ":buy");
		const { error } = await supabaseBrowser.rpc("admin_purchase_parcel", { p_parcel_id: id });
		if (error) setActionError(error.message);
		else await search();
		setActionLoading("");
	}
	async function release(id) {
		if (!window.confirm("Bu yöneticiye ait parseli tekrar satışa çıkarmak istediğinizden emin misiniz?")) return;
		setActionError("");
		setActionLoading(id + ":release");
		const { error } = await supabaseBrowser.rpc("admin_release_parcel", { p_parcel_id: id });
		if (error) setActionError(error.message);
		else await search();
		setActionLoading("");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-3 sm:flex-row",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: query,
							onChange: (e) => setQuery(e.target.value),
							onKeyDown: (e) => {
								if (e.key === "Enter") search();
							},
							placeholder: "Parsel numarası ara...",
							className: "w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-gold"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						disabled: searching,
						onClick: () => void search(),
						className: "rounded-md border border-border px-4 py-2 text-sm hover:border-gold disabled:opacity-60",
						children: searching ? "Aranıyor..." : "Ara"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-xs text-muted-foreground",
					children: "81.000 parsel veritabanında sunucu tarafında aranır. Sonuçlar en fazla 100 kayıt olarak gösterilir."
				}),
				actionError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "alert",
					className: "mt-3 text-sm text-destructive",
					children: actionError
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel overflow-auto p-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full min-w-[1000px] text-left text-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
					className: "border-b border-border",
					children: [
						"Parsel",
						"Durum",
						"Sınıf",
						"Fiyat",
						"Sahibi",
						"İşlem"
					].map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "p-2",
						children: c
					}, c))
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: searchRows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b border-border/50",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-2",
							children: row.parcel_number ?? "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-2",
							children: row.status ?? "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-2",
							children: row.tier ?? "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-2",
							children: row.price == null ? "—" : `${Number(row.price).toLocaleString("tr-TR")} ₺`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-2",
							children: row.owner_name || "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [row.status === "available" && !row.owner_id && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									disabled: !!actionLoading,
									onClick: () => void buy(row.parcel_id),
									className: "inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 hover:border-gold disabled:opacity-60",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, { className: "h-3 w-3" }), actionLoading === row.parcel_id + ":buy" ? "..." : "Satın Al"]
								}), row.status === "sold" && row.owner_id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									disabled: !!actionLoading,
									onClick: () => void release(row.parcel_id),
									className: "rounded-md border border-border px-2 py-1 hover:border-gold disabled:opacity-60",
									children: "Satışa Çıkar"
								})]
							})
						})
					]
				}, row.parcel_id ?? row.id)) })]
			}), searchRows.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "py-4 text-sm text-muted-foreground",
				children: "Kayıt bulunmuyor."
			})]
		})]
	});
}
function AuditModule({ rows, onReload }) {
	const [clearing, setClearing] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	async function clearAudit() {
		if (!window.confirm("Tüm admin ve sertifika audit kayıtlarını temizlemek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) return;
		setError("");
		setClearing(true);
		const { data, error: rpcError } = await supabaseBrowser.rpc("admin_clear_all_audit_logs");
		if (rpcError) setError(rpcError.message);
		else await onReload();
		setClearing(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel p-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-semibold",
					children: "Audit Günlüğü"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-muted-foreground",
					children: "Yönetim ve sertifika audit kayıtlarını temizleyebilirsiniz."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					disabled: clearing,
					onClick: () => void clearAudit(),
					className: "inline-flex items-center justify-center gap-2 rounded-md border border-destructive/50 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-60",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" }), clearing ? "Temizleniyor..." : "Audit Günlüğünü Temizle"]
				})]
			}), error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "mt-3 text-sm text-destructive",
				children: error
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
			rows,
			columns: [
				"created_at",
				"entity_type",
				"action",
				"entity_id",
				"actor_id"
			]
		})]
	});
}
function DataTable({ rows, columns }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "panel overflow-auto p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full min-w-[800px] text-left text-xs",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
				className: "border-b border-border",
				children: columns.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
					className: "p-2",
					children: c
				}, c))
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((row, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
				className: "border-b border-border/50",
				children: columns.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					className: "p-2 align-top",
					children: row[c] == null ? "—" : typeof row[c] === "object" ? JSON.stringify(row[c]) : String(row[c])
				}, c))
			}, String(row.id ?? row.entity_id ?? index))) })]
		}), rows.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "py-4 text-sm text-muted-foreground",
			children: "Kayıt bulunmuyor."
		})]
	});
}
//#endregion
export { Admin as component };
