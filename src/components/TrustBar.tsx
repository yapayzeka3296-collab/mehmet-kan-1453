import { Award, Headphones, Lock, ShieldCheck, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type TrustItem = { icon: LucideIcon; title: string; text: string };

export const DEFAULT_TRUST: TrustItem[] = [
  { icon: Lock, title: "GÜVENLİ ALTYAPI", text: "Güvenlik altyapısı yayın öncesi ayrıca doğrulanmalıdır" },
  { icon: Truck, title: "HIZLI TESLİMAT", text: "Dijital teslimat akışı yayın öncesi doğrulanmalıdır" },
  { icon: Headphones, title: "DESTEK", text: "Destek bilgileri için iletişim sayfasını ziyaret edin" },
  { icon: Award, title: "KOLEKSİYONUNA KAT", text: "Gökyüzündeki yerini koleksiyonuna ekle" },
];

export const SECURITY_TRUST: TrustItem[] = [
  { icon: ShieldCheck, title: "GÜVENLİK ALTYAPISI", text: "Teknik güvenlik yapılandırması yayın öncesi doğrulanmalıdır." },
  { icon: Lock, title: "GÜVENLİ ÖDEME", text: "Ödeme altyapısı ve sağlayıcı doğrulaması yayın öncesi tamamlanmalıdır." },
  { icon: Truck, title: "HIZLI TESLİMAT", text: "Sertifika teslim akışı yayın öncesi doğrulanmalıdır." },
  { icon: Headphones, title: "DESTEK", text: "Destek bilgileri için iletişim sayfasını ziyaret edin." },
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
