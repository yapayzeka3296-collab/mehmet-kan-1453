import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, ShoppingCart, X, Store, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "./Logo";

const NAV_LINKS = [
  { label: "Ana Sayfa", to: "/" },
  { label: "Gökyüzü Haritası", to: "/gokyuzu-haritasi" },
  { label: "Parsel Satın Al", to: "/parsel-satin-al" },
  { label: "Koleksiyonum", to: "/parsellerim", requiresAuth: true },
  { label: "Dijital Sertifika", to: "/sertifikalarim", requiresAuth: true },
  { label: "Sertifika Doğrula", to: "/sertifika-dogrula" },
  { label: "Hakkımızda", to: "/hakkimizda" },
  { label: "İletişim", to: "/iletisim" },
] as const;

export function SiteHeader() {
  const { user, loading: authLoading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);

  const isAuthenticated = !authLoading && !!user;
  const visibleNavLinks = NAV_LINKS.filter((item) => !item.requiresAuth || isAuthenticated);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); setOpen(false); return; }
      if (event.key !== "Tab" || !drawerRef.current) return;
      const focusable = Array.from(drawerRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter((element) => !element.hasAttribute("aria-hidden"));
      if (focusable.length === 0) return;
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => { document.removeEventListener("keydown", handleKeyDown); document.body.style.overflow = previousOverflow; menuButtonRef.current?.focus(); };
  }, [open]);

  const closeMenu = () => setOpen(false);
  const handleSignOut = async () => {
    const result = await signOut();
    if (result.success) { closeMenu(); await navigate({ to: "/" }); }
  };

  return (
    <header className="sticky top-0 z-40 h-[80px] w-full border-b border-[#1E293B] bg-[#050B1A]/90 shadow-lg shadow-black/20 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex shrink-0 items-center"><Logo /></div>
        <nav aria-label="Ana navigasyon" className="hidden items-center gap-3 xl:flex 2xl:gap-5">
          {visibleNavLinks.map((item) => <Link key={item.to} to={item.to} className="relative whitespace-nowrap text-xs font-medium text-slate-300 transition-colors duration-200 hover:text-[#D4AF37] 2xl:text-sm" activeProps={{ className: "text-[#D4AF37] after:absolute after:bottom-[-6px] after:left-0 after:h-[2px] after:w-full after:bg-[#D4AF37]" }}>{item.label}</Link>)}
          {isAdmin && <Link to="/yonetim" className="relative flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold text-[#D4AF37] transition-colors duration-200 hover:text-white 2xl:text-sm" activeProps={{ className: "text-white" }}><ShieldCheck className="h-4 w-4" /> Yönetim</Link>}
        </nav>
        <div className="hidden items-center gap-3 xl:flex 2xl:gap-4">
          <Link to="/pazar-yeri" aria-label="Pazar Yeri" title="Pazar Yeri" className="flex items-center gap-1.5 p-2 text-xs font-medium text-slate-300 transition-colors duration-200 hover:text-[#D4AF37] 2xl:text-sm"><Store className="h-5 w-5" /> <span>PAZAR YERİ</span></Link>
          <button type="button" aria-label="Sepet (henüz etkin değil)" title="Sepet özelliği sonraki entegrasyonda etkinleştirilecek" className="p-2 text-slate-300 transition-colors duration-200 hover:text-[#D4AF37]"><ShoppingCart className="h-5 w-5" /></button>
          {isAuthenticated ? (<><Link to="/panelim" className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition-colors duration-200 hover:border-[#D4AF37] hover:text-[#D4AF37]">Panelim</Link><button type="button" onClick={() => void handleSignOut()} className="rounded-lg bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-black transition-colors duration-200 hover:bg-[#c29f2e]">Çıkış Yap</button></>) : (<><Link to="/giris" className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition-colors duration-200 hover:border-[#D4AF37] hover:text-[#D4AF37]">Giriş Yap</Link><Link to="/kayit-ol" className="rounded-lg bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-black transition-colors duration-200 hover:bg-[#c29f2e]">Üye Ol</Link></>)}
        </div>
        <div className="flex items-center gap-2 xl:hidden">
          <Link to="/pazar-yeri" aria-label="Pazar Yeri" title="Pazar Yeri" className="p-2 text-slate-300 transition-colors duration-200 hover:text-[#D4AF37]"><Store className="h-6 w-6" /></Link>
          <button type="button" aria-label="Sepet (henüz etkin değil)" title="Sepet özelliği sonraki entegrasyonda etkinleştirilecek" className="p-2 text-slate-300 transition-colors duration-200 hover:text-[#D4AF37]"><ShoppingCart className="h-6 w-6" /></button>
          {!open && <button ref={menuButtonRef} type="button" aria-label="Menüyü aç" aria-expanded="false" aria-controls="mobile-navigation" onClick={() => setOpen(true)} className="p-2 text-slate-300 transition-colors duration-200 hover:text-[#D4AF37]"><Menu className="h-7 w-7" /></button>}
        </div>
      </div>

      {open && <><div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm xl:hidden" onClick={closeMenu} aria-hidden="true" /><aside ref={drawerRef} id="mobile-navigation" role="dialog" aria-modal="true" aria-label="Site menüsü" className="fixed inset-y-0 right-0 z-50 flex h-[100dvh] max-h-[100dvh] w-[min(320px,calc(100vw-24px))] flex-col overflow-hidden border-l border-[#1E293B] bg-[#050B1A] p-6 pb-[calc(1rem+env(safe-area-inset-bottom))] xl:hidden"><div className="min-h-0 flex-1 overflow-y-auto"><div className="flex items-center justify-between border-b border-[#1E293B] pb-6"><span className="text-lg font-bold text-white">Menü</span><button ref={closeButtonRef} type="button" onClick={closeMenu} aria-label="Menüyü kapat" className="p-1 text-slate-400 hover:text-white"><X className="h-6 w-6" /></button></div><nav aria-label="Mobil site navigasyonu" className="mt-6 flex flex-col gap-4 pb-4">{visibleNavLinks.map((item) => <Link key={item.to} to={item.to} onClick={closeMenu} className="text-base font-medium text-slate-300 transition-colors duration-200 hover:text-[#D4AF37]" activeProps={{ className: "font-semibold text-[#D4AF37]" }}>{item.label}</Link>)}{isAdmin && <Link to="/yonetim" onClick={closeMenu} className="flex items-center gap-2 text-base font-semibold text-[#D4AF37] transition-colors duration-200 hover:text-white"><ShieldCheck className="h-5 w-5" /> Yönetim</Link>}<Link to="/pazar-yeri" onClick={closeMenu} className="text-base font-medium text-slate-300 transition-colors duration-200 hover:text-[#D4AF37]">Pazar Yeri</Link></nav></div><div className="shrink-0 flex flex-col gap-2 border-t border-[#1E293B] bg-[#050B1A] pt-3">{isAuthenticated ? (<><Link to="/panelim" onClick={closeMenu} className="w-full rounded-lg border border-slate-700 py-2.5 text-center text-sm font-medium text-slate-200 transition-colors duration-200 hover:border-[#D4AF37] hover:text-[#D4AF37]">Panelim</Link>{isAdmin && <Link to="/yonetim" onClick={closeMenu} className="w-full rounded-lg border border-[#D4AF37] py-2.5 text-center text-sm font-semibold text-[#D4AF37]">Yönetim Paneli</Link>}<button type="button" onClick={() => void handleSignOut()} className="w-full rounded-lg bg-[#D4AF37] py-2.5 text-center text-sm font-semibold text-black transition-colors duration-200 hover:bg-[#c29f2e]">Çıkış Yap</button></>) : (<><Link to="/giris" onClick={closeMenu} className="w-full rounded-lg border border-slate-700 py-2.5 text-center text-sm font-medium text-slate-200 transition-colors duration-200 hover:border-[#D4AF37] hover:text-[#D4AF37]">Giriş Yap</Link><Link to="/kayit-ol" onClick={closeMenu} className="w-full rounded-lg bg-[#D4AF37] py-2.5 text-center text-sm font-semibold text-black transition-colors duration-200 hover:bg-[#c29f2e]">Üye Ol</Link>)}</div></aside></>}
    </header>
  );
}
