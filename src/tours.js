// Rehberli Ders Turları — adımlar INFO id ile tanımlanır (iki modelde de çözülür);
// `real` verilirse Gerçek Atlas modunda o yapı anahtarı kullanılır (daha hassas odak).
export const TOURS = [
  {
    id: 'kalp', icon: '🫀', title: 'Bir Damla Kanın Yolculuğu',
    desc: 'Kirli kandan temiz kana: kalbin dört kapısı',
    steps: [
      { info: 'vena_cava', title: 'Yolculuk Başlıyor: Ana Toplardamarlar', text: 'Küçük bir kan damlası düşün: oksijenini dokulara bıraktı, karbondioksitle yüklü. Üst ve alt ana toplardamarlardan (vena cava) kalbe geri dönüyor. Toplam yolculuğumuz yaklaşık 60 saniye sürecek — kanın tüm vücudu dolaşıp kalbe dönüşü bu kadar sürer.' },
      { info: 'heart', real: 'Right atrium', title: 'Sağ Kulakçık', text: 'Damlamız kalbin sağ üst odacığı olan sağ kulakçığa (atrium) boşalır. Burası bir bekleme salonu gibidir: kan burada toplanır, sonra üç yaprakçıklı triküspit kapaktan aşağı süzülür.' },
      { info: 'heart', real: 'Right ventricle', title: 'Sağ Karıncık', text: 'Sağ karıncık kasıldığında damlamızı akciğerlere doğru fırlatır. Bu odacığın işi nispeten hafif: kanı yalnızca yakındaki akciğerlere göndermesi yeter. Bu yüzden duvarı sol karıncıktan incedir.' },
      { info: 'pulmonary', title: 'Akciğer Atardamarı', text: 'İşte istisna damar: akciğer atardamarı, kirli (oksijensiz) kan taşıyan tek atardamardır. Damlamız burada sağ ve sol akciğere ayrılan dallardan birine girer. Varış noktası: hava kesecikleri.' },
      { info: 'lungs', title: 'Akciğerlerde Arınma', text: 'Alveollerde büyü gerçekleşir: damlamız karbondioksitini bırakır, taze oksijeni yüklenir ve rengi koyu bordodan parlak kırmızıya döner. İki akciğerde toplam ~480 milyon alveol bu alışverişi yapar.' },
      { info: 'heart', real: 'Left atrium', title: 'Sol Kulakçık', text: 'Temizlenen kan, temiz kan taşıyan yegâne toplardamarlar olan dört akciğer toplardamarıyla kalbin sol üst odacığına döner. Artık büyük sefer için hazır.' },
      { info: 'heart', real: 'Left ventricle', title: 'Sol Karıncık — En Güçlü Pompa', text: 'Burası kalbin şampiyonu: sol karıncığın kas duvarı sağın yaklaşık üç katı kalındır, çünkü kanı baştan ayağa tüm vücuda basmak zorundadır. Her kasılmada ~70 ml kan fırlatır; günde ~100.000 kez.' },
      { info: 'aorta', title: 'Aort: Ana Otoban', text: 'Damlamız vücudun en büyük atardamarı aorttan yola çıkar: önce kalbin kendisine (koronerler), sonra beyne, kollara, organlara ve bacaklara... Oksijenini bırakıp ana toplardamarlardan geri dönecek ve tur başa saracak. İşte çift dolaşımın hikâyesi! 🎉' },
    ],
  },
  {
    id: 'solunum', icon: '🌬️', title: 'Bir Nefesin İzinde',
    desc: 'Hava içeri girerken neler olur?',
    steps: [
      { info: 'trachea', title: 'Soluk Borusu (Trakea)', text: 'Nefes burun ve ağızdan girip gırtlaktan geçer, sonra soluk borusuna ulaşır. Trakeanın C harfi biçimindeki kıkırdak halkaları bu borunun hiç kapanmadan açık kalmasını sağlar — elektrik süpürgesi hortumu gibi.' },
      { info: 'trachea', real: 'Right main bronchus', title: 'Ana Bronşlar', text: 'Trakea göğsün ortasında (karina noktasında) sağ ve sol ana bronşa ayrılır. Sağ ana bronş daha dik ve geniştir; bu yüzden kaçan yabancı cisimler (fıstık gibi) genelde sağ akciğere gider — doktorların klasik sınav sorusudur.' },
      { info: 'lungs', title: 'Akciğerler ve Alveoller', text: 'Bronşlar bir ağaç gibi ~23 kez dallanarak milyonlarca hava keseciğine (alveol) ulaşır. Alveollerin toplam yüzeyi bir tenis kortu kadardır (~70 m²). Oksijen burada kana, karbondioksit de havaya geçer.' },
      { info: 'diaphragm', title: 'Diyafram: Nefesin Motoru', text: 'Göğsün tabanındaki bu kubbe kas kasılınca düzleşir, göğüs hacmi büyür ve hava içeri dolar. Dinlenirken solunumun %75’ini tek başına diyafram yapar. Sınıfta arkana yaslanıp derin nefes aldığında karnının şişmesi onun eseridir.' },
      { info: 'ribs', title: 'Göğüs Kafesi', text: '12 çift kaburga, kostalar arası kaslarla birlikte bir körük gibi çalışır: kaburgalar yükselip açıldıkça göğüs genişler. Aynı kafes; kalp ve akciğerleri bir zırh gibi korur. Bir nefeste ortalama yarım litre hava alırız; günde ~20.000 kez.' },
    ],
  },
  {
    id: 'sindirim', icon: '🍽️', title: 'Lokmanın Yolculuğu',
    desc: '9 metrelik sindirim tüneli',
    steps: [
      { info: 'esophagus', title: 'Yemek Borusu', text: 'Lokma yutulduktan sonra yer çekimine bile ihtiyaç duymaz: yemek borusunun dalga dalga kasılmaları (peristaltizm) onu ~8 saniyede mideye taşır. Baş aşağı dursan bile su içebilirsin, kanıtı bu kasılmalardır.' },
      { info: 'stomach', title: 'Mide: Asit Banyosu', text: 'Mide, pH’ı 1,5–2 olan hidroklorik asitle lokmayı kimyasal olarak parçalar ve kaslarıyla çalkalayarak kimus denen bulamaca çevirir. Kendini sindirmemek için iç yüzeyini üç günde bir yeniler.' },
      { info: 'liver', title: 'Karaciğer: Kimya Fabrikası', text: 'Vücudun en büyük iç organı (~1,5 kg). Sindirim için safra üretir, kandan toksinleri süzer, glikozu depolar, protein sentezler... 500’den fazla görevi var. Bağırsaktan gelen besin yüklü kan önce mutlaka buraya uğrar.' },
      { info: 'gallbladder', title: 'Safra Kesesi', text: 'Karaciğerin altındaki bu küçük kese safrayı depolar ve yoğunlaştırır. Yağlı bir yemek geldiğinde kasılır; safra, yağ damlacıklarını bulaşık deterjanı gibi minik parçalara ayırır. Kese alınınca da yaşanır ama yağlı yemekler zorlar.' },
      { info: 'pancreas', title: 'Pankreas: Çift Görevli', text: 'Pankreas iki iş birden yapar: enzim kokteylini ince bağırsağa boşaltır (karbonhidrat, yağ ve proteini parçalar), ayrıca insülin hormonunu kana vererek kan şekerini yönetir. Diyabet, bu ikinci görevin hastalığıdır.' },
      { info: 'small_intestine', title: 'İnce Bağırsak: Emilim Şampiyonu', text: 'Yaklaşık 6 metre! İç yüzeyindeki villus ve mikrovilluslar emilim alanını bir tenis kortunun ~3 katına çıkarır. Besinlerin kana geçişi asıl burada olur; lokma artık iyice özümsenmiş bir sıvıdır.' },
      { info: 'large_intestine', title: 'Kalın Bağırsak: Su Geri Kazanımı', text: 'Son durak (~1,5 m): kalın bağırsak kalan suyla mineralleri geri emer, trilyonlarca dost bakteriye ev sahipliği yapar (onlar da bize K vitamini üretir). Geriye kalan artık yolculuğun sonuna hazırdır. Afiyet olsun! 🎉' },
    ],
  },
  {
    id: 'sinir', icon: '🧠', title: 'Komuta Merkezi: Sinir Sistemi',
    desc: 'Beyinden parmak uçlarına',
    steps: [
      { info: 'brain', title: 'Beyin', text: 'Yaklaşık 1,4 kg ve 86 milyar nöron. Kıvrımlı kabuğu (korteks) düşünce, hafıza, dil ve bilincin evi. Vücut ağırlığının %2’si olmasına rağmen oksijenin %20’sini tüketir — sürekli açık bir süper bilgisayar.' },
      { info: 'cerebellum', real: 'Anterior quadrangular lobule', title: 'Beyincik', text: 'Beynin arkasındaki bu "küçük beyin", aslında nöronların yarıdan fazlasını barındırır! Görevi ince hareket koordinasyonu ve denge: bisiklete binmeyi, piyano çalmayı unutamayışımızın sırrı buradadır.' },
      { info: 'brainstem', title: 'Beyin Sapı', text: 'En hayati kavşak: solunum, kalp atışı, kan basıncı ve uyanıklık buradan yönetilir. Beyinden çıkan 12 kafa sinirinin çoğu da beyin sapından doğar. Omurga ile beyni birbirine bağlar.' },
      { info: 'spinal_cord', real: 'White matter of spinal cord', title: 'Omurilik', text: 'Ortalama 45 cm’lik bu kablo, beyin ile vücut arasında çift yönlü otoyol işlevi görür. Reflekslerde kendi başına da karar verir: sıcak sobadan elini çekerken sinyal beyne varmadan kas harekete geçer.' },
      { info: 'brachial_plexus', real: 'Middle trunk of brachial plexus', title: 'Kol Ağı (Brakiyal Pleksus)', text: 'Boyundan kola giden sinirler burada bir elektrik santrali gibi yeniden düzenlenir. Bu ağ yüzünden bir sinirin zedelenmesi elin belli hareketlerini bozar; doktorlar el duruşuna bakıp hangi sinirin yaralandığını anlar.' },
      { info: 'sciatic', real: 'Sciatic nerve', title: 'Siyatik Sinir', text: 'Vücudun en kalın ve en ünlü siniri — başparmağın kadar kalın. Kalçadan bacağın arkasına iner. Bel fıtığında sıkışırsa bacak boyunca elektrik çarpar gibi ağrı yapar; "siyatiğim tuttu" sözü buradan gelir.' },
      { info: 'optic_nerve', real: 'Optic nerve (II)', title: 'Görme Siniri', text: 'Gözün arkasından çıkan bu sinir aslında sinir değil, beynin bir uzantısıdır: retinadaki 1,2 milyon lif, görüntüyü beynin arka lobuna taşır. Kör nokta da tam bu sinirin gözden çıktığı yerdedir. Komuta turu tamam! 🎉' },
    ],
  },
  {
    id: 'iskelet', icon: '🦴', title: 'İskelet Turu: Baştan Ayağa',
    desc: '206 kemiğe hızlı bakış',
    steps: [
      { info: 'cranium', real: 'Frontal bone', title: 'Kafatası', text: '22 kemiğin kilitli bulmacası. Bebeklerde kemikler arası boşluklar (bıngıldak) doğuma ve beyin büyümesine izin verir. Yetişkinde kaynaklı eklemler beyni miğfer gibi korur. Hareket eden tek kafa kemiği alt çenedir.' },
      { info: 'ribs', title: 'Kaburgalar ve Göğüs Kemikleri', text: '12 çift kaburganın üst 7’si göğüs kemiğine (sternum) doğrudan bağlanır, alt ikisi "yüzer" durumdadır. Bu kafes hem korur hem nefes alıp vermeye katılır.' },
      { info: 'humerus', title: 'Kol Kemiği (Humerus)', text: 'Omuzdan dirseğe tek kemik. Dirseğini bir yere vurduğunda hissettiğin o elektriklenme aslında kemik değil, kemiğin arkasındaki olukta seyreden ulnar sinirin ta kendisidir.' },
      { info: 'hand_bones', title: 'El Kemikleri', text: 'Tek elde 27 kemik! Vücuttaki 206 kemiğin dörtte birinden fazlası el ve ayaklardadır. 8 bilek kemiği, 5 tarak kemiği ve 14 parmak kemiği; alet kullanan tür olmamızın iskeletsel kanıtı.' },
      { info: 'pelvis', title: 'Leğen (Pelvis)', text: 'Gövdenin yükünü bacaklara aktaran halka. İki ayak üzerinde yürümemize ve büyük beyinli bebeklerin doğumuna göre evrimleşmiştir. Adli tıpta iskeletten cinsiyet en güvenilir şekilde pelvisten anlaşılır.' },
      { info: 'femur', title: 'Uyluk Kemiği (Femur)', text: 'Vücudun en uzun ve en güçlü kemiği: boyunun yaklaşık dörtte biri. Metrelerce yükseklikten bile kırılmadan dayanabilir; kırılması ciddi kan kaybına yol açtığı için acil tıpta korkulan kırıklardandır.' },
      { info: 'patella', title: 'Diz Kapağı (Patella)', text: 'Bir tendonun içinde oturan en büyük sesamoid kemik: makara gibi çalışarak uyluk kasının (kuadriseps) kuvvetini %30’a kadar artırır. Bebekler diz kapaksız doğar, kemik 3-5 yaşında sertleşir.' },
      { info: 'foot_bones', title: 'Ayak Kemikleri', text: '26 kemik, 33 eklem. Ayağın kemerleri bir amortisör gibi her adımda vücut ağırlığının kat kat fazlasını sünger. Günde ortalama 8-10 bin adım; ömür boyu Dünya çevresinde ~4 tur. İskelet turu bitti — 206 kemiğe saygı duruşu! 🎉' },
    ],
  },
  {
    id: 'kas', icon: '💪', title: 'Kas Gücü: Şampiyonlar Ligi',
    desc: 'En güçlü, en büyük, en çalışkan kaslar',
    steps: [
      { info: 'masseter', real: 'Superficial part of masseter', title: 'Çiğneme Şampiyonu: Masseter', text: 'Güçlü bir çiğneme kasıdır; çeneyi kapatarak ısırma kuvveti üretir. Dişlerini sıktığında çenende şişen kas tam o. Gece diş gıcırdatması (bruksizm) bu kası vücut geliştirici gibi büyütür.' },
      { info: 'deltoid', title: 'Omzun Kalkanı: Deltoid', text: 'Üç köşeli (delta Δ harfi gibi) bu kas kolu yana kaldırır ve omuz eklemini zırh gibi örter. Aşıların kola yapılmasının nedeni de o: kalın, ulaşması kolay ve büyük damar-sinir paketlerinden uzak bir kas.' },
      { info: 'biceps', title: 'Klasik Güç Simgesi: Biceps', text: 'İki başlı (bi-ceps) bu kas dirseği büker ve önkolu dışa çevirir (kapı kolu çevirir gibi). Güç denince herkes onu gösterir ama aslında kolun asıl hacmini arka taraftaki triceps verir.' },
      { info: 'rectus_abdominis', title: 'Baklavalar: Rectus Abdominis', text: 'Ünlü "six-pack" aslında tek bir kasın, bağ dokusu şeritleriyle bölünmüş hâli. Görevi gövdeyi öne eğmek ve karın içi basıncı yönetmek — öksürürken, gülerken, ıkınırken o çalışır.' },
      { info: 'gluteus', real: 'Gluteus maximus muscle', title: 'En Büyük Kas: Gluteus Maximus', text: 'Vücudun en büyük kası kalçandadır ve dört ayaklılarda bu kadar gelişmiş değildir. İki ayak üzerinde dik durabilmemiz, merdiven çıkmamız ve koşmamız onun eseri. İnsan olmanın kası diyebiliriz.' },
      { info: 'quadriceps', real: 'Rectus femoris muscle', title: 'Uyluğun Dört Bacağı: Kuadriseps', text: 'Dört baş tek tendonda birleşip diz kapağı üzerinden bacağı düzeltir. Futbol topuna vurduğundaki patlayıcı güç buradan gelir. Yürüme, ayağa kalkma ve merdiven çıkmada da önemli rol oynar.' },
      { info: 'gastrocnemius', title: 'İkinci Kalp: Baldır Kası', text: 'Baldır kasları her adımda toplardamarları sıkıştırıp kanı yer çekimine karşı kalbe pompalar — bu yüzden "ikinci kalp" denir. Uzun süre hareketsiz oturunca bacakların şişmesi, bu pompanın durmasındandır. Kas turu bitti, şimdi bir tur yürü de pompan çalışsın! 🎉' },
    ],
  },
  {
    id: 'bosaltim', icon: '💧', title: 'Boşaltım: Vücudun Arıtma Tesisi',
    desc: 'Kandan idrara 180 litrelik filtrasyon',
    steps: [
      { info: 'aorta', title: 'Kirli Kan Yolda', text: 'Kalbin pompaladığı kanın yaklaşık %20’si doğrudan böbreklere gider — büyüklüklerine göre bu devasa bir paydır (dakikada ~1,2 litre). Amaç: kandaki atık, fazla su ve tuzu ayıklamak.' },
      { info: 'renal_vessels', real: 'Left renal artery', title: 'Böbrek Damarları', text: 'Kısa ama kalın böbrek atardamarı kanı yüksek basınçla böbreğe taşır; filtrasyonun itici gücü bu basınçtır. Temizlenmiş kan böbrek toplardamarından geri döner. Tansiyon ile böbreğin kadim dostluğu (ve bazen kavgası) buradan gelir.' },
      { info: 'kidneys', real: 'Kidney', title: 'Böbrekler: Günde 180 Litre Filtre', text: 'Her böbrekte ~1 milyon nefron, günde ~180 litre sıvıyı süzer; %99’u geri emilir, geriye ~1,5 litre idrar kalır. Böbrek ayrıca kan basıncını ve alyuvar üretimini (eritropoetin hormonu) da yönetir — sadece filtre değil, bir yönetim kurulu üyesi.' },
      { info: 'kidneys', real: 'Ureter', realOnly: true, title: 'Üreterler: Peristaltik Boru Hattı', text: 'Böbrekten mesaneye uzanan 25-30 cm’lik bu borular, idrarı damla damla değil kasılma dalgalarıyla iter — baş aşağı dursan bile akış sürer. Böbrek taşı bu boruda takıldığında oluşan sancı, tıbbın en şiddetli ağrılarındandır.' },
      { info: 'bladder', real: 'Urinary bladder', title: 'Mesane: Esnek Depo', text: 'Boşken buruşuk bir kese, dolunca ~500 ml alan bir balon. Duvarındaki detrusor kası ve iki sfinkter kapısı sayesinde sosyal hayat mümkün. Gerilme reseptörleri ~250 ml’de beyne ilk "tuvalet yakın olabilir mi?" sinyalini gönderir. Arıtma turu tamam — su içmeyi unutma! 💧' },
    ],
  },
  {
    id: 'gorme', icon: '👁️', title: 'Görme Yolu: Işıktan Algıya',
    desc: 'Fotondan beyindeki görüntüye',
    steps: [
      { info: 'eye', real: 'Anterior segment of eyeball', title: 'Göz Küresi: Canlı Kamera', text: 'Gözün kırma gücünün üçte ikisini kornea (öndeki saydam pencere) sağlar; mercek sadece ince ayar yapar. Retinadaki 120 milyon çomak ve 6 milyon koni hücresi ışığı sinyale çevirir. Retinada görüntü terstir — düzeltme beyne aittir.' },
      { info: 'optic_nerve', real: 'Optic nerve (II)', title: 'Görme Siniri', text: '~1,2 milyon liften oluşan bu kablo aslında beynin bir uzantısıdır (periferik sinir değil). Gözden çıktığı noktada fotoreseptör yoktur: o "kör noktayı" beyin, çevresine bakıp uydurarak doldurur — her an biraz fotoşoplu görürsün.' },
      { info: 'optic_nerve', real: 'Optic chiasm', realOnly: true, title: 'Kiyazma: Liflerin Kavşağı', text: 'Burun tarafı retinadan gelen lifler burada çapraz yapar. Sonuç: sol görme alanın sağ beyinde, sağ görme alanın sol beyinde işlenir. Hipofiz tümörleri buraya bası yaparsa iki yandan "at gözlüğü" gibi görme kaybı olur — nörolojinin klasik ipucu.' },
      { info: 'brain', real: 'Occipital pole', title: 'Görme Korteksi: Filmin Perdesi', text: 'Sinyaller başın arkasındaki oksipital loba ulaşır. Görmek burada olur: kenarlar, renkler, hareket ayrı ayrı işlenip tek sahneye birleştirilir. Gözler kamera, bu lob ise sinema salonunun ta kendisi. Görme turu bitti — gözlerini kırpmayı unutma! 👁️' },
    ],
  },
];
