# CORPUS·3D — İnteraktif Anatomi Atlası 🫀

> "Arkadaşım MacBook'undaki anatomi uygulamasıyla hava attı" diyenler için, cevap:
> açık kaynak **Z-Anatomy**'nin 2.827 parçalı gerçek insan modelini alıp üzerine
> Türkçe arayüz + sınav oyunu + canlı vital simülasyonu giydirdik.

## İki model, tek atlas

| | 🦴 Gerçek Atlas (varsayılan) | ❤️ Stilize Model |
|---|---|---|
| Kaynak | Z-Anatomy / BodyParts3D (açık kaynak) | Bu proje için prosedürel üretim |
| Yapı | **2.827 parça · 1.643 benzersiz yapı** | 70 temel yapı |
| Özellik | Gerçek anatomik model, Latince, tanımlar | Atan kalp, akan kan, nefes, sinir implusları |
| Türkçe | **1.640 yapıda Türkçe ad (%99,8)**, 510'unda zengin Türkçe kart
  (açıklama + işlev + klinik + ilginç bilgi) | Tamamı Türkçe |
| Sistem | İskelet, Eklemler, Kaslar, Viserler, Dolaşım, Lenf, Sinir | Deri, Kas, İskelet, Organ, Dolaşım, Sinir |

Soldaki **Gerçek Atlas / Stilize Model** geçişiyle dilediğini seç.

## Özellikler

- 🔍 **1.643 yapı için arama** — Türkçe, İngilizce veya Latince (örn. `öçb`,
  `cruciate`, `siyatik`, `gaster`). `/` tuşu aramaya odaklar.
- 🎚️ **Katman soyma** — Kaslar → İskelet → İç Yapılar → Tümü;
  sistemleri tek tek aç/kapat veya **SOLO** ile izole et.
- 🃏 **Bilgi kartları** — tıklanan yapının tarafı (Sol/Sağ), Latince adı,
  Türkçe açıklaması + işlevleri + klinik notu, İngilizce kaynak tanımı ve
  Wikipedia bağlantısı.
- 🎯 **Sınav Modu** — "Şu yapıyı bul!" oyunu: süre, seri çarpanı,
  unvanlar (🌱 → 🏆 Anatomi Profesörü) ve tek tıkla
  **"Sonucu Kopyala & Meydan Oku"** butonu.
- ❤️ **Canlı vitaller** — EKG ile senkron nabız; gerçek modelde kalp
  kası ritimle ışıldar, stilize modelde kalp gerçekten atar, akciğerler
  nefes alır, damarlarda kan, sinirlerde impuls akar.
- 💥 **Patlat (explode)**, 🩻 **X-Işını**, 🔪 **kesit düzlemi**, 🏷️ lider
  çizgili **etiketler**, bölgeye kamera uçuşu, hazır ders görünümleri.
- 🎓 **Rehberli Ders Turları** — "Bir Damla Kanın Yolculuğu", "Bir
  Nefesin İzinde", "Lokmanın Yolculuğu", "Komuta Merkezi", "İskelet
  Turu": anlatımlı adımlar kamerayı yapıdan yapıya uçurur (←/→ ile gez).
  İki modelde de çalışır.
- 🈳 **Üretken Türkçe çeviri motoru** — yön sıfatları, iyelik
  tamlamaları ("Spinal Siniri Ön Kökü"), dişler, damarlar/aort dalları
  gibi isim kalıplarını çözümleyen motor sayesinde 1.643 yapının
  %99,8'i düzgün Türkçe isim taşır.
- 📸 **Ekran görüntüsü indir** — cevabını hikayene at. 😏

## Çalıştırma

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build    # üretim sürümü: dist/
npm run preview
```

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
Bazı bileşenler ticari olmayan lisans taşıdığından veri paketinin geçerli
lisansı **CC BY-NC-SA 4.0**'tir. Ayrıntılar: [ATTRIBUTION.md](ATTRIBUTION.md).

## Teknoloji

- **Three.js** (GLTFLoader + Draco) — 7 sistem GLB'si `public/models/` altında (~19 MB).
- **Vite** — geliştirme sunucusu ve derleme.
- Türkçe eşleştirme katmanı: `src/trmap.js` (katkıya açık! daha 1000+ yapı
  Türkçeleştirilmeyi bekliyor).
- Stilize canlı model tamamen prosedüreldir: `src/body.js`.

> ⚠️ Eğitim amaçlıdır; klinik karar için kullanılmaz. Ama arkadaşınızı
> susturmak için birebirdir.
