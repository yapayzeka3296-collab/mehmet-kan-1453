import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, Globe, Heart, Star } from "lucide-react";
import heroCity from "@/assets/hero-city.jpg";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { TrustBar } from "@/components/TrustBar";

export const Route = createFileRoute("/hakkimizda")({
  head: () => ({
    meta: [
      { title: "Hakkımızda — MySkyParcel" },
      { name: "description", content: "MySkyParcel'in amacı, çalışma biçimi, sınırları ve sık sorulan sorular." },
      { property: "og:title", content: "Hakkımızda — MySkyParcel" },
      { property: "og:description", content: "MySkyParcel'in amacı, çalışma biçimi ve sık sorulan sorular." },
    ],
  }),
  component: Hakkimizda,
});

const FAQS = [
  { q: "MySkyParcel nedir?", a: "MySkyParcel, kullanıcıların etkileşimli dijital bir gökyüzü haritası üzerinde sembolik parseller seçebildiği, seçilen parselleri dijital bir koleksiyon öğesi olarak görüntüleyebildiği ve uygun paket kapsamında sertifika talep edebildiği bir dijital platformdur." },
  { q: "Satın aldığım parsel gerçek bir arsa veya taşınmaz mıdır?", a: "Hayır. MySkyParcel üzerindeki parseller gerçek bir taşınmaz, arsa, arazi veya tapu niteliğinde değildir. Platformdaki parsel kavramı dijital ve semboliktir; herhangi bir taşınmaz mülkiyeti veya ayni hak devri ifade etmez." },
  { q: "Parsel satın almak bana tapu veya resmi taşınmaz hakkı verir mi?", a: "Hayır. MySkyParcel işlemleri tapu devri, taşınmaz edinimi, arsa tahsisi veya herhangi bir ayni hak oluşturmaz. Kullanıcının edindiği şey platform kapsamındaki dijital parsel kaydı ve satın alınan hizmet/paket kapsamındaki haklardır." },
  { q: "Parselimi nasıl seçerim?", a: "Gökyüzü Haritası üzerinden haritayı açıp uygun bir parseli seçebilirsiniz. Parselin bilgi kutusunda mevcut durumunu ve satın alma için sunulan seçenekleri görüntüleyebilirsiniz." },
  { q: "Hatıra ekleyebilir miyim?", a: "Hatıra özelliği, satın alma tamamlanmış ve parsel kullanıcının hesabına gerçekten aktarılmış olduğunda kullanılabilir. Sadece rezervasyon yapılmış parseller için hatıra ekleme yetkisi verilmez." },
  { q: "Sertifikalar neyi gösterir?", a: "Sertifika, platformdaki dijital parsel kaydına ilişkin seçilen sertifika paketinin bilgilerini gösteren bir belgedir. Sertifika tapu, resmi taşınmaz belgesi veya devlet tarafından düzenlenmiş bir mülkiyet belgesi değildir." },
  { q: "Dijital, Elit ve Premium arasındaki fark nedir?", a: "Üç paket farklı sertifika sunumlarını ve fiziksel teslim seçeneklerini ifade eder. Dijital paket elektronik sertifika; Elit paket dijital sertifikaya ek olarak fiziksel baskı ve gönderim; Premium paket ise premium fiziksel baskı ve çerçeveli sunum gibi ek özellikler içerir. Güncel kapsam ve fiyatlar paketler sayfasında gösterilir." },
  { q: "Sertifikam doğrulanabilir mi?", a: "Evet. Sertifika sisteminde oluşturulan kayıtlar için doğrulama bilgileri ve QR kodu kullanılabilir. Doğrulama ekranındaki kayıt, sertifikanın platformdaki ilgili dijital kayıtla eşleşip eşleşmediğini gösterir." },
  { q: "Koleksiyonum bölümünde neleri görebilirim?", a: "Hesabınıza bağlı satın alınmış parsellerinizi ve bu parseller için oluşturulmuş sertifika kayıtlarını aynı koleksiyon alanından görüntüleyebilirsiniz." },
  { q: "MySkyParcel gerçek bir devlet kurumu veya resmi tapu sistemi midir?", a: "Hayır. MySkyParcel bağımsız bir dijital platformdur. Devlet kurumu, tapu sicili veya resmi taşınmaz kayıt sistemi değildir." },
  { q: "Ödeme ve hizmet koşulları nerede açıklanır?", a: "Güncel ödeme, hizmet, üyelik, gizlilik, KVKK, kullanım ve çerez koşulları sitedeki ilgili hukuki metinlerde açıklanır. Kullanıcıların işlem öncesinde güncel metinleri incelemesi önerilir." },
];

