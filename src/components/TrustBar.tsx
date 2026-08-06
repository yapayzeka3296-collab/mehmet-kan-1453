import { Award, Headphones, Lock, ShieldCheck, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type TrustItem = { icon: LucideIcon; title: string; text: string };

export const DEFAULT_TRUST: TrustItem[] = [
  { icon: Lock, title: "GÜVENLİ ÖDEME", text: "256 Bit SSL ile korunur" },
  { icon: Truck, title: "HIZLI TESLİMAT", text: "Dijital ürün anında teslim" },
  { icon: Headphones, title: "7/24 CANLI DESTEK", text: "Her zaman yanınızdayız!" },
  { icon: Award, title: "KOLEKSİYONUNA KAT", text: "Gökyüzündeki yerini koleksiyonuna ekle" },
];

export const SECURITY_TRUST: TrustItem[] = [
  { icon: ShieldCheck, title: "256 BİT SSL GÜVENLİK", text: "Tüm bilgileriniz 256 Bit SSL ile korunur." },
  { icon: Lock, title: "GÜVENLİ ÖDEME", text: "Güvenli ödeme altyapısı ile korunur." },
  { icon: Truck, title: "HIZLI TESLİMAT", text: "Sertifikanız dijital olarak anında teslim edilir." },
  { icon: Headphones, title: "7/24 DESTEK", text: "Her zaman yanınızdayız. Sorularınız için bize ulaşın." },
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
