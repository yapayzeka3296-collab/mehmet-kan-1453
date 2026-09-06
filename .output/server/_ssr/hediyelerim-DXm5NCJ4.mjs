import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { o as supabaseBrowser, s as useAuth } from "./router-D8RAz0C2.mjs";
import { A as Mail, P as LoaderCircle, n as X, q as Gift, y as Send } from "../_libs/lucide-react.mjs";
import { n as SiteHeader } from "./SiteHeader-Dq9_heMC.mjs";
import { t as SiteFooter } from "./SiteFooter-Dv3_EOXG.mjs";
import { t as UserSidebar } from "./UserSidebar-BOI_wbqI.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/hediyelerim-DXm5NCJ4.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function Hediyelerim() {
	const { user, loading: authLoading } = useAuth();
	const [parcels, setParcels] = (0, import_react.useState)([]);
	const [gifts, setGifts] = (0, import_react.useState)([]);
	const [selectedParcel, setSelectedParcel] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [message, setMessage] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [sending, setSending] = (0, import_react.useState)(false);
	const [cancelling, setCancelling] = (0, import_react.useState)(null);
	const [feedback, setFeedback] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	async function load() {
		if (!supabaseBrowser || !user) return;
		setLoading(true);
		setError(null);
		try {
			const [{ data: parcelData, error: parcelError }, { data: giftData, error: giftError }] = await Promise.all([supabaseBrowser.from("parcels").select("id, parcel_number, tier, cities(name)").eq("owner_id", user.id).eq("status", "sold").order("created_at", { ascending: false }).limit(200), supabaseBrowser.from("parcel_gifts").select("id, parcel_id, recipient_email, message, status, expires_at, created_at, recipient_user_id").eq("sender_user_id", user.id).order("created_at", { ascending: false }).limit(100)]);
			if (parcelError) throw parcelError;
			if (giftError) throw giftError;
			setParcels((parcelData ?? []).map((p) => ({
				...p,
				city_name: p.cities?.name ?? null
			})));
			setGifts(giftData ?? []);
			if (!selectedParcel && parcelData?.[0]?.id) setSelectedParcel(parcelData[0].id);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Hediye verileri yüklenemedi.");
		} finally {
			setLoading(false);
		}
	}
	(0, import_react.useEffect)(() => {
		if (user) load();
	}, [user]);
	const parcelMap = (0, import_react.useMemo)(() => new Map(parcels.map((p) => [p.id, p])), [parcels]);
	const pendingCount = gifts.filter((g) => g.status === "pending" && new Date(g.expires_at) > /* @__PURE__ */ new Date()).length;
	async function sendGift(event) {
		event.preventDefault();
		setFeedback(null);
		setError(null);
		if (!supabaseBrowser || !selectedParcel) {
			setError("Önce hediye edilecek parseli seçin.");
			return;
		}
		const cleanEmail = email.trim().toLowerCase();
		if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
			setError("Geçerli bir e-posta adresi girin.");
			return;
		}
		setSending(true);
		try {
			const { data: gift, error: giftError } = await supabaseBrowser.rpc("create_parcel_gift", {
				p_parcel_id: selectedParcel,
				p_recipient_email: cleanEmail,
				p_message: message.trim() || null
			});
			if (giftError) throw giftError;
			const { error: emailError } = await supabaseBrowser.functions.invoke("send-parcel-gift", { body: {
				giftId: gift.gift_id,
				token: gift.token
			} });
			if (emailError) throw emailError;
			setEmail("");
			setMessage("");
			setFeedback("Hediye oluşturuldu ve davet e-postası gönderildi.");
			await load();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Hediye gönderilemedi.");
		} finally {
			setSending(false);
		}
	}
	async function cancelGift(id) {
		if (!supabaseBrowser) return;
		setCancelling(id);
		setError(null);
		setFeedback(null);
		try {
			const { error: cancelError } = await supabaseBrowser.rpc("cancel_parcel_gift", { p_gift_id: id });
			if (cancelError) throw cancelError;
			setFeedback("Bekleyen hediye iptal edildi.");
			await load();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Hediye iptal edilemedi.");
		} finally {
			setCancelling(null);
		}
	}
	if (authLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "starfield min-h-screen",
		"aria-busy": "true"
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "starfield min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "mx-auto max-w-[760px] px-4 py-16",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel p-8 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-2xl",
						children: "HEDİYELERİM"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted-foreground",
						children: "Bu bölümü kullanmak için giriş yapmalısınız."
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "starfield min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto grid max-w-[1600px] gap-6 px-4 py-8 lg:grid-cols-[260px_1fr] lg:px-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserSidebar, { active: "/hediyelerim" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 grid gap-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
							className: "panel p-6",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gift, { className: "h-5 w-5 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
										className: "font-display text-3xl font-bold",
										children: "HEDİYELERİM"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-muted-foreground",
									children: "Sahip olduğunuz parselleri üye olan veya olmayan kişilere güvenli davet bağlantısıyla hediye edin."
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "rounded-full border border-gold/40 px-3 py-1 text-xs text-gold",
									children: ["Bekleyen: ", pendingCount]
								})]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "panel p-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display text-xl",
									children: "🎁 PARSEL HEDİYE ET"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-xs text-muted-foreground",
									children: "Parsel, alıcının hesabına yalnızca davet bağlantısı ve e-posta doğrulaması sonrası aktarılır."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
									className: "mt-5 grid gap-4",
									onSubmit: sendGift,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "grid gap-2 text-xs",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Hediye edilecek parsel"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
												value: selectedParcel,
												onChange: (e) => setSelectedParcel(e.target.value),
												className: "rounded-md border border-input bg-background px-3 py-3 outline-none focus:border-gold",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "",
													children: "Parsel seçin"
												}), parcels.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
													value: p.id,
													children: [
														p.parcel_number,
														" · ",
														p.city_name ?? "—",
														" · ",
														p.tier ?? "—"
													]
												}, p.id))]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "grid gap-2 text-xs",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Alıcının e-posta adresi"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-2 rounded-md border border-input bg-background px-3 focus-within:border-gold",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "email",
													value: email,
													onChange: (e) => setEmail(e.target.value),
													placeholder: "alici@example.com",
													className: "min-w-0 flex-1 bg-transparent py-3 outline-none"
												})]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "grid gap-2 text-xs",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Hediye mesajı (isteğe bağlı)"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
												value: message,
												onChange: (e) => setMessage(e.target.value),
												maxLength: 1e3,
												rows: 4,
												placeholder: "Size özel bir mesaj...",
												className: "resize-none rounded-md border border-input bg-background px-3 py-3 outline-none focus:border-gold"
											})]
										}),
										error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											role: "alert",
											className: "rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive",
											children: error
										}),
										feedback && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											role: "status",
											className: "rounded-md border border-green-500/40 bg-green-500/10 px-3 py-2 text-sm text-green-500",
											children: feedback
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "submit",
											disabled: sending || !selectedParcel || parcels.length === 0,
											className: "btn-gold inline-flex items-center justify-center gap-2 rounded-md py-3.5 text-xs disabled:opacity-60",
											children: [sending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-4 w-4" }), sending ? "HEDİYE GÖNDERİLİYOR..." : "HEDİYEYİ GÖNDER"]
										})
									]
								}),
								parcels.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-4 text-center text-xs text-muted-foreground",
									children: "Hediye edilebilecek sahipli parseliniz bulunmuyor."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "panel p-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-xl",
								children: "GÖNDERDİĞİM HEDİYELER"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-5 grid gap-3",
								children: [
									loading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-center gap-2 py-8 text-xs text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), " Yükleniyor..."]
									}),
									!loading && gifts.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "py-8 text-center text-sm text-muted-foreground",
										children: "Henüz gönderilmiş bir hediyeniz yok."
									}),
									!loading && gifts.map((gift) => {
										const parcel = parcelMap.get(gift.parcel_id);
										const expired = gift.status === "pending" && new Date(gift.expires_at) <= /* @__PURE__ */ new Date();
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid gap-3 rounded-lg border border-border p-4 md:grid-cols-[1fr_auto] md:items-center",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "font-semibold",
													children: parcel?.parcel_number ?? gift.parcel_id
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "mt-1 text-xs text-muted-foreground",
													children: gift.recipient_email
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "mt-1 text-[10px] text-muted-foreground",
													children: gift.status === "pending" && !expired ? `Bekliyor · ${new Date(gift.expires_at).toLocaleDateString("tr-TR")} tarihine kadar` : gift.status === "accepted" ? "Kabul edildi" : gift.status === "cancelled" ? "İptal edildi" : expired ? "Süresi doldu" : gift.status
												})
											] }), gift.status === "pending" && !expired && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												onClick: () => void cancelGift(gift.id),
												disabled: cancelling === gift.id,
												className: "inline-flex items-center justify-center gap-2 rounded-md border border-border px-4 py-2 text-xs hover:border-destructive hover:text-destructive disabled:opacity-60",
												children: [cancelling === gift.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), " İPTAL ET"]
											})]
										}, gift.id);
									})
								]
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { Hediyelerim as component };
