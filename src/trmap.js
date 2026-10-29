// Z-Anatomy (İngilizce baz isim) -> CORPUS Türkçe içerik eşleştirmesi
// 1) EXPLICIT: birebir isim eşleşmeleri
// 2) RULES: düzenli ifadeler (sıra önemli, ilk uyan kazanır)
// 3) TR_NAMES: kendi kartı İngilizce kalan ama Türkçe başlık alan yapılar
// 4) TR_GENERATORS: Vertebra T7 -> "T7 Sırt Omuru" gibi üretken çeviriler

const EXPLICIT = {
  'Mandible': 'mandible',
  'Atlas (C1)': 'cervical', 'Axis (C2)': 'cervical',
  'Sacrum': 'sacrum',
  'Clavicle': 'clavicle', 'Scapula': 'scapula', 'Humerus': 'humerus',
  'Radius': 'radius', 'Ulna': 'ulna', 'Hip bone': 'pelvis',
  'Femur': 'femur', 'Patella': 'patella', 'Tibia': 'tibia', 'Fibula': 'fibula',
  'Diaphragm': 'diaphragm',
  'Sternocleidomastoid muscle': 'sternocleidomastoid',
  'Sartorius muscle': 'sartorius', 'Sartorius': 'sartorius',
  'Rectus abdominis muscle': 'rectus_abdominis',
  'Thyroid gland': 'thyroid', 'Trachea': 'trachea',
  'Oesophagus': 'esophagus', 'Esophagus': 'esophagus',
  'Liver': 'liver', 'Gallbladder': 'gallbladder', 'Stomach': 'stomach',
  'Spleen': 'spleen', 'Pancreas': 'pancreas', 'Kidney': 'kidneys',
  'Duodenum': 'small_intestine', 'Jejunum': 'small_intestine', 'Ileum': 'small_intestine',
  'Urinary bladder': 'bladder',
  'Left atrium': 'heart', 'Right atrium': 'heart',
  'Left ventricle': 'heart', 'Right ventricle': 'heart',
  'Ascending aorta': 'aorta', 'Thoracic aorta': 'aorta', 'Abdominal aorta': 'aorta',
  'Superior vena cava': 'vena_cava',
  'Corpus callosum': 'brain', 'Fornix': 'brain',
  'Pons': 'brainstem', 'Midbrain': 'brainstem', 'Medulla oblongata': 'brainstem',
  'Optic nerve (II)': 'optic_nerve', 'Optic chiasm': 'optic_nerve', 'Optic tract': 'optic_nerve',
  'Retina': 'eye', 'Cornea': 'eye', 'Iris': 'eye', 'Lens': 'eye', 'Sclera': 'eye',
};

// fasya/bursa gibi yapılar kas/kemik kartlarına yanlışlıkla yapışmasın
const GUARD = /\b(fascia|bursa|retinaculum|sheath|aponeurosis|sinus of)\b/i;

