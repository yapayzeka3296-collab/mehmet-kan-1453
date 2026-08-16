import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Globe2, Heart, ShieldCheck, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { TrustBar } from "@/components/TrustBar";

export const Route = createFileRoute("/nasil-calisir")({
  head: () => ({ meta: [{ title: "MySkyParcel Nedir? — MySkyParcel" }, { name: "description", content: "MySkyParcel'in dijital ve sembolik parsel sistemi, sertifikaları ve platform kapsamı hakkında bilgi." }, { property: "og:title", content: "MySkyParcel Nedir?" }, { property: "og:description", content: "MySkyParcel'in dijital parsel deneyiminin nasıl çalıştığını ve ne ifade ettiğini öğrenin." }] }),
  component: MySkyParcelNedir,
});

const POINTS = [
  { icon: Globe2, title: "DİJİTAL GÖKYÜZÜ HARİTASI", text: "Platformdaki şehirler ve parseller, etkileşimli dijital harita üzerinde keşfedilen sembolik alanlardır." },
  { icon: Sparkles, title: "DİJİTAL KOLEKSİYON", text: "Satın alma tamamlandığında parsel kaydı hesabınıza bağlanır ve Koleksiyonum bölümünde görüntülenebilir." },
  { icon: CheckCircle2, title: "SERTİFİKA DENEYİMİ", text: "Uygun paket kapsamında parsel bilgileriyle kişiselleştirilen dijital veya fiziksel sertifika seçenekleri sunulur." },
  { icon: Heart, title: "ANLAMLI HATIRA", text: "Satın alınmış parsel sahipleri, platform kuralları kapsamında parsellerine kişisel bir hatıra ekleyebilir." },
  { icon: ShieldCheck, title: "AÇIK SINIRLAR", text: "MySkyParcel gerçek bir taşınmaz, tapu sicili veya resmi mülkiyet sistemi değildir; parseller dijital ve semboliktir." },
];

function MySkyParcelNedir() {
  return (
    <div className="starfield min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-[1200px] px-4 py-12 lg:px-8 lg:py-16">
        <header className="text-center">
          <p className="text-xs font-semibold tracking-[0.2em] text-gold">MY SKY PARCEL</p>
          <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">MYSKYPARCEL NEDİR?</h1>
          <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-muted-foreground">MySkyParcel, kullanıcıların dijital bir gökyüzü haritası üzerinde sembolik parselleri keşfetmesine, seçmesine ve satın alınan hizmet kapsamında dijital bir koleksiyon oluşturmasına imkân veren bir platformdur. Amaç, fiziksel bir taşınmaz sunmak değil; dijital dünyada kişisel anlam taşıyan bir parsel deneyimi ve sertifika sunmaktır.</p>
        </header>

        <section className="mt-8 grid gap-5 md:grid-cols-2">
          {POINTS.map((point) => (
            <article key={point.title} className="panel p-6">
              <point.icon className="h-8 w-8 text-gold" />
              <h2 className="mt-4 font-display text-lg">{point.title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{point.text}</p>
            </article>
          ))}
        </section>

        <section className="panel mt-6 border-cyan-300/20 bg-slate-950/45 p-6 shadow-lg backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-gold" />
            <div className="min-w-0">
              <h2 className="font-display text-base font-bold tracking-[0.08em] text-cyan-100">81 MİLYON BENZERSİZ PARSEL</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-white">Her parsel kendine özel bir parsel koduyla oluşturulur. Bir parsel yalnızca bir kişi tarafından satın alınabilir. Satın alınan parsel, sahibinin hesabına kaydedilir ve aynı parsel kodu başka bir parsel için yeniden oluşturulamaz.</p>
            </div>
          </div>
        </section>

        <section className="panel mt-6 border-gold/20 p-6 sm:p-8">
          <h2 className="font-display text-xl text-gold">ÖNEMLİ: PARSELİN HUKUKİ NİTELİĞİ</h2>
          <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground">
            <p>MySkyParcel'deki parseller gerçek bir arsa, arazi, taşınmaz veya tapu değildir. Platformdaki "parsel" ve "sahiplik" ifadeleri yalnızca dijital hizmet ve kullanıcı hesabı kapsamındaki kayıt ilişkisini anlatır.</p>
            <p>Bir parselin satın alınması; tapu devri, taşınmaz mülkiyeti, ayni hak, imar hakkı, arsa tahsisi veya devlet nezdinde herhangi bir taşınmaz kaydı oluşturmaz. MySkyParcel bir devlet kurumu, tapu sicili veya resmi taşınmaz kayıt sistemi değildir.</p>
            <p>Sertifikalar da bu dijital hizmet kapsamındaki kayıtları belgeleyen ürünlerdir; resmi tapu veya devlet tarafından düzenlenmiş mülkiyet belgesi niteliğinde değildir.</p>
            <p className="text-xs text-muted-foreground/80">Bu metin genel kullanıcı bilgilendirmesi amacıyla hazırlanmıştır ve hukuki danışmanlık veya somut bir hukuki görüş olarak değerlendirilmemelidir. İşlemler için yürürlükteki sözleşme ve ilgili mevzuat hükümleri geçerlidir.</p>
          </div>
        </section>

        <section className="mt-10 text-center">
          <h2 className="font-display text-2xl">NASIL İLERLERSİNİZ?</h2>
          <div className="mx-auto mt-6 grid max-w-4xl gap-3 sm:grid-cols-4">{["Gökyüzü Haritasını Aç", "Parselini Seç", "Paketini Belirle", "Koleksiyonuna Ekle"].map((step, index) => <div key={step} className="panel p-4"><span className="text-xs text-gold">0{index + 1}</span><p className="mt-2 text-xs font-medium">{step}</p></div>)}</div>
        </section>
      </main>
      <TrustBar />
      <SiteFooter />
    </div>
  );
}
