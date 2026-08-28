import { Link, useNavigate } from "@tanstack/react-router";
import { Award, Bell, FileText, Home, Layers, LogOut, ShieldCheck, Sparkles, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const ITEMS = [
  { to: "/panelim", label: "Panelim", icon: Home },
  { to: "/parsellerim", label: "Koleksiyonum", icon: Layers },
  { to: "/siparislerim", label: "Siparişlerim", icon: FileText },
  { to: "/sertifikalarim", label: "Sertifikalarım", icon: Award },
  { to: "/bildirimler", label: "Bildirimler", icon: Bell },
  { to: "/profilim", label: "Profilim", icon: User },
  { to: "/guvenlik-ayarlari", label: "Güvenlik Ayarları", icon: ShieldCheck },
] as const;

export function UserSidebar({ active }: { active: string }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const handleSignOut = async () => { const result = await signOut(); if (result.success) await navigate({ to: "/" }); };
  return <aside className="grid content-start gap-6"><nav className="panel p-4"><p className="px-2 pb-3 text-xs font-semibold tracking-[0.12em] text-gold">KULLANICI PANELİ</p><ul className="grid gap-1">{ITEMS.map((item) => <li key={item.to}><Link to={item.to} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${active === item.to ? "border border-gold/50 bg-accent text-gold" : "text-foreground/85 hover:bg-accent hover:text-gold"}`}><item.icon className="h-4 w-4 shrink-0" /><span className="truncate">{item.label}</span></Link></li>)}</ul><div className="my-3 h-px bg-border" /><button type="button" onClick={() => void handleSignOut()} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-foreground/85 hover:bg-accent hover:text-gold"><LogOut className="h-4 w-4" /> Çıkış Yap</button></nav><div className="panel p-6 text-center"><Sparkles className="mx-auto h-10 w-10 text-gold" /><p className="mt-4 font-display text-base leading-snug">GÖKYÜZÜNDE<br />SANA ÖZEL BİR YER</p><p className="mt-3 text-xs text-muted-foreground">Koleksiyonunuzu ve sertifikalarınızı hesabınızdan güvenle yönetin.</p></div></aside>;
}
