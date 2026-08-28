import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

const SESSION_KEY = "myskyparcel_visit_session";
type SiteStats = { today: number; week: number; month: number; total: number; active_now: number; pages_today: number };

function getSessionId() {
  try {
    const existing = window.localStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    window.localStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

function isAdminDashboard() {
  if (typeof document === "undefined" || window.location.pathname !== "/yonetim") return false;
  return Array.from(document.querySelectorAll("h1")).some((el) => el.textContent?.trim() === "Dashboard");
}

export function SiteVisitTracker() {
  const [stats, setStats] = useState<SiteStats | null>(null);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    if (!supabaseBrowser) return;
    const sessionId = getSessionId();
    const record = () => {
      void supabaseBrowser.rpc("record_site_visit", {
        p_session_id: sessionId,
        p_path: window.location.pathname,
      });
    };
    const timer = window.setTimeout(record, 1500);
    const interval = window.setInterval(record, 60_000);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!supabaseBrowser || window.location.pathname !== "/yonetim") return;
    let cancelled = false;
    const syncVisibility = () => setShowStats(isAdminDashboard());
    syncVisibility();
    const observer = new MutationObserver(syncVisibility);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    const loadStats = async () => {
      if (!isAdminDashboard()) return;
      const { data: userData } = await supabaseBrowser.auth.getUser();
      if (!userData.user || cancelled) return;
      const { data: profile } = await supabaseBrowser.from("profiles").select("role").eq("id", userData.user.id).maybeSingle();
      if (profile?.role !== "admin" || cancelled) return;
      const { data } = await supabaseBrowser.rpc("admin_site_statistics");
      if (!cancelled && data) setStats(data as SiteStats);
    };
    void loadStats();
    const timer = window.setInterval(() => void loadStats(), 30_000);
    return () => {
      cancelled = true;
      observer.disconnect();
      window.clearInterval(timer);
    };
  }, []);

  if (!showStats || !stats) return null;

  const cards = [
    ["Şu an aktif", stats.active_now],
    ["Bugün", stats.today],
    ["Bu hafta", stats.week],
    ["Bu ay", stats.month],
    ["Toplam", stats.total],
    ["Bugünkü sayfa görüntüleme", stats.pages_today],
  ] as const;

  return (
    <section className="mx-4 mt-4 rounded-xl border border-gold/30 bg-background/95 p-4 shadow-lg lg:ml-[266px] lg:mr-6 lg:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold">Site İstatistikleri</h2>
          <p className="mt-1 text-xs text-muted-foreground">Son 5 dakikadaki aktif ziyaretçiler ve toplam ziyaretler.</p>
        </div>
        <span className="rounded-full border border-green-500/30 px-2.5 py-1 text-[11px] text-green-500">CANLI</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-border bg-accent/30 p-3">
            <p className="text-[11px] text-muted-foreground">{label}</p>
            <p className="mt-1 font-display text-2xl">{Number(value).toLocaleString("tr-TR")}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
