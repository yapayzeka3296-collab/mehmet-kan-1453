import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { UserSidebar } from "@/components/UserSidebar";
import { useAuth } from "@/hooks/useAuth";
import { createBrowserSupabase } from "@/lib/supabaseBrowser";

export const Route = createFileRoute("/bildirimler")({ component: Bildirimler });

type Notification = { id: string; type: string; title: string; message: string; is_read: boolean; created_at: string };

function Bildirimler() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!user) return;
    let active = true;
    const load = async () => {
      const supabase = createBrowserSupabase();
      if (!supabase) { if (active) setLoading(false); return; }
      const { data } = await supabase.from("user_notifications").select("id,type,title,message,is_read,created_at").eq("user_id", user.id).order("created_at", { ascending: false });
      if (active) { setItems((data ?? []) as Notification[]); setLoading(false); }
    };
    void load();
    return () => { active = false; };
  }, [user]);
  const markRead = async (id: string) => {
    const supabase = createBrowserSupabase();
    if (!supabase) return;
    const { error } = await supabase.from("user_notifications").update({ is_read: true }).eq("id", id).eq("user_id", user?.id ?? "");
    if (!error) setItems((current) => current.map((item) => item.id === id ? { ...item, is_read: true } : item));
  };
  if (authLoading) return <div className="starfield min-h-screen" aria-busy="true" />;
  if (!user) return <Navigate to="/giris" replace />;
  return <div className="starfield min-h-screen"><SiteHeader /><main className="mx-auto grid max-w-[1600px] gap-6 px-4 py-8 lg:grid-cols-[260px_1fr] lg:px-8"><UserSidebar active="/bildirimler" /><section className="panel p-6"><div className="flex items-center gap-3"><Bell className="h-6 w-6 text-gold" /><div><h1 className="font-display text-3xl font-bold">BİLDİRİMLER</h1><p className="mt-1 text-xs text-muted-foreground">Sipariş, sertifika ve hesap bildirimlerinizi takip edin.</p></div></div><div className="mt-6 space-y-3">{loading ? <p className="p-8 text-center text-sm text-muted-foreground">Bildirimler yükleniyor…</p> : items.length === 0 ? <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">Henüz bildiriminiz yok.</p> : items.map((item) => <button type="button" key={item.id} onClick={() => void markRead(item.id)} className={`w-full rounded-lg border p-4 text-left ${item.is_read ? "border-border/60 opacity-70" : "border-gold/40 bg-gold/5"}`}><div className="flex justify-between gap-3"><b className="text-sm">{item.title}</b><span className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString("tr-TR")}</span></div><p className="mt-1 text-sm text-muted-foreground">{item.message}</p></button>)}</div></section></main><SiteFooter /></div>;
}
