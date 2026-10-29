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
  [/^Intervertebral disc C/i, 'cervical'],
  [/^Intervertebral disc T/i, 'thoracic'],
  [/^Intervertebral disc L/i, 'lumbar'],
  [/\bsesamoid\b.*\bfoot\b/i, 'foot_bones'],
  [/\bsesamoid\b.*\bhand\b/i, 'hand_bones'],
  [/\b(dura mater|arachnoid mater|pia mater|choroid plexus)\b/i, 'brain'],
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
  [/^Nucleus pulposus ((?:[CTL]\d+)-[CTLS]\d+)$/, (m) => `${m[1]} Nukleus Pulpozus (Disk Çekirdeği)`],
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
  // beyin ekleri
  'Lateral ventricle': 'Yan Karıncık (Lateral Ventrikül)', 'Third ventricle': 'Üçüncü Karıncık',
  'Fourth ventricle': 'Dördüncü Karıncık', 'Aqueduct of midbrain': 'Beyin Su Kanalı (Akuadukt)',
  'Dura mater': 'Dura Mater (Sert Zar)', 'Pia mater': 'Pia Mater (İnce Zar)',
  'Arachnoid mater': 'Araknoid Zar', 'Choroid plexus': 'Koroid Pleksus',
  'Tonsil of cerebellum': 'Beyincik Tonsili', 'Red nucleus': 'Kırmızı Çekirdek (N. Ruber)',
  'Substantia nigra': 'Substansiya Nigra', 'Dentate nucleus': 'Dentat Çekirdek',
  'Anterior commissure': 'Ön Komissür', 'Cerebral arterial circle': 'Willis Halkası',
  'Interthalamic adhesion': 'İntertalamik Yapışıklık', 'Septum pellucidum': 'Septum Pellusidum',
  // göz - kulak
  'Vitreous body': 'Camsı Cisim', 'Choroid': 'Koroid (Damar Tabaka)', 'Ciliary body': 'Siliyer Cisim',
  'Optic disc': 'Optik Disk', 'Tympanic membrane': 'Kulak Zarı',
  'External acoustic meatus': 'Dış Kulak Yolu', 'Pharyngotympanic tube': 'Östaki Borusu',
  'Auditory tube': 'Östaki Borusu', 'Tympanic cavity': 'Orta Kulak Boşluğu',
  // kalp - damar ekleri
  'Chordae tendineae': 'Korda Tendineae (Kalp Kirişleri)', 'Azygos vein': 'Azigos Veni',
  'Hemiazygos vein': 'Hemiazigos Veni', 'Brachiocephalic vein': 'Brakiyosefalik Ven',
  'Great cerebral vein': 'Büyük Serebral Ven (Galen)', 'Straight sinus': 'Düz Sinüs (Sinus Rektus)',
  'Sigmoid sinus': 'Sigmoid Sinüs', 'Transverse sinus': 'Transvers Sinüs',
  'Superior sagittal sinus': 'Üst Sagital Sinüs', 'Cavernous sinus': 'Kavernöz Sinüs',
  // pelvis - perine
  'Corpus cavernosum of penis': 'Korpus Kavernozum', 'Corpus spongiosum of penis': 'Korpus Spongiozum',
  'Glans penis': 'Glans Penis', 'Ductus deferens': 'Vas Deferens (Tohum Kanalı)',
  'Ejaculatory duct': 'Ejakülatör Kanal', 'Seminal gland': 'Seminal Vezikül',
  'Bulbourethral gland': 'Bulboüretral Bez (Cowper)', 'Scrotum': 'Skrotum',
  // karın - periton
  'Free taenia': 'Serbest Tenya', 'Mesocolic taenia': 'Mezokolik Tenya', 'Omental taenia': 'Omental Tenya',
  'Mesocolon': 'Mezokolon', 'Mesentery': 'Mezenter (Bağırsak Askısı)', 'Meso-appendix': 'Mezoapendiks',
  'Lesser omentum': 'Küçük Omentum', 'Omental bursa': 'Omental Bursa',
  'Acetabular labrum': 'Asetabular Labrum', 'Glenoid labrum': 'Glenoid Labrum',
  'Frontal sinus': 'Frontal Sinüs (Alın Sinüsü)', 'Maxillary sinus': 'Maksiller Sinüs',
  'Sphenoidal sinus': 'Sfenoid Sinüs', 'Ethmoidal cells': 'Etmoid Hücreler',
  'Renal pelvis': 'Böbrek Pelvisi', 'Renal calyx': 'Böbrek Kaliksi',
  'Iliotibial tract': 'İliotibial Bant (İTB)', 'Linea alba': 'Linea Alba',
  'Plantaris': 'Plantaris Kası', 'Popliteus': 'Popliteus Kası', 'Piriformis': 'Piriformis Kası',
  'Iliacus': 'İliakus Kası', 'Psoas minor': 'Küçük Psoas Kası', 'Anconeus': 'Ankoneus Kası',
  'Palatoglossus': 'Palatoglossus Kası', 'Styloglossus': 'Stiloglossus Kası',
  'Hyoglossus': 'Hiyoglossus Kası', 'Genioglossus': 'Geniyoglossus Kası',
  'Fascia lata': 'Fasya Lata', 'Palatine tonsil': 'Damak Bademciği',
  'Chorda tympani': 'Korda Timpani', 'Culmen': 'Kulmen', 'Cuneus': 'Kuneus',
  'Gingiva': 'Diş Eti', 'Laryngopharynx': 'Laringofarinks', 'Nasopharynx': 'Nazofarinks',
  'Oropharynx': 'Orofarinks', 'Pleura': 'Plevra (Akciğer Zarı)', 'Uvula of palate': 'Küçük Dil (Uvula)',
  'Central canal': 'Santral Kanal', 'Piriformis muscle': 'Piriformis Kası',
  'Superior gemellus': 'Üst Gemellus Kası', 'Inferior gemellus': 'Alt Gemellus Kası',
  'Obturator internus': 'Obturator İnternus Kası', 'Obturator externus': 'Obturator Eksternus Kası',
  'Quadratus femoris': 'Kuadratus Femoris Kası', 'Articular disc of temporomandibular joint': 'Çene Eklemi Diski',
  'Pubic symphysis': 'Simfizis Pubis', 'Sacrococcygeal symphysis': 'Sakrokoksigeal Simfiz',
  'Ligamenta flava': 'Sarı Bağlar (Ligamenta Flava)', 'Infrapatellar fat pad': 'İnfrapatellar Yağ Yastığı',
  'Platysma': 'Platizma Kası', 'Rotatores': 'Rotator Kasları', 'Supinator': 'Supinator Kası',
  'Mamillary body': 'Mamiller Cisim', 'Lacrimal sac': 'Gözyaşı Kesesi', 'Orbital sulci': 'Orbital Sulkuslar',
  'Declive': 'Dekliv', 'Flocculus': 'Flokkulus', 'Folium of vermis': 'Vermis Folyumu',
  'Habenula': 'Habenula', 'Nodule of vermis': 'Vermis Nodülü', 'Nucleus ambiguus': 'Nukleus Ambiguus',
  'Nucleus proprius': 'Nukleus Proprius', 'Peduncle of flocculus': 'Flokkulus Pedünkülü',
  'Precuneus': 'Prekuneus', 'Pyramis of vermis': 'Vermis Piramisi', 'Tuber of vermis': 'Vermis Tuberi',
  'Spinal dura': 'Spinal Dura Mater', 'Stria medullaris thalami': 'Stria Medullaris Talami',
  'Stria terminalis': 'Stria Terminalis', 'Ganglia of sympathetic trunk': 'Sempatik Zincir Ganglionları',
  'Zonular fibres': 'Zonüler Lifler', 'Dorsal venous network of hand': 'El Sırtı Venöz Ağı',
  'Node of ligamentum arteriosum': 'Ligamentum Arteriyozum Lenf Düğümü',
  'Lat_Fis-ant-Horizont': 'Lateral Fissür (Sylvian) – Ön Yatay Dal',
  'Lat_Fis-ant-Vertical': 'Lateral Fissür – Ön Dikey Dal', 'Lat_Fis-post': 'Lateral Fissür – Arka Kısım',
  'Frenula capsulae': 'Kapsül Frenulumları',
};

