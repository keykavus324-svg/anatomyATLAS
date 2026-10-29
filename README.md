# CORPUS·3D — İnteraktif Anatomi Atlası 🫀

> "Arkadaşım MacBook'undaki anatomi uygulamasıyla hava attı" diyenler için:
> tarayıcıda çalışan, kurulum gerektirmeyen, **canlı atan kalbi, akan kanı,
> sınav modu ve meydan okuma butonuyla** gelen 3B anatomi atlası.

## Özellikler

- 🧍 **70 tıklanabilir anatomik yapı** — 20 iskelet, 17 kas, 15 iç organ,
  9 dolaşım, 8 sinir sistemi yapısı + deri. Her biri için Türkçe açıklama,
  Latince ad, işlevler, 🩺 klinik not ve 💡 ilginç bilgi.
- 🎚️ **Katman soyma** — Deri → Kas → İskelet → İç Yapılar arasında yumuşak
  geçiş; sistemleri tek tek aç/kapat veya **SOLO** ile izole et.
- ❤️ **Yaşayan model** — Kalp, sağ paneldeki **canlı EKG çizgisiyle senkron**
  atar; akciğerler nefes alır, diyafram hareket eder; atardamarlarda kırmızı,
  toplardamarlarda mavi kan parçacıkları akar; sinirler boyunca impulslar gezer.
- 🎓 **Sınav Modu** — Adı verilen yapıyı 3B modelde bul! Süre, seri (streak)
  çarpanı, unvanlar (🌱 → 🏆 Anatomi Profesörü) ve tek tıkla
  **"Sonucu Kopyala & Meydan Oku"** butonu.
- 🔍 **Akıllı arama** — Türkçe/Latince, şapkasız-karaktere duyarsız
  ("siyatik", "femur", "gaster" hepsi çalışır). `/` tuşu aramaya odaklar.
- 💥 **Patlat (explode) görünümü**, 🩻 **X-Işını modu**, 🔪 **kesit düzlemi**,
  🏷️ lider çizgili **etiketler**, bölgeye kamera uçuşları.
- 📚 **Hazır ders görünümleri** — Kalp & Büyük Damarlar, Solunum, Sindirim,
  Sinir Sistemi, İskelet/Kas posteri tek tıkla.
- 📸 **Ekran görüntüsü indir** butonu — cevabını hikayene at. 😏

## Çalıştırma

```bash
npm install
npm run dev      # http://localhost:5173
```

Üretim sürümü:

```bash
npm run build    # çıktılar: dist/
npm run preview
```

## Kısayollar

| Tuş | İşlev |
|-----|-------|
| `/` | Aramaya odaklan |
| `1–6` | Sistemleri aç/kapat |
| `R` | Kamerayı ana görünüme döndür |
| `Esc` | Seçimi/pencereyi kapat |
| Sürükle | Döndür · Tekerlek: yakınlaştır · Çift tık: odaklan |

## Teknoloji

- **Three.js** — Tüm vücut (kemikler, iğ-biçimli kaslar, deforme organlar,
  damar/sinir eğrileri, sarmal bağırsaklar) harici model dosyası olmadan
  **tamamen prosedürel** üretilir (`src/body.js`).
- **Vite** — geliştirme sunucusu ve derleme.
- Anatomi içeriği `src/data.js` içinde kolayca genişletilebilir.

> ⚠️ Bu atlas eğitim amaçlı stilize bir modeldir; klinik karar için
> kullanılmaz. Ama arkadaşınızı susturmak için birebirdir.