const RULES = [
  // ---- iskelet ----
  [/^(Body|Manubrium|Xiphoid process) of sternum$|^Sternum/i, 'sternum'],
  [/^Vertebra C[3-7]$|cervical vertebra/i, 'cervical'],
  [/^Vertebra T\d+$|thoracic vertebra/i, 'thoracic'],
  [/^Vertebra L[1-5]$|lumbar vertebra/i, 'lumbar'],
  [/\b(rib|costal cartilage)\b/i, 'ribs'],
  [/\b(frontal bone|parietal bone|temporal bone|occipital bone|sphenoid bone|ethmoid bone|zygomatic bone|nasal bone|maxilla|lacrimal bone|palatine bone|vomer|inferior nasal concha|incus|malleus|stapes|hyoid bone|ethmoid|nasal concha)\b/i, 'cranium'],
  [/\b(scaphoid|lunate|triquetrum|pisiform|trapezium|trapezoid|capitate|hamate|metacarpal|carpal)\b|phalanx\b.*\bof hand\b|sesamoid.*hand/i, 'hand_bones'],
  [/\b(calcaneus|talus|cuboid bone|navicular bone|cuneiform|metatarsal|tarsal)\b|phalanx\b.*\bof foot\b/i, 'foot_bones'],
  // ---- kaslar (fasya guard'lı) ----
  [/pectoralis major/i, 'pectoralis'],
  [/(part of deltoid|^Deltoid)/i, 'deltoid'],
  [/biceps brachii/i, 'biceps'],
  [/triceps brachii/i, 'triceps'],
  [/\b(flexor carpi|extensor carpi|palmaris longus|brachioradialis|pronator (teres|quadratus)|supinator muscle|flexor digitorum (superficialis|profundus)|flexor pollicis longus|extensor digitorum muscle|extensor indicis|extensor digiti minimi|abductor pollicis longus|extensor pollicis|anconeus)\b/i, 'forearm'],
  [/(external|internal) abdominal oblique|external oblique|internal oblique/i, 'obliques'],
  [/part of trapezius|trapezius muscle/i, 'trapezius'],
  [/latissimus dorsi/i, 'latissimus'],
  [/^Gluteus maximus/i, 'gluteus'],
  [/\b(rectus femoris|vastus (lateralis|medialis|intermedius))\b/i, 'quadriceps'],
  [/\b(biceps femoris|semitendinosus|semimembranosus)\b/i, 'hamstrings'],
  [/head of gastrocnemius|gastrocnemius muscle/i, 'gastrocnemius'],
  [/^Tibialis anterior/i, 'tibialis'],
  [/(part of masseter|^Masseter\b)/i, 'masseter'],
  // ---- iç organlar ----
  [/^(Right|Left) main bronchus$|bronchus$|^Trachea/i, 'trachea'],
  [/lobe of (left|right) lung|^(Left|Right) lung$/i, 'lungs'],
  [/segment of liver|lobe of liver/i, 'liver'],
  [/^(Ascending|Descending|Transverse|Sigmoid) colon$|^Caecum$|^Cecum$|vermiform appendix|^Rectum$/i, 'large_intestine'],
  [/segment of eyeball|chamber of eyeball|^Eyeball/i, 'eye'],
  // ---- dolaşım ----
  [/\b(papillary muscle of (left|right) ventricle|leaflet of .*valve|(aortic|pulmonary|mitral|tricuspid) valve|coronary leaflet|septal leaflet)\b/i, 'heart'],
  [/arch of aorta|aortic arch/i, 'aorta'],
  [/inferior vena cava/i, 'vena_cava'],
  [/\bpulmonary (artery|vein|trunk|valve)\b/i, 'pulmonary'],
  [/\bcarotid artery\b/i, 'carotid'],
  [/\bjugular vein\b/i, 'jugular'],
  [/\b(brachial|axillary|subclavian|radial|ulnar) (artery|vein)\b|cephalic vein|basilic vein/i, 'brachial_vessels'],
  [/\b(femoral|popliteal|iliac) (artery|vein)\b|(anterior|posterior) tibial (artery|vein)|fibular artery|saphenous vein|dorsalis pedis/i, 'femoral_vessels'],
  [/\brenal (artery|vein)\b/i, 'renal_vessels'],
  // ---- sinir ----
  [/\b(gyrus|sulcus|opercular|orbital gyri|insula|cingulate|hippocampus|hippocampal|amygdaloid|caudate nucleus|putamen|globus pallidus|lentiform|claustrum|thalamus|hypothalamus|epithalamus|subthalamus)\b/i, 'brain'],
  [/cerebell/i, 'cerebellum'],
  [/\b(pyramid of medulla|olive|tegmentum|tectum|peduncle of midbrain|lemniscus)\b/i, 'brainstem'],
  [/\b(spinal cord|cauda equina|conus medullaris|filum terminale)\b/i, 'spinal_cord'],
  [/\b(brachial plexus|median nerve|ulnar nerve|radial nerve|musculocutaneous nerve|axillary nerve)\b/i, 'brachial_plexus'],
  [/\b(sciatic nerve|ischiadic nerve|tibial nerve|common fibular nerve|common peroneal nerve|deep fibular|superficial fibular|sural nerve)\b/i, 'sciatic'],
  [/\b(femoral nerve|obturator nerve|saphenous nerve)\b/i, 'femoral_nerve'],
];

