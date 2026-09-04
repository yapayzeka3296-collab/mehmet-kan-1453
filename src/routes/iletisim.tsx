import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone, UserRound } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { TrustBar } from "@/components/TrustBar";

export const Route = createFileRoute("/iletisim")({
  head: () => ({
    meta: [
      { title: "İletişim — MySkyParcel" },
      { name: "description", content: "MySkyParcel iletişim ve destek kanalları." },
      { property: "og:title", content: "İletişim — MySkyParcel" },
      { property: "og:description", content: "MySkyParcel iletişim ve destek kanalları." },
    ],
  }),
  component: Iletisim,
});

const CONTACT_EMAIL = "info.myskyparcel@gmail.com";

function Iletisim() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [statusText, setStatusText] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      subject: String(data.get("subject") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
      website: String(data.get("website") ?? "").trim(),
    };

    if (!payload.name || !payload.email || !payload.message) {
      setStatus("error");
      setStatusText("Lütfen ad soyad, e-posta ve mesaj alanlarını doldurun.");
      return;
    }

    setStatus("sending");
    setStatusText("");

    try {
      // Do not import Supabase during route/module evaluation. The contact page
      // must be renderable by Nitro/Passenger even when browser auth/storage
      // dependencies are unavailable on the server.
      const { supabaseBrowser } = await import("@/lib/supabaseBrowser");
      const { data: result, error } = await supabaseBrowser.functions.invoke("contact-message", {
        body: payload,
      });

      if (error) throw error;
      if (!result?.ok) throw new Error(result?.error || "Mesaj gönderilemedi.");

      form.reset();
      setStatus("success");
      setStatusText("Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.");
    } catch (error) {
      console.error("Contact form error", error);
      const subject = payload.subject || "MySkyParcel İletişim Mesajı";
      const body = `Ad Soyad: ${payload.name}\nE-posta: ${payload.email}\n\n${payload.message}`;

      // cPanel/Passenger must still provide a usable contact page if the
      // Supabase function is unavailable. This fallback is browser-only and
      // therefore cannot affect Nitro SSR rendering.
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setStatus("success");
      setStatusText(
        `Otomatik gönderim servisine ulaşılamadı. E-posta uygulamanız ${CONTACT_EMAIL} adresine hazır mesajı açtı; Gönder'e basmanız yeterli.`,
      );
    }
  }

  return (
    <div className="starfield min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-[1600px] px-4 py-14 lg:px-8">
        <h1 className="text-center font-display text-4xl font-bold sm:text-5xl">İLETİŞİM</h1>
        <p className="mx-auto mt-4 max-w-xl text-center text-sm text-muted-foreground">
          Sipariş, ödeme, sertifika, teslimat ve diğer destek talepleriniz için aşağıdaki iletişim kanallarından bize ulaşabilirsiniz.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-[360px_1fr]">
          <aside className="panel grid content-start gap-5 p-6">
            <div className="flex min-w-0 items-start gap-3">
              <UserRound className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Satıcı / İşletme</p>
                <p className="text-sm font-medium">MySkyParcel</p>
              </div>
            </div>

            {[
              { icon: Mail, t: "E-posta", v: CONTACT_EMAIL },
              { icon: Phone, t: "Telefon", v: "0541 615 97 43" },
              { icon: MapPin, t: "Adres", v: "Kuştepe Mah. Mecidiyeköy Yolu Cad. No:18 34318 Şişli/İstanbul" },
            ].map((c) => (
              <div key={c.t} className="flex min-w-0 items-start gap-3">
                <c.icon className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{c.t}</p>
                  <p className="break-words text-sm">{c.v}</p>
                </div>
              </div>
            ))}
          </aside>

          <form className="panel grid gap-5 p-6" onSubmit={handleSubmit}>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs text-muted-foreground">Ad Soyad</span>
                <input required name="name" autoComplete="name" className="mt-1.5 w-full rounded-md border border-input bg-background/50 px-3 py-2.5 text-sm outline-none focus:border-gold" />
              </label>
              <label className="block">
                <span className="text-xs text-muted-foreground">E-posta</span>
                <input required name="email" type="email" autoComplete="email" className="mt-1.5 w-full rounded-md border border-input bg-background/50 px-3 py-2.5 text-sm outline-none focus:border-gold" />
              </label>
            </div>

            <label className="block">
              <span className="text-xs text-muted-foreground">Konu</span>
              <input name="subject" className="mt-1.5 w-full rounded-md border border-input bg-background/50 px-3 py-2.5 text-sm outline-none focus:border-gold" />
            </label>

            <label className="block">
              <span className="text-xs text-muted-foreground">Mesajınız</span>
              <textarea required name="message" rows={6} className="mt-1.5 w-full rounded-md border border-input bg-background/50 px-3 py-2.5 text-sm outline-none focus:border-gold" />
            </label>

            <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

            <button type="submit" disabled={status === "sending"} className="btn-gold w-fit rounded-md px-8 py-3 text-[11px] disabled:cursor-not-allowed disabled:opacity-60">
              {status === "sending" ? "GÖNDERİLİYOR..." : "GÖNDER"}
            </button>

            {statusText && (
              <p role="status" className={`text-sm ${status === "success" ? "text-emerald-400" : "text-red-400"}`}>
                {statusText}
              </p>
            )}
          </form>
        </div>
      </main>
      <TrustBar />
      <SiteFooter />
    </div>
  );
}