/* ================= üretken çeviri motoru =================
   İsim bileşenlerini (yön sıfatları + bölge kökleri + son isim) sözlükle
   Türkçeleştirir; bilinmeyen oranı yüksekse vazgeçer (yarım yamalak isim yok). */

const WORD_TR = {
  // yön / nitelik
  anterior:'Ön', posterior:'Arka', superior:'Üst', inferior:'Alt', medial:'Medial', lateral:'Lateral',
  median:'Medyan', middle:'Orta', central:'Santral', superficial:'Yüzeyel', deep:'Derin', external:'Dış',
  internal:'İç', common:'Ana', proper:'Proper', accessory:'Aksesuar', recurrent:'Rekürren',
  ascending:'Çıkan', descending:'İnen', transverse:'Transvers', longitudinal:'Longitudinal',
  oblique:'Oblik', straight:'Düz', arcuate:'Arkuat', perforating:'Perforan', communicating:'Komünikan',
  collateral:'Kollateral', segmental:'Segmental', basal:'Bazal', apical:'Apikal', lobar:'Lobar',
  dorsal:'Dorsal', ventral:'Ventral', palmar:'Palmar', plantar:'Plantar', digital:'Dijital',
  marginal:'Marjinal', terminal:'Terminal', proximal:'Proksimal', distal:'Distal', great:'Büyük',
  greater:'Büyük', lesser:'Küçük', small:'Küçük', large:'Büyük', long:'Uzun', short:'Kısa',
  principal:'Ana', main:'Ana', anteriorly:'Ön', supreme:'En Üst', highest:'En Üst', lowest:'En Alt',
  dorsal:'Dorsal', ventral:'Ventral', radial:'Radial', ulnar:'Ulnar', median:'Medyan',
  superficial:'Yüzeyel', profunda:'Profunda (Derin)', intermuscular:'İntermüsküler',
  // bölge / yapı kökleri
  acetabular:'Asetabular', acromial:'Akromiyal', acromioclavicular:'Akromiyoklavikular',
  alveolar:'Alveolar', anal:'Anal', angular:'Angular', annular:'Anuler', appendicular:'Apendiküler',
  articular:'Eklem', arytenoid:'Aritenoid', auricular:'Aurikular', axillary:'Aksiller',
  basilar:'Baziler', brachial:'Brakiyal', bronchial:'Bronşiyal', buccal:'Bukkal',
  calcaneal:'Kalkaneal', capsular:'Kapsüler', cardiac:'Kardiyak', carotid:'Karotis', carpal:'Karpal',
  caudal:'Kaudal', cavernous:'Kavernöz', cecal:'Çekal', celiac:'Çölyak', coeliac:'Çölyak',
  cephalic:'Sefalik', cerebellar:'Serebellar', cerebral:'Serebral', cervical:'Servikal',
  circumflex:'Sirkumfleks', clavicular:'Klavikular', coccygeal:'Koksigeal', cochlear:'Koklear',
  colic:'Kolik', condylar:'Kondiler', conjunctival:'Konjonktival', coronary:'Koroner',
  corniculate:'Kornikulat', cortical:'Kortikal', costal:'Kostal', cricoid:'Krikoid',
  cubital:'Kubital', cutaneous:'Kutanöz', cystic:'Sistik', dental:'Dental', diaphragmatic:'Diyafragmatik',
  duodenal:'Duodenal', dural:'Dural', epididymal:'Epididimal', epigastric:'Epigastrik',
  epiploic:'Epiploik', esophageal:'Özofageal', oesophageal:'Özofageal', ethmoidal:'Etmoidal',
  facial:'Fasiyal', femoral:'Femoral', fibular:'Fibular', frontal:'Frontal', gastric:'Gastrik',
  gastroduodenal:'Gastroduodenal', gastroepiploic:'Gastroepiploik', genicular:'Geniküler',
  gingival:'Jinjival', glandular:'Glandüler', gluteal:'Gluteal', gonadal:'Gonadal',
  hepatic:'Hepatik', humeral:'Humeral', hypogastric:'Hipogastrik', hypoglossal:'Hipoglossal',
  ileal:'İleal', ileocolic:'İleokolik', iliac:'İliyak', infrahyoid:'İnfrahyoid',
  infraorbital:'İnfraorbital', infratrochlear:'İnfratroklear', inguinal:'İnguinal',
  interatrial:'İnteratriyal', intercostal:'İnterkostal', interlobar:'İnterlobar',
  intermuscular:'İntermüsküler', interosseous:'İnterosseöz', interventricular:'İnterventriküler',
  intervertebral:'İntervertebral', intestinal:'İntestinal', jejunal:'Jejunal', jugular:'Juguler',
  labial:'Labial', labyrinthine:'Labirentin', lacrimal:'Lakrimal', lacunar:'Lakunar',
  laryngeal:'Laringeal', lingual:'Lingual', lingular:'Lingular', lumbar:'Lomber',
  malleolar:'Malleolar', mammary:'Mammar', mandibular:'Mandibular', masseteric:'Masseterik',
  mastoid:'Mastoid', maxillary:'Maksiller', mental:'Mental', mesenteric:'Mezenterik',
  metacarpal:'Metakarpal', metatarsal:'Metatarsal', musculophrenic:'Muskülofrenik',
  mylohyoid:'Milohyoid', nasal:'Nazal', nasopalatine:'Nazopalatin', obturator:'Obturator',
  occipital:'Oksipital', oculomotor:'Okülomotor', omental:'Omental', ophthalmic:'Oftalmik',
  orbital:'Orbital', ovarian:'Overyan', palatine:'Palatin', palpebral:'Palpebral',
  pancreatic:'Pankreatik', parietal:'Pariyetal', parotid:'Parotis', patellar:'Patellar',
  pectoral:'Pektoral', pelvic:'Pelvik', penile:'Penil', pericardial:'Perikardiyal',
  pericardiacophrenic:'Perikardiyakofrenik', perineal:'Perineal', peroneal:'Peroneal',
  petrosal:'Petrozal', pharyngeal:'Faringeal', phrenic:'Frenik', popliteal:'Popliteal',
  prostatic:'Prostatik', pterygoid:'Pterigoid', pubic:'Pubik', pudendal:'Pudendal',
  pulmonary:'Pulmoner', pyloric:'Pilorik', radicular:'Radiküler', rectal:'Rektal', renal:'Renal',
  retromandibular:'Retromandibular', sacral:'Sakral', sacroiliac:'Sakroiliyak', saphenous:'Safen',
  scapular:'Skapular', sciatic:'Siyatik', scrotal:'Skrotal', semicircular:'Yarım Daire',
  septal:'Septal', sesamoid:'Sesamoid', sigmoid:'Sigmoid', spermatic:'Spermatik',
  sphenopalatine:'Sfenopalatin', spinal:'Spinal', spinocerebellar:'Spinoserebellar',
  spinothalamic:'Spinotalamik', splanchnic:'Splanknik', splenic:'Splenik', sternoclavicular:'Sternoklavikular',
  stylomastoid:'Stilomastoid', subclavian:'Subklavian', subcostal:'Subkostal', sublingual:'Sublingual',
  submandibular:'Submandibular', submental:'Submental', suboccipital:'Suboksipital',
  subscapular:'Subskapular', supraorbital:'Supraorbital', suprarenal:'Suprarenal',
  suprascapular:'Supraskapular', supratrochlear:'Supratroklear', sural:'Sural',
  sympathetic:'Sempatik', talocalcaneal:'Talokalkaneal', tarsal:'Tarsal', temporal:'Temporal',
  testicular:'Testiküler', thalamic:'Talamik', thenar:'Tenar', thoracic:'Torasik',
  thoracoacromial:'Torakoakromiyal', thoracodorsal:'Torakodorsal', thymic:'Timik', thyroid:'Tiroid',
  tibial:'Tibial', tibiofibular:'Tibiofibular', tracheal:'Trakeal', trochlear:'Troklear',
  tympanic:'Timpanik', umbilical:'Umbilikal', ureteric:'Üreterik', uterine:'Uterin',
  vaginal:'Vajinal', vertebral:'Vertebral', vesical:'Vezikal', vestibular:'Vestibüler',
  visceral:'Visseral', vocal:'Vokal', zygomatic:'Zigomatik', antebrachial:'Önkol',
  crural:'Krural', meniscotibial:'Meniskotibial', retinacular:'Retinaküler',
  // organ / sahiplenilen yapılar (of'lu isimlerde)
  femur:'Femur', humerus:'Humerus', radius:'Radius', ulna:'Ulna', tibia:'Tibia', fibula:'Fibula',
  scapula:'Skapula', clavicle:'Klavikula', sternum:'Sternum', patella:'Patella', pelvis:'Pelvis',
  sacrum:'Sakrum', lung:'Akciğer', heart:'Kalp', liver:'Karaciğer', kidney:'Böbrek',
  stomach:'Mide', spleen:'Dalak', pancreas:'Pankreas', brain:'Beyin', eye:'Göz', eyeball:'Göz Küresi',
  ear:'Kulak', tongue:'Dil', tooth:'Diş', skin:'Deri', foot:'Ayak', hand:'El', wrist:'El Bileği',
  ankle:'Ayak Bileği', elbow:'Dirsek', knee:'Diz', shoulder:'Omuz', hip:'Kalça', neck:'Boyun',
  head:'Baş', thorax:'Göğüs', abdomen:'Karın', perineum:'Perine', diaphragm:'Diyafram',
  larynx:'Larinks', pharynx:'Farinks', trachea:'Trakea (Soluk Borusu)', bronchus:'Bronş',
  colon:'Kolon', rectum:'Rektum', bladder:'Mesane', prostate:'Prostat', penis:'Penis',
  testis:'Testis', uterus:'Uterus (Rahim)', ovary:'Over (Yumurtalık)', gallbladder:'Safra Kesesi',
  forearm:'Önkol', arm:'Kol', leg:'Bacak', thigh:'Uyluk', thumb:'Başparmak (El)',
  finger:'Parmak', toe:'Ayak Parmağı', skull:'Kafatası', mandible:'Mandibula (Alt Çene)',
  maxilla:'Maksilla (Üst Çene)', vertebra:'Omur', rib:'Kaburga', duodenum:'Duodenum',
  oesophagus:'Yemek Borusu', esophagus:'Yemek Borusu', urethra:'Üretra', ureter:'Üreter',
  corpus:'Korpus', callosum:'kallozum',
  intermediate:'Ara', retropyloric:'Retropilorik', subpyloric:'Subpilorik', suprapyloric:'Suprapilorik',
  corticospinal:'Kortikospinal', quadrangular:'Kadrangüler', anteromedial:'Anteromedial',
  apicoposterior:'Apikoposterior', interphalangeal:'İnterfalangeal', metacarpophalangeal:'Metakarpofalangeal',
  metatarsophalangeal:'Metatarsofalangeal', radioulnar:'Radyoulnar', abdominal:'Abdominal',
  investing:'Saran', subcutaneous:'Subkutan', infrapatellar:'İnfrapatellar', suprapatellar:'Suprapatellar',
  major:'Majör', minor:'Minör', alar:'Alar', flexor:'Fleksör', extensor:'Ekstansör', tendon:'Tendon',
  azygos:'Azigos', hemiazygos:'Hemiazigos', canaliculus:'Kanalikül', fasciculus:'Fasikül',
  palate:'Damak', cavity:'Boşluk', disc:'Disk', scalene:'Skalen', scalenus:'Skalen',
  levator:'Kaldırıcı (Levator)', depressor:'Depresör', rotator:'Rotator', sphincter:'Sfinkter',
  constrictor:'Konstriktör', dilator:'Dilatör', buccinator:'Buksinator', risorius:'Risorius',
  corrugator:'Korrugator', procerus:'Proserus', nasalis:'Nasalis', auricularis:'Aurikularis',
  platysma:'Platizma', cremaster:'Kremaster', dartos:'Dartos', palatopharyngeal:'Palatofaringeal',
  salpingopharyngeal:'Salpingofaringeal', stylopharyngeal:'Stilofaringeal', palatoglossal:'Palatoglossal',
  geniohyoid:'Geniyohyoid', sternohyoid:'Sternohyoid', sternothyroid:'Sternotiroid', thyrohyoid:'Tirohyoid',
  omohyoid:'Omohyoid', digastric:'Digastrik', stylohyoid:'Stilohyoid', splenius:'Splenius',
  semispinalis:'Semispinalis', multifidus:'Multifidus', rotatores:'Rotatores',
  interspinales:'İnterspinales', intertransversarii:'İntertransversarii', iliocostalis:'İliyokostalis',
  longissimus:'longissimus', spinalis:'Spinalis', serratus:'Serratus', rhomboid:'Romboid',
  teres:'Teres', coracobrachialis:'Korakobrakiyalis', anconeus:'Ankoneus', pronator:'Pronator',
  supinator:'Supinator', opponens:'Opponens', abductor:'Abduktor', adductor:'Adduktor',
  lumbrical:'Lumbrikal', lumbricals:'Lumbrikaller', interossei:'İnterosseöz', thenar:'Tenar',
  hypothenar:'Hipotenar', palmaris:'Palmaris', plantaris:'Plantaris', peroneus:'Peroneus',
  fibularis:'Fibularis', soleus:'Soleus', gastrocnemius:'Gastroknemius', sartorius:'Sartorius',
  gracilis:'gracilis', pectineus:'Pektineus', iliopsoas:'İliopsoas', psoas:'Psoas', iliacus:'İliakus',
  piriformis:'Piriformis', gemellus:'Gemellus', quadratus:'Kuadratus', obturator:'Obturator',
  gluteus:'Gluteus', vastus:'Vastus', rectus:'Rektus', semitendinosus:'Semitendinosus',
  semimembranosus:'Semimembranosus', popliteus:'Popliteus', hallucis:'hallucis', pollicis:'pollicis',
  digiti:'digiti', digitorum:'digitorum', indicis:'indicis', minimi:'minimi',
  sagittal:'Sajital', geniculate:'Jenikulat', body:'Cisim', colliculus:'Kollikulus',
  white:'Beyaz', matter:'Cevher', telencephalon:'Telensefalon', interpeduncular:'İnterpedünküler',
  costocervical:'Kostoservikal', thyrocervical:'Tiroservikal', postcentral:'Postsentral',
  arterial:'Arter', venous:'Venöz', network:'Ağ', ventricle:'Karıncık', subfacial:'Subfasyal',
  subtendinous:'Subtendinöz', prepatellar:'Prepatellar', vermis:'Vermis', substance:'Madde',
  plane:'Düzlem', sulphur:'', sulci:'Sulkuslar', sulcus:'Sulkus', gyri:'Giruslar', gyrus:'Girus',
  fibres:'Lifler', fibers:'Lifler', zonular:'Zonüler', reticular:'Retiküler', flava:'Flava',
  ligamenta:'Ligamenta', symphysis:'Simfiz', ganglia:'Ganglionlar',
};
// kelimesi kelimesine bırakılacak Latince biçimler (küçük yazılır)
const LATIN_KEEP = new Set(['pollicis','hallucis','digitorum','digiti','carpi','scapulae','femoris',
  'brachii','dorsi','abdominis','thoracis','capitis','colli','oris','oculi','ani','uteri','pedis',
  'manus','longus','brevis','magnus','medius','minimus','maximus','longissimus','latissimus',
  'obliquus','rectus','transversus','profundus','superficialis','minimi','quinti','primi','proprius',
  'proprii','fasciculus','cuneatus','gracilis','solitarius','ambiguus','vagus','accessorius']);
