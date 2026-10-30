// Static interface strings. Turkish text remains the source for restoration.
const UI = {
'İnsan anatomisi':['Human anatomy','تشريح الإنسان'], 'İNTERAKTİF REFERANS':['INTERACTIVE REFERENCE','مرجع تفاعلي'], '01 / Anatomi':['01 / Anatomy','01 / التشريح'],
'MUHAMMET TUĞRUL · İNTERAKTİF ANATOMİ ATLASI':['MUHAMMET TUĞRUL · INTERACTIVE ANATOMY ATLAS','محمد طغرل · أطلس التشريح التفاعلي'],
'Sınav Modu':['Quiz mode','وضع الاختبار'],'KEŞİF ALANI':['EXPLORE','استكشف'],'İnsan Anatomisi':['Human Anatomy','تشريح الإنسان'],'KATMAN KATMAN KEŞFET':['EXPLORE LAYER BY LAYER','اكتشف طبقة بعد طبقة'],
'Sistemler':['Systems','الأجهزة'],'Yapılar':['Structures','التراكيب'],'Katman Soyun':['Layers','الطبقات'],'Kaslar':['Muscles','العضلات'],
'Görünüm Teması':['Appearance','المظهر'],'doku + stüdyo ışığı':['texture + lighting','الملمس والإضاءة'],'Gerçekçi':['Realistic','واقعي'],'Sinematik':['Cinematic','سينمائي'],'Klinik':['Clinical','سريري'],
'Görüntü kalitesi':['Image quality','جودة الصورة'],'ekran çözünürlüğü':['screen resolution','دقة الشاشة'],'Dengeli':['Balanced','متوازن'],'Yüksek detay':['High detail','تفاصيل عالية'],'göz = göster / gizle':['eye = show / hide','العين = إظهار / إخفاء'],
'Bölgeye Uç':['Go to region','انتقل إلى منطقة'],'Tüm Vücut':['Whole body','الجسم كله'],'Baş & Boyun':['Head & neck','الرأس والعنق'],'Göğüs':['Chest','الصدر'],'Karın':['Abdomen','البطن'],'Kol':['Arm','الذراع'],'Bacak':['Leg','الساق'],
'Hazır Ders Görünümleri':['Study views','عروض دراسية'],'Kalp & Büyük Damarlar':['Heart & great vessels','القلب والأوعية الكبرى'],'Solunum Sistemi':['Respiratory system','الجهاز التنفسي'],'Sindirim Sistemi':['Digestive system','الجهاز الهضمي'],'Sinir Sistemi':['Nervous system','الجهاز العصبي'],'İskelet Posteri':['Skeleton','الهيكل العظمي'],'Kas Posteri (Écorché)':['Muscles (écorché)','العضلات'],
'🎓 Rehberli Ders Turları':['🎓 Guided tours','🎓 جولات تعليمية'],'anlatım + kamera':['guide + camera','شرح وكاميرا'],'ATLAS REHBERİ':['ATLAS GUIDE','دليل الأطلس'],'Keşfetmeye başla':['Start exploring','ابدأ الاستكشاف'],
"Model üzerinde herhangi bir yapıyı tıklayın — bilgi kartı burada açılır. Atlas 1.600'den fazla anatomik yapı içerir; katmanları açıp kapatarak insan vücudunu keşfedebilirsiniz.":['Click any structure on the model to open its information card. Explore over 1,600 structures by switching layers on and off.','انقر على أي تركيب في النموذج لفتح بطاقة معلوماته. استكشف أكثر من ١٦٠٠ تركيب بتشغيل الطبقات وإيقافها.'],
'Sürükle':['Drag','اسحب'],'döndür ·':['to rotate ·','للتدوير ·'],'Tekerlek':['Scroll','عجلة الفأرة'],'yakınlaştır':['to zoom','للتكبير'],'Tıkla':['Click','انقر'],'yapı seç ·':['to select ·','للاختيار ·'],'Çift tık':['Double-click','نقرة مزدوجة'],'odaklan':['to focus','للتركيز'],'sistemleri aç/kapat ·':['toggle systems ·','لتبديل الأجهزة ·'],'kamerayı sıfırla':['reset camera','لإعادة الكاميرا'],
'💡 BİLİYOR MUYDUNUZ?':['💡 DID YOU KNOW?','💡 هل تعلم؟'],'sistem':['systems','أجهزة'],'İşlevleri':['Functions','الوظائف'],'🩺 Klinik Not':['🩺 Clinical note','🩺 ملاحظة سريرية'],'Kaynak Tanımı (Wikipedia)':['Source definition (Wikipedia)','تعريف المصدر (ويكيبيديا)'],"Wikipedia'da oku →":['Read on Wikipedia →','اقرأ في ويكيبيديا ←'],'◎ Odaklan':['◎ Focus','◎ تركيز'],
'Ön':['Front','أمام'],'Arka':['Back','خلف'],'Sol':['Left','يسار'],'Sağ':['Right','يمين'],'Patlat':['Explode','تفكيك'],'Aksiyal':['Axial','محوري'],'Sagital':['Sagittal','سهمي'],'Koronal':['Coronal','إكليلي'],'Etiketler':['Labels','الأسماء'],'X-Işını':['X-ray','أشعة'],'Döndür':['Rotate','تدوير'],'🔗 Paylaş':['🔗 Share','🔗 مشاركة'],'⟲ Sıfırla':['⟲ Reset','⟲ إعادة ضبط'],
'← Önceki':['← Previous','السابق →'],'Sonraki →':['Next →','← التالي'],'✕ Çık':['✕ Exit','✕ خروج'],'Şu yapıyı bul ve tıkla:':['Find and click this structure:','ابحث عن هذا التركيب وانقر عليه:'],'Pas →':['Skip →','تخطي ←'],
'🎓 Sınav Modu':['🎓 Quiz mode','🎓 وضع الاختبار'],
'Adı verilen yapıyı 3B model üzerinde bulup tıklayın. Her soru 20 saniye, 3 yanlış hakkı. Seri yaptıkça puan katsayısı artar. Arkadaşınıza meydan okumaya hazır mısınız?':['Find the named structure on the 3D model. Each question has 20 seconds and three attempts. Streaks increase your score.','ابحث عن التركيب المطلوب على النموذج الثلاثي الأبعاد. لكل سؤال ٢٠ ثانية وثلاث محاولات. تزيد الإجابات المتتالية من نقاطك.'],
'🦴 İskelet':['🦴 Skeleton','🦴 الهيكل العظمي'],'💪 Kaslar':['💪 Muscles','💪 العضلات'],'🫀 İç Organlar & Damarlar':['🫀 Organs & vessels','🫀 الأعضاء والأوعية'],'🧠 Sinir Sistemi':['🧠 Nervous system','🧠 الجهاز العصبي'],'⭐ Yıldızlılarım':['⭐ My favourites','⭐ المفضلة'],'Vazgeç':['Cancel','إلغاء'],'puan':['points','نقاط'],'📋 Sonucu Kopyala & Meydan Oku':['📋 Copy result','📋 نسخ النتيجة'],'Tekrar Dene':['Try again','حاول مجدداً'],'Kapat':['Close','إغلاق'],
'Proje ve Kaynaklar':['Project & sources','المشروع والمصادر'],'Proje sahibi':['Project creator','صاحب المشروع'],'· TUĞRUL ATLAS tasarım ve geliştirme.':['· TUĞRUL ATLAS design and development.','· تصميم وتطوير أطلس طغرل.'],'Anatomik model verileri':['Anatomical model data','بيانات النموذج التشريحي'],
'2.827 parçalı gerçek anatomik model, açık kaynak':['The 2,827-part anatomical model is based on the open-source','النموذج التشريحي المكون من ٢٨٢٧ جزءاً مستمد من مشروع'],'projesinin':['project’s','مفتوح المصدر ومن بيانات'],'(The Database Center for Life Science, Japonya) tabanlı verisidir; glTF çıktısı':['data (Database Center for Life Science, Japan); the glTF export comes from','(مركز قواعد بيانات علوم الحياة، اليابان)؛ تم الحصول على ملفات glTF من'],
'deposundan alınmıştır. Bu uygulamada yüzey malzemeleri, renk ve aydınlatma sunumu değiştirilmiştir; amblemde aynı veri kümesinden kafatası görüntüsü kullanılmıştır.':['. Surface materials, colours and lighting were changed; the emblem uses a skull image from the same dataset.','. عُدّلت المواد والألوان والإضاءة؛ ويستخدم الشعار صورة جمجمة من مجموعة البيانات نفسها.'],
'Türkçe içerik ve arayüz':['Content and interface','المحتوى والواجهة'],
'TUĞRUL ATLAS; Türkçe yapı adları, açıklamalar, ders turları, sınav modu ve etkileşimli 3B görüntüleme araçlarını bir araya getirir.':['TUĞRUL ATLAS combines anatomical names, descriptions, guided tours, quizzes and interactive 3D viewing tools.','يجمع أطلس طغرل بين أسماء التراكيب والجولات والاختبارات وأدوات العرض التفاعلية ثلاثية الأبعاد.'],
'☰ Sistemler':['☰ Systems','☰ الأجهزة'],'ℹ Bilgi':['ℹ Info','ℹ المعلومات'],'İNSAN VÜCUDU · KATMAN KATMAN':['THE HUMAN BODY · LAYER BY LAYER','جسم الإنسان · طبقة بعد طبقة'],'Anatomi atlası yükleniyor…':['Loading anatomy atlas…','جارٍ تحميل أطلس التشريح…'],'Yeniden dene':['Retry','إعادة المحاولة'],
};
const attributes = {
'Yapı ara…  (örn. femur, kalp, siyatik, aorta)':['Search structures… (e.g. femur, heart)','ابحث عن تركيب… (مثل القلب أو عظم الفخذ)'],
'Listede filtrele…':['Filter list…','تصفية القائمة…'], 'Kaynaklar ve lisanslar':['Sources and licences','المصادر والتراخيص'], 'Ekran görüntüsü indir (arkadaşına gönder 😉)':['Download screenshot','تنزيل لقطة الشاشة'], 'Tam ekran':['Full screen','ملء الشاشة'], 'Sınav Modu':['Quiz mode','وضع الاختبار'],
'Kasları örten fasya katmanını göster veya gizle':['Show or hide fascia','إظهار أو إخفاء اللفافة'], 'Görüntü kalitesi':['Image quality','جودة الصورة'], 'Kamera görünümü':['Camera view','منظور الكاميرا'],'Kesit düzlemleri':['Section planes','مستويات القطع'],'Aksiyal kesit':['Axial section','مقطع محوري'],'Sagital kesit':['Sagittal section','مقطع سهمي'],'Koronal kesit':['Coronal section','مقطع إكليلي'],
'Sadece yıldızlı (çalışma listesi) yapıları göster':['Show favourites only','عرض المفضلة فقط'],'Çalışma listeme ekle':['Add to favourites','أضف إلى المفضلة'],'Turdan çık (Esc)':['Exit tour (Esc)','الخروج من الجولة (Esc)'],'Yeni bilgi':['New fact','معلومة جديدة'],'Kapat':['Close','إغلاق'],'Bu görünümün (kamera + seçim + katman + tema) linkini kopyala':['Copy a link to this view','نسخ رابط هذا المنظور'],'Proje sahibi, kaynaklar ve lisanslar':['Project creator, sources and licences','صاحب المشروع والمصادر والتراخيص'],
};
export const systems = {
 bone:['Skeletal system','الجهاز الهيكلي'],joint:['Joints & ligaments','المفاصل والأربطة'],muscle:['Muscular system','الجهاز العضلي'],organ:['Internal organs','الأعضاء الداخلية'],vessel:['Circulatory system','الجهاز الدوري'],lymph:['Lymphatic system','الجهاز اللمفاوي'],nerve:['Nervous system','الجهاز العصبي'],skin:['Integument','الجهاز اللحافي']
};
// Exact structure names only: unknown Arabic names fall back to the English source name.
export const arabicNames = {
 'Frontal bone':'العظم الجبهي','Parietal bone':'العظم الجداري','Temporal bone':'العظم الصدغي','Occipital bone':'العظم القذالي','Mandible':'الفك السفلي','Maxilla':'الفك العلوي','Zygomatic bone':'العظم الوجني','Sphenoid bone':'العظم الوتدي','Ethmoid bone':'العظم الغربالي','Nasal bone':'عظم الأنف',
 'Atlas (C1)':'الأطلس (الفقرة الرقبية الأولى)','Axis (C2)':'المحور (الفقرة الرقبية الثانية)','Sternum':'عظم القص','Clavicle':'الترقوة','Scapula':'لوح الكتف','Humerus':'عظم العضد','Radius':'الكعبرة','Ulna':'الزند','Pelvis':'الحوض','Femur':'عظم الفخذ','Patella':'الرضفة','Tibia':'الظنبوب','Fibula':'الشظية','Sacrum':'العجز','Coccyx':'العصعص',
 'Left atrium':'الأذين الأيسر','Right atrium':'الأذين الأيمن','Left ventricle':'البطين الأيسر','Right ventricle':'البطين الأيمن','Ascending aorta':'الأبهر الصاعد','Abdominal aorta':'الأبهر البطني','Thoracic aorta':'الأبهر الصدري','Pulmonary trunk':'الجذع الرئوي','Superior vena cava':'الوريد الأجوف العلوي','Inferior vena cava':'الوريد الأجوف السفلي',
 'Trachea':'القصبة الهوائية','Right main bronchus':'القصبة الرئيسية اليمنى','Left main bronchus':'القصبة الرئيسية اليسرى','Superior lobe of right lung':'الفص العلوي للرئة اليمنى','Diaphragm':'الحجاب الحاجز','Liver':'الكبد','Stomach':'المعدة','Gallbladder':'المرارة','Pancreas':'البنكرياس','Kidney':'الكلية','Ureter':'الحالب','Urinary bladder':'المثانة البولية','Oesophagus':'المريء','Esophagus':'المريء','Duodenum':'الاثنا عشر','Jejunum':'الصائم','Ileum':'اللفائفي','Appendix':'الزائدة الدودية','Spleen':'الطحال',
 'Corpus callosum':'الجسم الثفني','Thalamus':'المهاد','Hypothalamus':'تحت المهاد','Spinal cord':'النخاع الشوكي','White matter of spinal cord':'المادة البيضاء للنخاع الشوكي','Sciatic nerve':'العصب الوركي','Optic nerve (II)':'العصب البصري','Optic chiasm':'التصالب البصري','Occipital pole':'القطب القذالي','Anterior segment of eyeball':'الجزء الأمامي لمقلة العين','Middle trunk of brachial plexus':'الجذع الأوسط للضفيرة العضدية',
 'Anterior quadrangular lobule':'الفصيص الرباعي الأمامي', 'Superficial part of masseter':'الجزء السطحي من العضلة الماضغة', 'Left renal artery':'الشريان الكلوي الأيسر',
 'Acromial part of deltoid muscle':'الجزء الأخرمي من العضلة الدالية', 'Clavicular part of deltoid muscle':'الجزء الترقوي من العضلة الدالية', 'Scapular spinal part of deltoid muscle':'الجزء الشوكي من العضلة الدالية',
 'Long head of biceps brachii':'الرأس الطويل للعضلة ذات الرأسين العضدية', 'Short head of biceps brachii':'الرأس القصير للعضلة ذات الرأسين العضدية', 'Long head of triceps brachii':'الرأس الطويل للعضلة ثلاثية الرؤوس العضدية', 'Lateral head of triceps brachii':'الرأس الوحشي للعضلة ثلاثية الرؤوس العضدية', 'Medial head of triceps brachii':'الرأس الإنسي للعضلة ثلاثية الرؤوس العضدية',
 'Lateral head of gastrocnemius':'الرأس الوحشي للعضلة التوأمية', 'Medial head of gastrocnemius':'الرأس الإنسي للعضلة التوأمية', 'Brachialis muscle':'العضلة العضدية', 'Sartorius muscle':'العضلة الخياطية', 'Soleus muscle':'العضلة النعلية', 'Temporalis muscle':'العضلة الصدغية', 'Pectoralis minor muscle':'العضلة الصدرية الصغرى', 'Gluteus medius muscle':'العضلة الألوية الوسطى', 'Gluteus minimus muscle':'العضلة الألوية الصغرى',
 'Deltoid muscle':'العضلة الدالية','Biceps brachii muscle':'العضلة ذات الرأسين العضدية','Triceps brachii muscle':'العضلة ثلاثية الرؤوس العضدية','Pectoralis major muscle':'العضلة الصدرية الكبرى','Rectus abdominis muscle':'العضلة المستقيمة البطنية','Gluteus maximus muscle':'العضلة الألوية الكبرى','Rectus femoris muscle':'العضلة المستقيمة الفخذية','Gastrocnemius muscle':'العضلة التوأمية','Trapezius muscle':'العضلة شبه المنحرفة','Latissimus dorsi muscle':'العضلة الظهرية العريضة',
};
export const tours = {
 kalp:[['Journey of a Drop of Blood','رحلة قطرة دم'],['Follow blood through the heart and lungs','تتبع الدم عبر القلب والرئتين']],
 solunum:[['Following a Breath','رحلة النفس'],['Explore the respiratory pathway','استكشف مسار التنفس']],
 sindirim:[['Journey of a Meal','رحلة الطعام'],['Explore the digestive system','استكشف الجهاز الهضمي']],
 sinir:[['The Nervous System','الجهاز العصبي'],['From the brain to the body','من الدماغ إلى الجسم']],
 iskelet:[['Skeleton: Head to Toe','الهيكل العظمي من الرأس إلى القدم'],['Explore the bones','استكشف العظام']],
 kas:[['Muscle Power','قوة العضلات'],['Explore major muscles','استكشف العضلات الرئيسية']],
 bosaltim:[['The Urinary System','الجهاز البولي'],['From kidneys to bladder','من الكليتين إلى المثانة']],
 gorme:[['The Visual Pathway','المسار البصري'],['From the eye to the brain','من العين إلى الدماغ']],
};
export function pick(lang, tr, en, ar) { return lang === 'ar' ? ar : lang === 'en' ? en : tr; }
export function structureName(lang, d) { return lang === 'tr' ? d.name : lang === 'ar' ? (arabicNames[d.en] || d.en) : d.en; }
export function translateSystem(lang, key, tr) { return lang === 'tr' ? tr : systems[key]?.[lang === 'ar' ? 1 : 0] || tr; }
export function tourTitle(lang, tour) { return lang === 'tr' ? tour.title : tours[tour.id]?.[0][lang === 'ar' ? 1 : 0] || tour.title; }
export function tourDesc(lang, tour) { return lang === 'tr' ? tour.desc : tours[tour.id]?.[1][lang === 'ar' ? 1 : 0] || tour.desc; }
export function captureStaticTranslations(root) {
 const nodes = [];
 const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
 while(walker.nextNode()) {
   const node=walker.currentNode, original=node.nodeValue, key=original.trim().replace(/\s+/g,' ');
   if(UI[key]) nodes.push({node,original,key});
 }
 const attrs=[];
 for(const el of root.querySelectorAll('[title],[placeholder],[aria-label]')) for(const attr of ['title','placeholder','aria-label']) {
  const value=el.getAttribute(attr); if(attributes[value]) attrs.push({el,attr,value});
 }
 return (lang) => {
  const idx=lang==='ar'?1:0;
  for(const {node,original,key} of nodes) node.nodeValue=lang==='tr'?original:original.replace(original.trim(),UI[key][idx]);
  for(const {el,attr,value} of attrs) el.setAttribute(attr,lang==='tr'?value:attributes[value][idx]);
 };
}
// Brief multilingual tour summaries; the full Turkish narrative remains available in Turkish.
const stepNotes = {
 vena_cava:['The venae cavae return blood from the body to the right atrium.','يعيد الوريدان الأجوفان الدم من الجسم إلى الأذين الأيمن.'],
 heart:['The heart pumps blood through the pulmonary and systemic circulations.','يضخ القلب الدم عبر الدورة الرئوية والدورة الدموية الجهازية.'],
 pulmonary:['The pulmonary artery carries blood from the heart to the lungs.','ينقل الشريان الرئوي الدم من القلب إلى الرئتين.'],
 lungs:['Gas exchange occurs in the lungs: oxygen enters the blood and carbon dioxide leaves it.','يحدث تبادل الغازات في الرئتين: يدخل الأكسجين إلى الدم ويخرج ثاني أكسيد الكربون.'],
 aorta:['The aorta carries oxygenated blood from the heart to the body.','ينقل الشريان الأبهر الدم المؤكسج من القلب إلى الجسم.'],
 trachea:['The airways carry air between the larynx and the lungs.','تنقل الممرات الهوائية الهواء بين الحنجرة والرئتين.'],
 diaphragm:['The diaphragm contracts and descends during inspiration.','ينقبض الحجاب الحاجز وينخفض أثناء الشهيق.'],
 ribs:['The ribs protect the chest organs and move during breathing.','تحمي الأضلاع أعضاء الصدر وتتحرك أثناء التنفس.'],
 esophagus:['The oesophagus moves swallowed food towards the stomach.','ينقل المريء الطعام المبتلع نحو المعدة.'],stomach:['The stomach mixes food with acid and digestive juices.','تخلط المعدة الطعام بالحمض والعصارات الهضمية.'],
 liver:['The liver processes nutrients and produces bile.','يعالج الكبد المغذيات وينتج الصفراء.'],gallbladder:['The gallbladder stores and concentrates bile.','تخزن المرارة الصفراء وتزيد تركيزها.'],pancreas:['The pancreas produces digestive enzymes and hormones including insulin.','ينتج البنكرياس إنزيمات هضمية وهرمونات منها الإنسولين.'],
 small_intestine:['Most nutrient absorption takes place in the small intestine.','يحدث معظم امتصاص المغذيات في الأمعاء الدقيقة.'],large_intestine:['The large intestine absorbs water and forms stool.','تمتص الأمعاء الغليظة الماء وتكوّن البراز.'],
 brain:['The brain integrates sensory information and controls many body functions.','يدمج الدماغ المعلومات الحسية ويتحكم في وظائف عديدة للجسم.'],cerebellum:['The cerebellum helps coordinate movement and balance.','يساعد المخيخ على تنسيق الحركة والتوازن.'],brainstem:['The brainstem connects the brain and spinal cord and regulates vital functions.','يربط جذع الدماغ الدماغ بالنخاع الشوكي وينظم الوظائف الحيوية.'],
 spinal_cord:['The spinal cord carries signals between the brain and the body.','ينقل النخاع الشوكي الإشارات بين الدماغ والجسم.'],brachial_plexus:['The brachial plexus supplies the shoulder and upper limb.','تعصب الضفيرة العضدية الكتف والطرف العلوي.'],sciatic:['The sciatic nerve travels from the pelvis into the lower limb.','يمتد العصب الوركي من الحوض إلى الطرف السفلي.'],optic_nerve:['The visual pathway carries information from the eye to the brain.','ينقل المسار البصري المعلومات من العين إلى الدماغ.'],
 cranium:['The skull protects the brain and supports the structures of the face.','تحمي الجمجمة الدماغ وتدعم تراكيب الوجه.'],humerus:['The humerus connects the shoulder and elbow.','يصل عظم العضد بين الكتف والمرفق.'],hand_bones:['The bones of the hand support grasping and fine movement.','تدعم عظام اليد الإمساك والحركات الدقيقة.'],pelvis:['The pelvis transfers weight from the trunk to the lower limbs.','ينقل الحوض وزن الجذع إلى الطرفين السفليين.'],femur:['The femur is the long bone of the thigh.','عظم الفخذ هو العظم الطويل في الفخذ.'],patella:['The patella protects the front of the knee.','تحمي الرضفة الجزء الأمامي من الركبة.'],foot_bones:['The foot bones support balance and movement.','تدعم عظام القدم التوازن والحركة.'],
 masseter:['The masseter is a muscle of chewing.','العضلة الماضغة من عضلات المضغ.'],deltoid:['The deltoid helps move the shoulder.','تساعد العضلة الدالية على تحريك الكتف.'],biceps:['The biceps helps flex the elbow and rotate the forearm.','تساعد العضلة ذات الرأسين على ثني المرفق وتدوير الساعد.'],rectus_abdominis:['The rectus abdominis helps flex and stabilise the trunk.','تساعد العضلة المستقيمة البطنية على ثني الجذع وتثبيته.'],gluteus:['The gluteal muscles support the hip and move the thigh.','تدعم العضلات الألوية الورك وتحرك الفخذ.'],quadriceps:['The quadriceps extends the knee.','تبسط العضلة رباعية الرؤوس الركبة.'],gastrocnemius:['The gastrocnemius helps point the foot and flex the knee.','تساعد العضلة التوأمية على بسط القدم وثني الركبة.'],
 renal_vessels:['The renal vessels carry blood to and from the kidneys.','تنقل الأوعية الكلوية الدم من الكليتين وإليهما.'],kidneys:['The kidneys filter blood and form urine; the ureters carry urine to the bladder.','ترشح الكليتان الدم وتكوّنان البول؛ وينقل الحالبان البول إلى المثانة.'],bladder:['The urinary bladder stores urine before it is expelled.','تخزن المثانة البول قبل إخراجه.'],eye:['The eye receives light and begins the visual process.','تستقبل العين الضوء وتبدأ عملية الإبصار.'],
};
export function tourNote(lang, step) { return stepNotes[step.info]?.[lang === 'ar' ? 1 : 0] || pick(lang, '', 'Explore the highlighted structure.', 'استكشف التركيب المحدد.'); }