function Hakkimizda() {
  return (
    <div className="starfield min-h-screen">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <img src={heroCity} alt="" aria-hidden loading="lazy" width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/40" />
          <div className="relative mx-auto max-w-3xl px-4 py-20 text-center lg:px-8">
            <h1 className="font-display text-4xl font-bold sm:text-5xl">HAKKIMIZDA</h1>
            <p className="mt-5 text-sm leading-7 text-muted-foreground">
              MySkyParcel, gerçek dünyadaki taşınmazlarla karıştırılmaması gereken, dijital ve sembolik bir gökyüzü parsel deneyimi sunan bir platformdur. Kullanıcılar etkileşimli harita üzerinden sembolik parselleri keşfedebilir, uygun bir parsel seçebilir ve satın alınan hizmet kapsamında dijital koleksiyonlarını oluşturabilir.
            </p>
          </div>
        </section>

        <section className="mx-auto grid max-w-[1600px] gap-6 px-4 py-14 lg:grid-cols-3 lg:px-8">
          {[
            { icon: Star, t: "MİSYONUMUZ", d: "Dijital dünyada kişisel anlam taşıyan, sade ve güvenli bir parsel seçme ve koleksiyon deneyimi sunmak." },
            { icon: Globe, t: "VİZYONUMUZ", d: "Türkiye'nin şehirlerini dijital bir gökyüzü haritası deneyiminde bir araya getirerek geniş bir dijital koleksiyon alanı oluşturmak." },
            { icon: Heart, t: "DEĞERLERİMİZ", d: "Şeffaf iletişim, kullanıcı güvenliği, açık ürün kapsamı ve dijital deneyimin sınırlarını doğru anlatmak." },
          ].map((c) => (
            <article key={c.t} className="panel p-7">
              <c.icon className="h-8 w-8 text-gold" />
              <h2 className="mt-4 font-display text-lg">{c.t}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{c.d}</p>
            </article>
          ))}
        </section>

        <section className="mx-auto max-w-[1200px] px-4 pb-14 lg:px-8">
          <div className="panel border-gold/20 p-6 sm:p-8">
            <h2 className="font-display text-xl text-gold">PLATFORMUN HUKUKİ KAPSAMI</h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              MySkyParcel'de kullanılan "parsel", "sahiplik", "koleksiyon" ve "sertifika" ifadeleri platformun dijital hizmeti içindeki anlamlarıyla kullanılır. Bu ifadeler gerçek bir taşınmazın mülkiyetini, tapu hakkını, arsa tahsisini veya başka bir ayni hakkı temsil etmez. MySkyParcel bir tapu sicili veya resmi taşınmaz kayıt sistemi değildir. Kullanıcı, işlem yapmadan önce satın aldığı ürünün ve hizmetin kapsamını, fiyatını ve yürürlükteki sözleşme koşullarını incelemelidir.
            </p>
            <p className="mt-4 text-xs leading-6 text-muted-foreground/80">
              Bu açıklama kullanıcı bilgilendirmesi amacıyla hazırlanmıştır ve somut bir hukuki görüş veya hukuki danışmanlık yerine geçmez. Uygulanabilir mevzuat ve sözleşme hükümleri her zaman önceliklidir.
            </p>
          </div>
        </section>

        <section id="sss" className="mx-auto max-w-[1200px] scroll-mt-24 px-4 pb-16 lg:px-8">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">SIK SORULAN SORULAR</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">MySkyParcel'in çalışma biçimi, parseller, sertifikalar ve platformun kapsamı hakkında en sık sorulan sorular.</p>
          </div>
          <div className="mt-8 grid gap-3">
            {FAQS.map((item) => (
              <details key={item.q} className="group rounded-xl border border-border bg-background/40 p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-slate-100 [&::-webkit-details-marker]:hidden">
                  <span>{item.q}</span><ChevronDown className="h-5 w-5 shrink-0 text-gold transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-4 max-w-4xl text-sm leading-7 text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <TrustBar />
      <SiteFooter />
    </div>
  );
}