const PART_POSS = { head:'Başı', neck:'Boynu', body:'Gövdesi', apex:'Tepesi', base:'Tabanı',
  root:'Kökü', shaft:'Gövdesi', process:'Çıkıntısı', surface:'Yüzü', border:'Kenarı', margin:'Kenarı',
  angle:'Köşesi', part:'Parçası', segment:'Segmenti', lobe:'Lobu', lobule:'Lobülü', nucleus:'Çekirdeği',
  tract:'Traktı', cavity:'Boşluğu', canal:'Kanalı', duct:'Kanalı', foramen:'Deliği', fossa:'Çukuru',
  notch:'Çentiği', crest:'İbiği', spine:'Dikeni', tubercle:'Tümseği', tuberosity:'Pürtüğü',
  condyle:'Kondili', epicondyle:'Epikondili', trochanter:'Trokanteri', malleolus:'Malleolü',
  sinus:'Sinüsü', arch:'Arkı', opening:'Açıklığı', wall:'Duvarı', membrane:'Membranı',
  capsule:'Kapsülü', trunk:'Gövdesi', division:'Bölümü', ramus:'Ramusu', column:'Sütunu',
  horn:'Boynuzu', pedicle:'Pedikülü', lamina:'Laminası', plate:'Plağı', wing:'Kanadı', ala:'Kanadı',
  fundus:'Fundusu', isthmus:'İstmusu', ampulla:'Ampullası', cupula:'Kupulası', vault:'Kubbesi',
  crus:'Kruru/Bacağı', limb:'Kolu', tail:'Kuyruğu', tail:'Kuyruğu', pole:'Kutbu', hilum:'Hilusu', bursa:'Bursası', uvula:'Uvulası', mucosa:'Mukozası', tonsil:'Bademciği', node:'Lenf Düğümü', tendon:'Tendonu' };