export function mapToInfo(baseName) {
  if (EXPLICIT[baseName]) return EXPLICIT[baseName];
  if (GUARD.test(baseName)) return null;
  for (const [re, id] of RULES) if (re.test(baseName)) return id;
  return null;
}

const ORD = { first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7, eighth: 8, ninth: 9, tenth: 10, eleventh: 11, twelfth: 12 };
const TR_GENERATORS = [
  [/^Vertebra ([CTL]\d+)$/, (m) => `${m[1]} ${m[1][0] === 'C' ? 'Boyun' : m[1][0] === 'T' ? 'Sırt' : 'Bel'} Omuru`],
  [/^Intervertebral disc (.+)$/, (m) => `${m[1]} Disk (İntervertebral)`],
  [/^(\w+) rib$/i, (m) => ORD[m[1].toLowerCase()] ? `${ORD[m[1].toLowerCase()]}. Kaburga` : null],
  [/^Costal cartilage of (\w+) rib$/i, (m) => ORD[m[1].toLowerCase()] ? `${ORD[m[1].toLowerCase()]}. Kaburga Kıkırdağı` : null],
  [/^(\w+) (metacarpal|metatarsal) bone$/i, (m) => ORD[m[1].toLowerCase()] ? `${ORD[m[1].toLowerCase()]}. ${m[2].toLowerCase() === 'metacarpal' ? 'El Tarağı (Metakarp)' : 'Ayak Tarağı (Metatars)'}` : null],
];

