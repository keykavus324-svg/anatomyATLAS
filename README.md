# TUĞRUL ATLAS — İnteraktif Anatomi Atlası 🫀

> **Muhammet TUĞRUL** tarafından geliştirilen Türkçe, etkileşimli 3B anatomi atlası.
> Katmanlar, rehberli dersler ve sınavlarla insan vücudunu keşfedin.

## Anatomi atlası

Atlas, 2.827 model parçasında 1.643 benzersiz yapı ve yedi anatomik sistem sunar.
1.640 yapıda Türkçe ad, 510'unda ayrıntılı Türkçe bilgi kartı bulunur.

## Dil ve kamera

Üstteki menüden Türkçe, İngilizce veya Arapça seçilebilir; seçim tarayıcıda saklanır.
İngilizce ve Arapça ders turları kısa özetlerdir. Arapça adlar seçili yapılarla
sınırlıdır; çevrilmeyen adlar ve kaynak açıklamaları İngilizce gösterilir.
Modeli sağ fare tuşuyla sürükleyerek veya **Kaydır** düğmesini açıp sol tuşla
sürükleyerek yukarı, aşağı ve yanlara taşıyın. Dokunmatik ekranda iki parmakla
sürükleyebilir veya Kaydır modunda tek parmak kullanabilirsiniz.

Sol ve sağ panelleri üzerlerindeki **Menüyü kapat** düğmesiyle kapatıp
ekran kenarındaki düğmeyle tekrar açabilirsiniz. **Sistemler**, **Bilgi** ve
**Araçlar** düğmeleri de panelleri ayrı ayrı açıp kapatır. **Menüleri Gizle**
tümünü geçici gizler; **Menüleri Göster** önceki panel düzenini geri getirir.
Seçili yapı ve kamera konumu korunur.

## Özellikler

- 🔍 **1.643 yapı için arama** — Türkçe, İngilizce veya Latince (örn. `öçb`,
  `cruciate`, `siyatik`, `gaster`). `/` tuşu aramaya odaklar.
- 🥩 **Kas görünümü** — kasları örten fasya varsayılan olarak gizlidir;
  soldaki **Fasya katmanı** düğmesiyle açılabilir.
- 🎚️ **Katman soyma** — Kaslar → İskelet → İç Yapılar → Tümü;
  sistemleri tek tek aç/kapat veya **SOLO** ile izole et.
- 🃏 **Bilgi kartları** — tıklanan yapının tarafı (Sol/Sağ), Latince adı,
  Türkçe açıklaması + işlevleri + klinik notu, İngilizce kaynak tanımı ve
  Wikipedia bağlantısı.
- 🎯 **Sınav Modu** — "Şu yapıyı bul!" oyunu: süre, seri çarpanı,
  unvanlar (🌱 → 🏆 Anatomi Profesörü) ve tek tıkla
  **"Sonucu Kopyala & Meydan Oku"** butonu.
- ✂️ **Yapı gizle** — seçili yapıyı bilgi kartından gizle; sol/sağ bir parça
  seçilmişse yalnızca o taraf gizlenir. Bilgi panelindeki listeden tek tek veya
  hepsini geri getirebilirsin. Bu işlem modeli kalıcı olarak değiştirmez.
- 💥 **Patlat (explode)**, 🩻 **X-Işını**, 🔪 **üç eksenli kesit** (aksiyal, sagital, koronal), 🏷️ lider
  çizgili **etiketler**, bölgeye kamera uçuşu, hazır ders görünümleri.
- 🎨 **Anatomik atlas sunumu** — mat, sıcak stüdyo ışığı, daha doğal kas
  tonları ve UV haritası olmayan kas yüzeyleri için hafif görsel doku efekti.
  Bu efekt yeni anatomik geometri veya gerçek lif yönü üretmez;
  kaynak geometrisi korunur. Dört ışık/renk teması ve **Dengeli / Yüksek
  detay** ekran çözünürlüğü seçimi tarayıcıda saklanır.
- 🎓 **Rehberli Ders Turları** — "Bir Damla Kanın Yolculuğu", "Bir
  Nefesin İzinde", "Lokmanın Yolculuğu", "Komuta Merkezi", "İskelet
  Turu", "Kas Gücü", "Boşaltım" ve "Görme Yolu": anlatımlı adımlar
  kamerayı yapıdan yapıya uçurur (←/→ ile gez).
  Tur, hedefi görünür kılmak için açık katmanları soldurur ve kesitleri
  geçici olarak açar; kullanıcı değiştirmedikçe bitince kesitler geri yüklenir.
- 🈳 **Üretken Türkçe çeviri motoru** — yön sıfatları, iyelik
  tamlamaları ("Spinal Siniri Ön Kökü"), dişler, damarlar/aort dalları
  gibi isim kalıplarını çözümleyen motor sayesinde 1.643 yapının
  %99,8'i düzgün Türkçe isim taşır.
- ⭐ **Çalışma listesi** — seçilen yapıları yıldızla, yapı listesinde filtrele
  ve yıldızlılardan sınava gir. Favoriler tarayıcıya özgüdür.
- 🔗 **Görünüm paylaşımı** — kamera, model, sistemler, seçim, tema, kesit,
  patlatma ve X-ışını/etiket ayarları bağlantıya eklenir. Çok büyük özel hazır
  görünüm haritaları linke sığmadığında önce bir katman seçmek gerekir.
- 📱 **Kurulabilir ve çevrimdışı** — üretim sürümünde HTTPS (veya localhost)
  üzerinde uygulama menüsünden yüklenebilir. İlk açılışta internet ve yaklaşık
  21 MB önbellek gerekir; tüm dosyaların indirilmesi bitince aynı cihazda
  çevrimdışı açılabilir. Depolama alanı veya tarayıcı politikaları kurulumu
  engelleyebilir; harici fontlar çevrimdışıyken sistem fontuna döner.
- 📸 **Ekran görüntüsü indir** — cevabını hikayene at. 😏

## Çalıştırma

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build    # üretim sürümü: dist/
npm run preview
npm test          # ders referansları ve çevrimdışı önbellek testleri
```

Çevrimdışı önbellek yalnızca üretim derlemesinde etkinleşir; `npm run dev`
çevrimdışı kurulum için kullanılmaz.

## Kısayollar

| Tuş | İşlev |
|-----|-------|
| `/` | Aramaya odaklan |
| `1–7` | Sistemleri aç/kapat |
| `R` | Kamerayı ana görünüme döndür |
| `Esc` | Seçimi / pencereyi kapat |
| Sürükle | Döndür · Tekerlek: yakınlaştır · Çift tık: odaklan |

## Veri ve lisans

Gerçek model, açık kaynak [Z-Anatomy](https://github.com/Z-Anatomy/Models-of-human-anatomy)
projesinin [BodyParts3D](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/)
tabanlı verisidir; glTF paketleri
[nqwrc/3d-anatomy](https://github.com/nqwrc/3d-anatomy) deposundan alınmıştır.
Paket, ticari olmayan kullanım şartları içeren bileşenler de dahil olmak üzere
farklı lisanslı veriler içerir. Bazı kaynakların hakları ve lisans uyumluluğu
ayrıca doğrulanmalıdır. Ayrıntılar: [ATTRIBUTION.md](ATTRIBUTION.md).

## Teknoloji

- **Three.js** (GLTFLoader + Draco) — 7 sistem GLB'si `public/models/` altında (~19 MB).
- **Vite** — geliştirme sunucusu ve derleme.
- Türkçe eşleştirme katmanı: `src/trmap.js`.

> ⚠️ Eğitim amaçlıdır; klinik karar için kullanılmaz.
