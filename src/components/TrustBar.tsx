import { Headphones, Lock, ShieldCheck, Award } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type TrustItem = { icon: LucideIcon; title: string; text: string };

export const DEFAULT_TRUST: TrustItem[] = [
  { icon: ShieldCheck, title: "GÜVENLİ ÖDEME", text: "Ödeme, Shopier'in güvenli ödeme sayfasında tamamlanır." },
  { icon: Lock, title: "SSL / HTTPS", text: "Site ve ödeme yönlendirmesi güvenli HTTPS bağlantısı üzerinden sunulur." },
  { icon: Award, title: "SEMBOLİK PARSEL", text: "Satın alma gerçek taşınmaz veya gökyüzü mülkiyeti oluşturmaz." },
  { icon: Headphones, title: "DESTEK", text: "Sipariş ve destek talepleri için İletişim sayfasından bize ulaşabilirsiniz." },
];

export const SECURITY_TRUST: TrustItem[] = [
  { icon: ShieldCheck, title: "GÜVENLİ ÖDEME", text: "Ödeme işlemi Shopier'in güvenli ödeme sayfasında gerçekleştirilir." },
  { icon: Lock, title: "GÜVENLİ ÖDEME", text: "Ödeme sağlayıcısının desteklediği güvenlik adımları kullanılır." },
  { icon: Award, title: "AÇIK ÜRÜN TANIMI", text: "Sunulan parsel dijital ve sembolik bir koleksiyon kaydıdır." },
  { icon: Headphones, title: "MÜŞTERİ DESTEĞİ", text: "İletişim kanallarımız ve satış sonrası destek bilgilerimiz sitede yer alır." },
];

export function TrustBar({ items = DEFAULT_TRUST }: { items?: TrustItem[] }) {
  return (
    <div className="mx-auto max-w-[1600px] px-4 pb-8 lg:px-8">
      <div className="panel grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.title} className="flex min-w-0 items-start gap-3">
            <item.icon className="mt-0.5 h-6 w-6 shrink-0 text-gold" />
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-[0.08em]">{item.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