export const TR_NAMES = {
  // kafatası kemikleri
  'Frontal bone': 'Alın Kemiği (Frontal)', 'Parietal bone': 'Yan Kafa Kemiği (Pariyetal)',
  'Temporal bone': 'Şakak Kemiği (Temporal)', 'Occipital bone': 'Art Kafa Kemiği (Oksipital)',
  'Sphenoid bone': 'Temel Kemik (Sfenoid)', 'Ethmoid bone': 'Kalbur Kemik (Etmoid)',
  'Zygomatic bone': 'Elmacık Kemiği', 'Maxilla': 'Üst Çene Kemiği (Maksilla)',
  'Nasal bone': 'Burun Kemiği', 'Lacrimal bone': 'Gözyaşı Kemiği', 'Palatine bone': 'Damak Kemiği',
  'Vomer': 'Saban Kemiği (Vomer)', 'Hyoid bone': 'Dil Kemiği (Hiyoid)',
  'Inferior nasal concha': 'Alt Burun Konkası',
  'Incus': 'Örs Kemikçiği', 'Malleus': 'Çekiç Kemikçiği', 'Stapes': 'Üzengi Kemikçiği',
  'Coccyx': 'Kuyruk Sokumu (Koksiks)', 'Atlas (C1)': 'Atlas — 1. Boyun Omuru (C1)',
  'Axis (C2)': 'Axis — 2. Boyun Omuru (C2)',
  'Body of sternum': 'Sternum Gövdesi', 'Manubrium of sternum': 'Manubrium (Sternum Sapı)',
  'Xiphoid process': 'Ksifoid Çıkıntı',
  // el/ayak kemikleri
  'Scaphoid bone': 'Skafoid (Sandal Kemik)', 'Lunate bone': 'Lunatum (Yarım Ay Kemik)',
  'Triquetrum bone': 'Trikuetrum', 'Pisiform bone': 'Pisiform (Bezelye Kemik)',
  'Trapezium bone': 'Trapezyum Kemik', 'Trapezoid bone': 'Trapezoid Kemik',
  'Capitate bone': 'Kapitatum (En Büyük Bilek Kemiği)', 'Hamate bone': 'Hamatum (Çengel Kemik)',
  'Calcaneus': 'Topuk Kemiği (Kalkaneus)', 'Talus': 'Talus (Aşık Kemiği)',
  'Cuboid bone': 'Kuboid Kemik', 'Navicular bone': 'Naviküler Kemik',
  'Medial cuneiform bone': 'İç Küneiform Kemik', 'Intermediate cuneiform bone': 'Orta Küneiform Kemik',
  'Lateral cuneiform bone': 'Dış Küneiform Kemik',
  // kaslar (ek)
  'Temporalis muscle': 'Şakak Kası (Temporalis)', 'Frontalis muscle': 'Alın Kası',
  'Orbicularis oris muscle': 'Ağız Çevresi Kası', 'Zygomaticus major muscle': 'Gülme Kası (Zygomaticus Major)',
  'Buccinator muscle': 'Yanak Kası (Buksinator)',
  'Gluteus medius muscle': 'Orta Kalça Kası', 'Gluteus minimus muscle': 'Küçük Kalça Kası',
  'Iliopsoas muscle': 'İliopsoas Kası', 'Psoas major muscle': 'Büyük Bel Kası (Psoas)',
  'Soleus muscle': 'Soleus Kası', 'Tibialis posterior muscle': 'Arka Kaval Kası',
  'Adductor magnus muscle': 'Büyük Yaklaştırıcı Kas', 'Adductor longus muscle': 'Uzun Yaklaştırıcı Kas',
  'Gracilis muscle': 'İnce Kas (Gracilis)', 'Pectineus muscle': 'Tarak Kası (Pektineus)',
  'Tensor fasciae latae muscle': 'Fasya Gerici Kas (TFL)',
  'Brachialis muscle': 'Brakialis Kası', 'Coracobrachialis muscle': 'Korakobrakiyalis',
  'Supraspinatus muscle': 'Supraspinatus (Rotator Manşet)', 'Infraspinatus muscle': 'İnfraspinatus (Rotator Manşet)',
  'Subscapularis muscle': 'Subskapularis (Rotator Manşet)', 'Teres minor muscle': 'Teres Minor (Rotator Manşet)',
  'Teres major muscle': 'Teres Major', 'Rhomboid major muscle': 'Büyük Romboid Kas',
  'Serratus anterior muscle': 'Testere Kası (Serratus Anterior)', 'Pectoralis minor muscle': 'Küçük Göğüs Kası',
  'Transversus abdominis muscle': 'Enine Karın Kası', 'Pyramidalis muscle': 'Piramidal Kas',
  'Quadratus lumborum muscle': 'Kare Bel Kası', 'Erector spinae': 'Omurga doğrultucu Kaslar',
  'Scalenus anterior muscle': 'Ön Skalen Kas', 'Omohyoid muscle': 'Omohiyoid Kas',
  'Digastric muscle': 'İki Karınlı Kas (Digastrik)', 'Mylohyoid muscle': 'Milohiyoid Kas',
  'Peroneus longus muscle': 'Uzun Fibula Kası', 'Extensor hallucis longus muscle': 'Başparmak Açıcı Kas (Ayak)',
  // kalp ve damarlar
  'Left atrium': 'Sol Kulakçık', 'Right atrium': 'Sağ Kulakçık',
  'Left ventricle': 'Sol Karıncık', 'Right ventricle': 'Sağ Karıncık',
  'Ascending aorta': 'Çıkan Aort', 'Arch of aorta': 'Aort Kavsi (Arkus)',
  'Thoracic aorta': 'Göğüs Aortu', 'Abdominal aorta': 'Karın Aortu',
  'Superior vena cava': 'Üst Ana Toplardamar', 'Inferior vena cava (thoracic part)': 'Alt Ana Toplardamar (Göğüs Bölümü)',
  'Inferior vena cava (abdominal part)': 'Alt Ana Toplardamar (Karın Bölümü)',
  'Left coronary artery': 'Sol Koroner Arter', 'Right coronary artery': 'Sağ Koroner Arter',
  'Coronary sinus': 'Koroner Sinüs', 'Brachiocephalic trunk': 'Brakiyosefalik Gövde',
  'Common carotid artery': 'Ana Şah Damarı', 'Internal carotid artery': 'İç Şah Damarı',
  'External carotid artery': 'Dış Şah Damarı', 'Internal jugular vein': 'İç Boyun Toplardamarı',
  'External jugular vein': 'Dış Boyun Toplardamarı', 'Subclavian artery': 'Köprücük Altı Arter',
  'Subclavian vein': 'Köprücük Altı Toplardamar', 'Axillary artery': 'Kolaltı Arteri',
  'Brachial artery': 'Kol Arteri (Brakiyal)', 'Radial artery': 'Radial Arter (Nabız Damarı)',
  'Ulnar artery': 'Ulnar Arter', 'Femoral artery': 'Femoral Arter', 'Femoral vein': 'Femoral Ven',
  'Popliteal artery': 'Diz Arkası Arteri (Popliteal)', 'Common iliac artery': 'Ana Kalça Arteri',
  'External iliac artery': 'Dış Kalça Arteri', 'Internal iliac artery': 'İç Kalça Arteri',
  'Renal artery': 'Böbrek Arteri', 'Renal vein': 'Böbrek Toplardamarı',
  'Coeliac trunk': 'Çölyak Gövde', 'Superior mesenteric artery': 'Üst Bağırsak Arteri',
  'Hepatic portal vein': 'Kapı Toplardamarı (Portal Ven)', 'Vertebral artery': 'Omur Arteri (Vertebral)',
  'Basilar artery': 'Baziler Arter', 'Middle cerebral artery (M1-segment)': 'Orta Serebral Arter (MCA)',
  'Anterior cerebral artery': 'Ön Serebral Arter (ACA)', 'Posterior cerebral artery': 'Arka Serebral Arter (PCA)',
  // sinirler ve beyin
  'Optic nerve (II)': 'Görme Siniri (II)', 'Oculomotor nerve (III)': 'Okülomotor Sinir (III)',
  'Trochlear nerve (IV)': 'Troklear Sinir (IV)', 'Trigeminal nerve (V)': 'Üçüz Sinir — Trigeminal (V)',
  'Abducens nerve (VI)': 'Abdüsens Siniri (VI)', 'Facial nerve (VII)': 'Yüz Siniri — Fasiyal (VII)',
  'Vestibulocochlear nerve (VIII)': 'İşitme-Denge Siniri (VIII)', 'Glossopharyngeal nerve (IX)': 'Dil-Yutak Siniri (IX)',
  'Vagus nerve (X)': 'Vagus Siniri (X)', 'Accessory nerve (XI)': 'Aksesuar Sinir (XI)',
  'Hypoglossal nerve (XII)': 'Dilaltı Siniri (XII)', 'Olfactory nerve (I)': 'Koku Siniri (I)',
  'Median nerve': 'Median Sinir', 'Ulnar nerve': 'Ulnar Sinir', 'Radial nerve': 'Radial Sinir',
  'Musculocutaneous nerve': 'Muskulokutanöz Sinir', 'Axillary nerve': 'Aksiller Sinir',
  'Femoral nerve': 'Femoral Sinir', 'Obturator nerve': 'Obturator Sinir',
  'Tibial nerve': 'Tibial Sinir', 'Common fibular nerve': 'Ortak Fibular (Peroneal) Sinir',
  'Phrenic nerve': 'Frenik Sinir (Diyafram Siniri)',
  'Corpus callosum': 'Korpus Kallozum (Beyin Köprüsü)', 'Thalamus': 'Talamus',
  'Hypothalamus': 'Hipotalamus', 'Hippocampus': 'Hipokampus (Bellek Merkezi)',
  'Amygdaloid body': 'Amigdala', 'Caudate nucleus': 'Kaudat Çekirdek', 'Putamen': 'Putamen',
  'Globus pallidus': 'Globus Pallidus', 'Insula (Subcentral gyrus and ant. and post. sulci*)': 'İnsula',
  'Precentral gyrus': 'Presantral Girüs (Motor Korteks)', 'Postcentral gyrus': 'Postsantral Girüs (Duyu Korteksi)',
  'Pineal gland': 'Epifiz Bezi (Pineal)', 'Adenohypophysis': 'Adenohipofiz', 'Neurohypophysis': 'Nörohipofiz',
  'Mammillary body': 'Mamiller Cisim', 'Fornix': 'Forniks',
  'Falx cerebri': 'Falks Serebri (Beyin Orağı)', 'Tentorium cerebelli': 'Tentoryum (Beyincik Çadırı)',
  // göz / iç kulak
  'Retina': 'Retina (Ağ Tabaka)', 'Cornea': 'Kornea (Saydam Tabaka)', 'Iris': 'İris',
  'Lens': 'Göz Merceği', 'Sclera': 'Sclera (Sert Tabaka)', 'Cochlea': 'Koklea (Salyangoz)',
  'Vestibule': 'Vestibül (İç Kulak Girişi)',
  // organlar (ek)
  'Tongue': 'Dil', 'Soft palate': 'Yumuşak Damak', 'Hard palate': 'Sert Damak',
  'Parotid gland': 'Kulakönü Tükürük Bezi (Parotis)', 'Submandibular gland': 'Çenealtı Tükürük Bezi',
  'Sublingual gland': 'Dilaltı Tükürük Bezi', 'Epiglottis': 'Epiglot (Gırtlak Kapağı)',
  'Larynx': 'Gırtlak (Larinks)', 'Pharynx': 'Yutak (Farinks)',
  'Suprarenal gland': 'Böbreküstü Bezi (Adrenal)', 'Superior parathyroid gland': 'Üst Paratiroid Bezi',
  'Inferior parathyroid gland': 'Alt Paratiroid Bezi',
  'Ureter': 'Üreter (İdrar Kanalı)', 'Urethra': 'Üretra', 'Prostate': 'Prostat',
  'Testis': 'Testis', 'Epididymis': 'Epididim', 'Penis': 'Penis',
  'Vermiform appendix': 'Apendiks', 'Caecum': 'Çekum (Kör Bağırsak)', 'Cecum': 'Çekum (Kör Bağırsak)',
  'Rectum': 'Rektum', 'Anal canal': 'Anal Kanal', 'Bile duct': 'Ana Safra Kanalı',
  'Cystic duct': 'Sistik Kanal', 'Pancreatic duct': 'Pankreas Kanalı',
  'Greater omentum': 'Büyük Omentum', 'Peritoneum': 'Karın Zarı (Periton)',
  'Right main bronchus': 'Sağ Ana Bronş', 'Left main bronchus': 'Sol Ana Bronş',
  'Superior lobe of right lung': 'Sağ Akciğer Üst Lobu', 'Middle lobe of right lung': 'Sağ Akciğer Orta Lobu',
  'Inferior lobe of right lung': 'Sağ Akciğer Alt Lobu', 'Superior lobe of left lung': 'Sol Akciğer Üst Lobu',
  'Inferior lobe of left lung': 'Sol Akciğer Alt Lobu',
  // eklemler / lenf
  'Anterior cruciate ligament': 'Ön Çapraz Bağ (ÖÇB)', 'Posterior cruciate ligament': 'Arka Çapraz Bağ',
  'Medial meniscus': 'İç Menisküs', 'Lateral meniscus': 'Dış Menisküs',
  'Fibular collateral ligament': 'Dış Yan Bağ (Diz)', 'Patellar ligament': 'Patellar Bağ',
  'Calcaneal tendon': 'Aşil Tendonu', 'Inguinal ligament': 'Kasık Bağı (İnguinal)',
  'Left lobe of thymus': 'Timus Sol Lobu', 'Right lobe of thymus': 'Timus Sağ Lobu',
  'Thoracic duct': 'Torasik Kanal (Lenf)', 'Cisterna chyli': 'Sisterna Şili',
};

// Türkçe görüntü adı üret: TR_NAMES > üreticiler > null
export function turkishName(baseName) {
  if (TR_NAMES[baseName]) return TR_NAMES[baseName];
  for (const [re, fn] of TR_GENERATORS) {
    const m = baseName.match(re);
    if (m) { const out = fn(m); if (out) return out; }
  }
  return null;
}
