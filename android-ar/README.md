# MySkyParcel Gökyüzünü Tara — Gerçek AR

Bu klasör, mevcut web projesinden izole edilmiş Android AR katmanıdır. `src/`, Supabase, ödeme, sepet, kullanıcı paneli ve mevcut Gökyüzünü Tara web ekranı bu aşamada değiştirilmez.

## Aşama 1 — Gerçek Geospatial AR çekirdeği

Bu sürüm ARCore Geospatial API + VPS ile telefon kamerasını gerçek dünya koordinatlarına bağlar. Test amacıyla kullanıcının bulunduğu konumun çevresinde üç sanal parsel oluşturur. Parsel üzerine dokunulduğunda mevcut MySkyParcel satın alma sayfasına şu formatta geçilir:

`https://myskyparcel.com/parsel-satin-al?parcels=<parsel-id>`

> Test parselleri henüz Supabase'den okunmaz. Bu bilinçli bir güvenlik/izolasyon adımıdır. Aşama 2'de gerçek `parcels` verisi bağlanacaktır.

## Google Cloud hazırlığı

1. Google Cloud'da ARCore API'yi etkinleştir.
2. Android uygulaması için Geospatial kullanımına izin veren bir API anahtarı oluştur.
3. Anahtarı kısıtla; Android uygulamasıyla sınırlandır.
4. Android Studio'da `android-ar/` klasörünü ayrı bir proje olarak aç.
5. `android-ar/gradle.properties` dosyasına şunu ekle:

`ARCORE_API_KEY=BURAYA_KISITLI_API_ANAHTARI`

Anahtar kaynak koduna commit edilmemelidir.

## Android Studio

- `android-ar` klasörünü aç.
- Gradle Sync yap.
- ARCore destekli gerçek Android telefonda USB hata ayıklamayı aç.
- Uygulamayı çalıştır.
- Kamera ve kesin konum izinlerini ver.
- Açık alanda birkaç saniye bekle; Geospatial tracking hazır olduğunda test parselleri gökyüzünde görünmelidir.
- Bir parsele dokun; cihaz tarayıcıyı mevcut satın alma sayfasına açmalıdır.

## Aşama 2 — Gerçek MySkyParcel parselleri

- Supabase `parcels` tablosundan yalnızca kullanıcının çevresindeki uygun parseller alınacak.
- `latitude`, `longitude`, `status`, `tier`, `tier_price`, `parcel_number` kullanılacak.
- Satılmış parseller AR'da satılık olarak gösterilmeyecek.
- 81 milyon parselin tamamı cihaza indirilmeyecek.
- Yakınlık/viewport tabanlı sorgu kullanılacak.

## Aşama 3 — Gökyüzü katmanları

Parseller yere değil gökyüzüne yerleştirilecek. Parselin AR yüksekliği MySkyParcel'ın sektör/katman modeline bağlanacak.

## Aşama 4 — Satın alma entegrasyonu

AR yalnızca keşif ve seçim katmanı olacak:

`AR'da gör → parsele dokun → parsel seç → mevcut Parsel Satın Al sayfası`

Mevcut ödeme/sipariş sistemi yeniden yazılmayacak.

## Aşama 5 — Üretim AR

- AR doğruluk göstergesi
- VPS uygunluk kontrolü
- ARCore desteklenmeyen cihazlarda güvenli geri dönüş
- derinlik/occlusion
- daha gerçekçi parsel modelleri
- performans ve pil optimizasyonu
- Android üretim paketi
- daha sonra iOS eşdeğeri
