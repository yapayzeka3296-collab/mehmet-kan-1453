import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/on-bilgilendirme-formu")({
  head: () => ({
    meta: [
      { title: "Ön Bilgilendirme Formu — MySkyParcel" },
      { name: "description", content: "MySkyParcel mesafeli satış ön bilgilendirme formu." },
    ],
  }),
  component: OnBilgilendirmeFormu,
});

const sections = [
  ["1. SATICI BİLGİLERİ", "Satıcı: MySkyParcel\nAdres: Kuştepe Mah. Mecidiyeköy Yolu Cad. No:18 34318 Şişli/İstanbul\nTelefon: 0541 615 97 43\nE-posta: info.myskyparcel@gmail.com"],
  ["2. ÜRÜN/HİZMETİN TEMEL ÖZELLİKLERİ", "MySkyParcel, dijital ortamda sembolik gökyüzü parseli seçimi ve buna bağlı dijital sertifika/hizmet sunar. Parseller semboliktir; satın alma gerçek taşınmaz, arsa, arazi, gökyüzü veya astronomik cisim üzerinde mülkiyet veya ayni hak sağlamaz."],
  ["3. PAKETLER", "Dijital Parsel Sertifikası — 199 TL\nÖzel Parsel Sertifikası — 499 TL\nPremium Parsel Sertifikası — 999 TL\nPaket kapsamı, satın alma ekranında ayrıca gösterilir. Sipariş anındaki güncel fiyat esas alınır."],
  ["4. TOPLAM BEDEL VE ÖDEME", "Alıcı, sipariş özetinde seçtiği paket, varsa seçtiği parsel ve uygulanabilir diğer ücretleri görür. Ödenecek toplam tutar ödeme adımından önce açıkça gösterilir. Ödeme, yetkili ödeme kuruluşunun güvenli ödeme sayfası üzerinden alınır."],
  ["5. SİPARİŞ VE SÖZLEŞMENİN KURULMASI", "Alıcı bu formdaki bilgileri, Mesafeli Satış Sözleşmesi'ni ve satın alma ekranındaki koşulları inceleyerek sipariş verir. Ödeme kuruluşunun işlemi başarılı olarak onaylamasıyla sipariş alınır ve elektronik sipariş kaydı oluşturulur."],
  ["6. İFA VE TESLİM", "Dijital parsel kaydı ve dijital sertifika, ödeme onayından sonra MySkyParcel hesabında veya sipariş sürecinde bildirilen elektronik yöntemle erişime açılır. Hizmet elektronik ortamda ifa edilir. Fiziksel bir ürün sunulması halinde teslimat yöntemi ve süresi sipariş ekranında ayrıca belirtilir."],
  ["7. CAYMA HAKKI", "Tüketicinin kanundan doğan cayma hakkı saklıdır. Elektronik ortamda anında ifa edilen hizmetler veya ilgili mevzuatta sayılan diğer istisnaların somut siparişe uygulanması halinde, istisnanın kapsamı ve sonuçları satın alma öncesinde tüketiciye açıkça bildirilir ve mevzuatın gerektirdiği onaylar alınır."],
  ["8. İPTAL VE İADE", "İptal ve iade talepleri, yürürlükteki tüketici mevzuatı ile hizmetin ifa durumu ve varsa cayma hakkı istisnaları dikkate alınarak değerlendirilir. İade hakkının bulunduğu durumlarda bedel, mevzuata uygun süre ve yöntemle ödeme yapılan kanala iade edilir."],
  ["9. MÜŞTERİ HİZMETLERİ VE ŞİKÂYETLER", "Alıcı soru, destek ve şikâyetlerini 0541 615 97 43 numaralı telefondan veya info.myskyparcel@gmail.com adresinden iletebilir. Teknik veya sipariş kaynaklı sorunlar makul süre içinde incelenir. Tüketicinin kanuni başvuru hakları saklıdır."],
  ["10. KİŞİSEL VERİLER", "Sipariş sürecinde işlenen kişisel veriler MySkyParcel KVKK Aydınlatma Metni'nde açıklanan amaç ve hukuki sebepler kapsamında işlenir. Ödeme sırasında ödeme kuruluşunun kendi güvenlik ve kişisel veri politikaları da uygulanabilir."],
  ["11. SÖZLEŞME VE KAYITLARA ERİŞİM", "Mesafeli Satış Sözleşmesi ve bu Ön Bilgilendirme Formu satın alma öncesinde elektronik ortamda erişilebilir durumdadır. Sipariş kayıtları elektronik ortamda mevzuata uygun şekilde saklanabilir."],
  ["12. YETKİLİ MERCİLER", "Tüketicinin kanunen sahip olduğu başvuru yolları saklıdır. Tüketici uyuşmazlıklarında Tüketici Hakem Heyetleri ve Tüketici Mahkemelerine ilişkin parasal sınırlar, görev ve yetki yürürlükteki mevzuata göre belirlenir."],
  ["13. YAYIN TARİHİ", "Bu Ön Bilgilendirme Formu 30.05.2026 tarihinde yayınlanmıştır."],
] as const;

function OnBilgilendirmeFormu() {
  return <div className="starfield min-h-screen"><SiteHeader /><main className="mx-auto max-w-5xl px-4 py-12 lg:px-8"><div className="panel p-6 sm:p-10"><h1 className="font-display text-3xl font-bold sm:text-4xl">MYSKYPARCEL ÖN BİLGİLENDİRME FORMU</h1><p className="mt-3 text-xs text-muted-foreground">Sürüm: 1.0 · Yayın Tarihi: 30.05.2026</p><div className="mt-10 space-y-8">{sections.map(([title, text]) => <section key={title}><h2 className="font-display text-lg text-gold">{title}</h2><p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted-foreground">{text}</p></section>)}</div></div></main><SiteFooter /></div>;
}
