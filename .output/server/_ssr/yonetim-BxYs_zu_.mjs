import { i as __toESM } from "../_runtime.mjs";
import { n as supabaseBrowser } from "./supabaseBrowser-CW6TqKSB.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { B as FileText, Y as ClipboardList, g as RefreshCw, m as ShieldCheck, nt as Award, q as CreditCard, r as Users, tt as Boxes, w as LogOut } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/yonetim-BxYs_zu_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminCertificateOverride() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "panel p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-semibold",
			children: "Sertifika tasarımı yeniden hazırlanıyor"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-xs text-muted-foreground",
			children: "Eski admin sertifika oluşturma, şablona veri yazma, otomatik görsel üretme ve PDF/baskı önizleme sistemi kaldırıldı. Yeni sertifika tasarımı hazır olduğunda bu alan yeniden yapılandırılacaktır."
		})]
	});
}
function Admin() {
	const navigate = useNavigate();
	const [authorized, setAuthorized] = (0, import_react.useState)(false);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [module, setModule] = (0, import_react.useState)("dashboard");
	const [stats, setStats] = (0, import_react.useState)(null);
	const [rows, setRows] = (0, import_react.useState)([]);
	const [name, setName] = (0, import_react.useState)("Yönetici");
	const [error, setError] = (0, import_react.useState)("");
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
			await navigate({ to: "/" });
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
		setLoading(false);
	}
	(0, import_react.useEffect)(() => {
		load();
		const sub = supabaseBrowser?.auth.onAuthStateChange((e) => {
			if (e === "SIGNED_OUT") navigate({ to: "/" });
		});
		return () => sub?.data.subscription.unsubscribe();
	}, [module]);
	async function logout() {
		await supabaseBrowser?.auth.signOut({ scope: "global" });
		await navigate({ to: "/" });
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
					onClick: () => void load(),
					className: "flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs hover:border-gold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-4 w-4" }), "Yenile"]
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
					onCall: call
				})]
			})]
		})]
	});
}
function Dashboard({ stats }) {
	const items = (0, import_react.useMemo)(() => stats ? [
		["Parseller", stats.parcels_total],
		["Satılmış", stats.parcels_sold],
		["Kullanıcı", stats.users_total],
		["Sertifika", stats.certificates_total],
		["Sipariş", stats.orders_total],
		["Başarılı ödeme", stats.payments_succeeded]
	] : [], [stats]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-3",
		children: [items.map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel p-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 font-display text-3xl",
				children: Number(value).toLocaleString("tr-TR")
			})]
		}, String(label))), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel p-5 sm:col-span-2 xl:col-span-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-semibold",
				children: "Güvenlik"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted-foreground",
				children: "Tüm yönetim işlemleri Supabase tarafında admin yetkisi ile doğrulanır ve kritik değişiklikler audit günlüğüne yazılır."
			})]
		})]
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "panel overflow-auto p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mb-4 font-semibold",
			children: "Son yönetim hareketleri"
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
	const [id, setId] = (0, import_react.useState)("");
	const [status, setStatus] = (0, import_react.useState)("available");
	const [owner, setOwner] = (0, import_react.useState)("");
	const [price, setPrice] = (0, import_react.useState)("0");
	const [tier, setTier] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "panel p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-semibold",
			children: "Parsel düzenle"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: (e) => {
				e.preventDefault();
				onCall("admin_update_parcel", {
					p_parcel_id: id,
					p_status: status,
					p_owner_id: owner || null,
					p_price: Number(price),
					p_tier: tier || null
				});
			},
			className: "mt-4 grid gap-3 md:grid-cols-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "rounded-md border bg-background p-2 text-sm",
					placeholder: "Parsel UUID",
					value: id,
					onChange: (e) => setId(e.target.value),
					required: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					className: "rounded-md border bg-background p-2 text-sm",
					value: status,
					onChange: (e) => setStatus(e.target.value),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "available" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "reserved" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "sold" })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "rounded-md border bg-background p-2 text-sm",
					placeholder: "Owner UUID",
					value: owner,
					onChange: (e) => setOwner(e.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "rounded-md border bg-background p-2 text-sm",
					type: "number",
					min: "0",
					step: "0.01",
					value: price,
					onChange: (e) => setPrice(e.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn-gold rounded-md px-4 py-2 text-sm",
					children: "Kaydet"
				})
			]
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
		rows,
		columns: [
			"id",
			"parcel_number",
			"status",
			"owner_id",
			"price",
			"tier"
		]
	})] });
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
