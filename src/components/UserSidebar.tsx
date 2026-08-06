import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  Home,
  Layers,
  LogOut,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  User,
} from "lucide-react";

const ITEMS = [
  { to: "/panelim", label: "Panelim", icon: Home },
  { to: "/parsellerim", label: "Parsellerim", icon: Layers },
  { to: "/sertifikalarim", label: "Sertifikalarım", icon: Award },
  { to: "/siparislerim", label: "Siparişlerim", icon: ShoppingBag },
  { to: "/profilim", label: "Profilim", icon: User },
  { to: "/guvenlik-ayarlari", label: "Güvenlik Ayarları", icon: ShieldCheck },
] as const;

export function UserSidebar({ active }: { active: string }) {
  return (
    <aside className="grid content-start gap-6">
      <nav className="panel p-4">
        <p className="px-2 pb-3 text-xs font-semibold tracking-[0.12em] text-gold">KULLANICI PANELİ</p>
        <ul className="grid gap-1">
          {ITEMS.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  active === item.to
                    ? "border border-gold/50 bg-accent text-gold"
                    : "text-foreground/85 hover:bg-accent hover:text-gold"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="my-3 h-px bg-border" />
        <Link
          to="/giris"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground/85 hover:bg-accent hover:text-gold"
        >
          <LogOut className="h-4 w-4" /> Çıkış Yap
        </Link>
      </nav>

      <div className="panel p-6 text-center">
        <Sparkles className="mx-auto h-10 w-10 text-gold" />
        <p className="mt-4 font-display text-base leading-snug">
          GÖKYÜZÜNDE
          <br />
          SANA ÖZEL BİR YER
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          Sevdiklerinize unutulmaz bir hediye vermek için hemen parselinizi seçin.
        </p>
        <Link
          to="/parsel-satin-al"
          className="btn-gold mt-5 flex items-center justify-center gap-2 rounded-md py-2.5 text-[11px]"
        >
          PARSEL SATIN AL <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </aside>
  );
}