const SUFFIX_NOUNS = [
  [' arteries','Arterleri'], [' artery','Arter'], [' veins','Venleri'], [' vein','Ven'],
  [' nerves','Sinirleri'], [' nerve','Siniri'], [' muscles','Kasları'], [' muscle','Kası'],
  [' ligaments','Bağları'], [' ligament','Bağı'], [' cartilages','Kıkırdakları'], [' cartilage','Kıkırdağı'],
  [' bones','Kemikleri'], [' bone','Kemiği'], [' glands','Bezleri'], [' gland','Bezi'],
  [' ducts','Kanalları'], [' duct','Kanalı'], [' nodes','Lenf Düğümleri'], [' node','Lenf Düğümü'],
  [' fasciae','Fasyaları'], [' fascia','Fasyası'], [' bursae','Bursaları'], [' bursa','Bursası'],
  [' joints','Eklemleri'], [' joint','Eklemi'], [' ganglia','Ganglionları'], [' ganglion','Ganglionu'],
  [' nuclei','Çekirdekleri'], [' nucleus','Çekirdeği'], [' bronchi','Bronşları'], [' bronchus','Bronşu'],
  [' tract','Traktı'], [' septum','Septumu'], [' plexus','Pleksusu'], [' sinus','Sinüsü'],
  [' tendon','Tendonu'], [' membrane','Membranı'], [' capsule','Kapsülü'], [' retinaculum','Retinakulumu'],
  [' aponeurosis','Aponevrozu'], [' lobe','Lobu'], [' lobule','Lobülü'], [' canal','Kanalı'],
  [' foramen','Deliği'], [' process','Çıkıntısı'], [' peduncle','Pedünkülü'], [' fasciculus','Fasikülü'],
  [' commissure','Komissürü'], [' lemniscus','Lemniskusu'], [' valve','Kapağı'], [' leaflet','Yaprakçığı'],
  [' orifice','Ağzı'], [' arch','Arkı'], [' chiasm','Kiyazması'],
  [' capsules','Kapsülleri'], [' discs','Diskleri'], [' disc','Diski'], [' sheaths','Kılıfları'],
  [' sheath','Kılıfı'], [' branches','Dalları'], [' branch','Dalı'], [' cavity','Boşluğu'],
  [' tonsils','Bademcikleri'], [' tonsil','Bademciği'], [' roots','Kökleri'], [' root','Kökü'],
  [' fossa','Çukuru'], [' sac','Kesesi'], [' pole','Kutbu'], [' trunk','Trunkusu'], [' anastomosis','Anastomozu'],
];
const cap = (w) => w ? w[0].toLocaleUpperCase('tr') + w.slice(1) : w;
function genitive(phrase) {
  if (!phrase) return phrase;
  const words = phrase.split(' ');
  let w = words[words.length - 1];
  const lw = w.toLocaleLowerCase('tr');
  const vowels = [...lw].filter((c) => 'aıeiouöü'.includes(c));
  const last = vowels[vowels.length - 1] || 'a';
  const h = 'aı'.includes(last) ? 'ı' : 'ei'.includes(last) ? 'i' : 'ou'.includes(last) ? 'u' : 'ü';
  w = /[aıeiouöü]$/i.test(lw) ? w + 'n' + h + 'n' : w + h + 'n';
  words[words.length - 1] = w;
  return words.join(' ');
}
function wordTr(tok) {
  const t = tok.toLowerCase().replace(/^[('"]+|[)'",.]+$/g, '');
  return WORD_TR[t] || WORD_TR[t.replace(/-/g, '')] || WORD_TR[t.replace(/s$/, '')] || null;
}
// kelime kelime çevir; bilinen oranı düşükse null
function translatePhrase(text) {
  const toks = text.split(/\s+/).filter(Boolean);
  let known = 0, total = 0; const out = [];
  toks.forEach((tok, i) => {
    const low = tok.toLowerCase();
    if (['of', 'the', 'and', '&'].includes(low)) return;
    total++;
    const tr = wordTr(tok);
    if (tr) { known++; out.push(tr); }
    else if (LATIN_KEEP.has(low)) { known++; out.push(low); }
    else if (ORD[low]) { known++; out.push(ORD[low] + '.'); }
    else out.push(cap(tok.toLocaleLowerCase('tr')));
  });
  if (!total) return null;
  const unknown = total - known;
  if (unknown > 1 && known / total < .6) return null;
  return { tr: out.join(' '), known, total };
}
const TR_NAMES_LOWER = new Map(Object.entries(TR_NAMES).map(([k, v]) => [k.toLowerCase(), v]));
function lookupName(n) {
  if (!n) return null;
  const variants = [n, n + ' muscle', n.replace(/\s+muscle$/i, '')];
  for (const v of variants) if (TR_NAMES[v]) return TR_NAMES[v];
  for (const v of variants) { const hit = TR_NAMES_LOWER.get(v.toLowerCase()); if (hit) return hit; }
  for (const [re, fn] of TR_GENERATORS) {
    const m = n.match(re);
    if (m) { const out = fn(m); if (out) return out; }
  }
  return null;
}
function phraseOrName(x, system) {
  x = x.trim();
  if (!/\s/.test(x)) { const w = wordTr(x); if (w) return w; }
  return lookupName(x) || generate(x, system) || (translatePhrase(x) || {}).tr || null;
}
function generate(rawName, system) {
  if (!rawName) return null;
  let core = rawName.trim().replace(/[*']+$/, '').trim();
  if (core.startsWith('(') && core.endsWith(')')) core = core.slice(1, -1).trim();
  // sondaki parantez ekini ayır: (BVIII) kısa kod ya da (Lateral meniscus) açıklama
  let suffix = '';
  const pm = core.match(/^(.*?)\s*\(([^()]+)\)$/);
  if (pm && !/^(Atlas|Axis)/.test(core)) {
    core = pm[1].trim();
    const inner = pm[2].trim();
    suffix = /^\//.test(inner) ? '' : ' (' + (lookupName(inner) || generate(inner, system) || inner) + ')';
    if (!core) return null;
  }
  const done = (txt) => (txt ? txt + suffix : null);
  // dişler
  let m = core.match(/^(Upper|Lower)\s+(?:(first|second|third)\s+)?(molar(?:\s+tooth)?|premolar|canine|(?:lateral|medial|central)\s+incisor|incisor)$/i);
  if (m) {
    const typeMap = { molar: 'Azı Dişi', 'molar tooth': 'Azı Dişi', premolar: 'Küçük Azı Dişi',
      canine: 'Köpek Dişi', 'lateral incisor': 'Yan Kesici Diş', 'medial incisor': 'Orta Kesici Diş',
      'central incisor': 'Orta Kesici Diş', incisor: 'Kesici Diş' };
    const t = typeMap[m[3].toLowerCase()] || 'Diş';
    const ord = m[2] ? ORD[m[2].toLowerCase()] + '. ' : '';
    const wisdom = m[2] && m[2].toLowerCase() === 'third' && /molar/.test(m[3].toLowerCase()) ? ' (Yirmi Yaş Dişi)' : '';
    return done((m[1].toLowerCase() === 'upper' ? 'Üst ' : 'Alt ') + ord + t + wisdom);
  }
  // Left / Right öneki
  m = core.match(/^(Left|Right)\s+(.+)$/i);
  if (m) {
    const rest = lookupName(m[2]) || generate(m[2], system);
    if (rest) return done((m[1].toLowerCase() === 'left' ? 'Sol ' : 'Sağ ') + rest);
    return null;
  }
  // sıra öneki (First dorsal interosseous muscle vb.)
  m = core.match(/^(First|Second|Third|Fourth|Fifth|Sixth|Seventh|Eighth|Ninth|Tenth|Eleventh|Twelfth)\s+(.+)$/i);
  if (m) {
    const rest = generate(m[2], system) || (translatePhrase(m[2]) || {}).tr;
    if (rest) return done(ORD[m[1].toLowerCase()] + '. ' + rest);
  }
  // "X branch of Y"
  m = core.match(/^(?:(.+?)\s+)?branch(?:es)?\s+of\s+(.+)$/i);
  if (m) {
    const owner = phraseOrName(m[2], system);
    if (owner) {
      const adj = m[1] ? ((translatePhrase(m[1]) || {}).tr || cap(m[1])) : '';
      return done(genitive(owner) + (adj ? ' ' + adj : '') + (/branches/i.test(core) ? ' Dalları' : ' Dalı'));
    }
  }
  // kas başı / karnı: "Long head of X", "Anterior belly of X"
  m = core.match(/^(.+?)\s+(head|belly)\s+of\s+(.+)$/i);
  if (m) {
    const owner = phraseOrName(m[3].replace(/\s+muscle$/i, ''), system) || phraseOrName(m[3], system);
    if (owner) {
      const adj = (translatePhrase(m[1]) || {}).tr || cap(m[1]);
      return done(genitive(owner) + ' ' + adj + (m[2].toLowerCase() === 'head' ? ' Başı' : ' Karnı'));
    }
  }
  // "Articular capsule of X"
  m = core.match(/^Articular capsule of (.+)$/i);
  if (m) { const o = phraseOrName(m[1], system); if (o) return done(o + ' Eklem Kapsülü'); }
  // (sıfat +) parça adı + of + sahip: "Head of pancreas", "Anterior root of spinal nerve"
  m = core.match(/^(?:(\w+)\s+)?([A-Za-z]+)\s+of\s+(.+)$/i);
  if (m && PART_POSS[m[2].toLowerCase()]) {
    const o = phraseOrName(m[3], system);
    if (o) {
      const adj = m[1] ? ((translatePhrase(m[1]) || {}).tr || cap(m[1])) + ' ' : '';
      return done(o + ' ' + adj + PART_POSS[m[2].toLowerCase()]);
    }
  }
  // "Artery of X" kalıbı
  m = core.match(/^(?:(\w+)\s+)?(Artery|Vein|Nerve) of (.+)$/i);
  if (m) {
    const o = phraseOrName(m[3], system);
    const noun = { artery: 'Arteri', vein: 'Veni', nerve: 'Siniri' }[m[2].toLowerCase()];
    const adj = m[1] ? ((wordTr(m[1]) || cap(m[1])) + ' ') : '';
    if (o) return done(o + ' ' + adj + noun);
  }
  // genel "of": ana yapı çevrilebiliyorsa "... (Sahip)" biçimi
  if (/\s+of\s+/i.test(core)) {
    const idx = core.toLowerCase().indexOf(' of ');
    const left = core.slice(0, idx), right = core.slice(idx + 4);
    const main = generate(left, system);
    const owner = main ? phraseOrName(right, system) : null;
    if (main && owner) return done(main + ' (' + owner + ')');
    return null;
  }
  // son isim kategorileri (artery, nerve, muscle...)
  const low = core.toLowerCase();
  for (const [suf, noun] of SUFFIX_NOUNS) {
    if (low.endsWith(suf)) {
      const headTxt = core.slice(0, -suf.length).trim();
      if (!headTxt) return null;
      const ph = translatePhrase(headTxt);
      if (ph) return done(ph.tr + ' ' + noun);
      if (suf === ' muscle' || suf === ' muscles') {
        const toks = headTxt.split(/\s+/);
        const latin = toks.map((t, i) => wordTr(t) || (i === 0 ? cap(t) : t.toLocaleLowerCase('tr'))).join(' ');
        return done(latin + ' ' + noun);
      }
      return null;
    }
  }
  // kas sistemi Latince yedeği: "Adductor hallucis" -> "Adductor hallucis Kası"
  if (system === 'muscle' && !/(fascia|bursa|septum|retinaculum|aponeurosis|sheath|fat|ligament|tendon|tract)/i.test(core)) {
    const toks = core.split(/\s+/);
    if (toks.length <= 4 && toks.every((t) => /^[A-Za-z-]+$/.test(t)) && !(toks.length === 1 && wordTr(toks[0]))) {
      const latin = toks.map((t, i) => wordTr(t) || (i === 0 ? cap(t) : t.toLocaleLowerCase('tr'))).join(' ');
      return done(latin + ' Kası');
    }
  }
  // son çare: tam cümle çevirisi (yüksek bilinen oranı)
  const ph = translatePhrase(core);
  if (ph && (ph.known === ph.total || (ph.total >= 2 && ph.known / ph.total >= .7))) return done(ph.tr);
  return null;
}

// Türkçe görüntü adı üret: sözlük > özel üreticiler > genel motor > null
export function turkishName(baseName, system) {
  if (!baseName || /^\?+$/.test(baseName.trim()) || /^\?x$/i.test(baseName.trim())) return null;
  const hit = lookupName(baseName);
  if (hit) return hit;
  return generate(baseName, system);
}
