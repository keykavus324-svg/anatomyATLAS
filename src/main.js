// TUĞRUL ATLAS — İnteraktif Anatomi Atlası (uygulama mantığı)
// Gerçek anatomik model: açık kaynak Z-Anatomy veri kümesi.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { INFO, SYSTEMS } from './data.js';
import { loadRealBody, REAL_SYS_ORDER } from './realBody.js';
import { TOURS } from './tours.js';
import { createVisiblePickCache, targetOpacity } from './visibility.js';
import { configurePanControls } from './cameraPan.js';
import { pick, structureName, translateSystem, tourTitle, tourDesc, tourNote, captureStaticTranslations, arabicNames } from './i18n.js';

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
let lang = (() => { try { const value = localStorage.getItem('tugrul-language'); return ['tr', 'en', 'ar'].includes(value) ? value : 'tr'; } catch { return 'tr'; } })();
const tr = (turkish, english, arabic) => pick(lang, turkish, english, arabic);
const nameOf = (d) => structureName(lang, d);
const systemName = (id) => translateSystem(lang, id, SYSTEMS[id].tr);
const translateStatic = captureStaticTranslations(document.body);
const originalLicenceNotice = document.querySelector('.credit-block .lic').textContent;
const layerName = (key) => ({
  kas: tr('Kaslar', 'Muscles', 'العضلات'), iskelet: tr('İskelet', 'Skeleton', 'الهيكل العظمي'),
  ic: tr('İç Yapılar', 'Internal', 'الأعضاء'), tumu: tr('Tümü', 'All', 'الكل'),
})[key];

/* ================= SAHNE ================= */
const stage = $('#stage');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
// DPR üst sınırı kullanıcı tarafından değiştirilebilir; geometri değiştirilmez.
const QUALITY_CAP = { balanced: 1, high: 2 };
let graphicsQuality = (() => { try { const q = localStorage.getItem('corpus-quality'); return QUALITY_CAP[q] ? q : 'high'; } catch { return 'high'; } })();
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, QUALITY_CAP[graphicsQuality]));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.06;
renderer.localClippingEnabled = true;
renderer.setClearColor(0x000000, 0);
stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, .1, 120);
camera.position.set(11, 7.5, 19);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;
scene.environmentIntensity = .5;

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 5, 0);
controls.enableDamping = true; controls.dampingFactor = .06;
controls.enablePan = true;
controls.screenSpacePanning = true;
controls.minDistance = .8; controls.maxDistance = 30;
controls.maxPolarAngle = 1.66;
controls.autoRotate = true; controls.autoRotateSpeed = .8;

const hemi = new THREE.HemisphereLight(0xf4e9dc, 0x2c2420, .55); scene.add(hemi);
const key = new THREE.DirectionalLight(0xffffff, 2.4);
key.position.set(6, 13, 7); key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -7; key.shadow.camera.right = 7;
key.shadow.camera.top = 13; key.shadow.camera.bottom = -3;
key.shadow.camera.far = 40; key.shadow.bias = -.0006; key.shadow.normalBias = .02;
scene.add(key);
const rim = new THREE.DirectionalLight(0xd4c7b5, 1.5); rim.position.set(-8, 6, -9); scene.add(rim);
const fill = new THREE.DirectionalLight(0xffe8da, .5); fill.position.set(-6, 3, 9); scene.add(fill);

/* hologram masası */
{
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(2.9, 3.05, .12, 64),
    new THREE.MeshStandardMaterial({ color: 0x292723, roughness: .72, metalness: .15 }));
  disc.position.y = -.06; disc.receiveShadow = true; scene.add(disc);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.9, .018, 8, 90), new THREE.MeshBasicMaterial({ color: 0xb1936b }));
  ring.rotation.x = Math.PI / 2; ring.position.y = .004; scene.add(ring);
  const polar = new THREE.PolarGridHelper(2.82, 12, 5, 48, 0x62584c, 0x4a423b);
  polar.position.y = .008; polar.material.transparent = true; polar.material.opacity = .5; scene.add(polar);
  const shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), new THREE.ShadowMaterial({ opacity: .32 }));
  shadowPlane.rotation.x = -Math.PI / 2; shadowPlane.position.y = -.13; shadowPlane.receiveShadow = true; scene.add(shadowPlane);
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(128, 128, 8, 128, 128, 128);
  grad.addColorStop(0, 'rgba(209,167,115,.16)'); grad.addColorStop(.55, 'rgba(209,167,115,.05)'); grad.addColorStop(1, 'rgba(34,211,238,0)');
  g.fillStyle = grad; g.fillRect(0, 0, 256, 256);
  const glow = new THREE.Mesh(new THREE.CircleGeometry(5.2, 48),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  glow.rotation.x = -Math.PI / 2; glow.position.y = -.12; scene.add(glow);
  // gerçek model golge dusurmez (performans): ayak altina yumusak temas golgesi
  const bc = document.createElement('canvas'); bc.width = bc.height = 256;
  const bgc = bc.getContext('2d');
  const bgrad = bgc.createRadialGradient(128, 128, 10, 128, 128, 126);
  bgrad.addColorStop(0, 'rgba(0,0,0,.62)'); bgrad.addColorStop(.55, 'rgba(0,0,0,.30)'); bgrad.addColorStop(1, 'rgba(0,0,0,0)');
  bgc.fillStyle = bgrad; bgc.fillRect(0, 0, 256, 256);
  const blob = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.7),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(bc), transparent: true, depthWrite: false }));
  blob.rotation.x = -Math.PI / 2; blob.position.y = .007; blob.name = 'contactBlob'; blob.visible = false;
  scene.add(blob);
  const n = 340, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const r = 4 + Math.random() * 15, a = Math.random() * Math.PI * 2;
    pos[i * 3] = Math.cos(a) * r; pos[i * 3 + 1] = Math.random() * 13 - .5; pos[i * 3 + 2] = Math.sin(a) * r;
  }
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(dg, new THREE.PointsMaterial({ color: 0xb6ab9c, size: .025, transparent: true, opacity: .22, depthWrite: false }));
  dust.name = 'dust'; scene.add(dust);
}

const contactBlob = scene.getObjectByName('contactBlob');

/* ================= MODELLER ================= */
const clipPlane = new THREE.Plane(V3(0, -1, 0), 100);
const clipSag = new THREE.Plane(V3(-1, 0, 0), 100);
const clipCor = new THREE.Plane(V3(0, 0, -1), 100);
const clipPlanes = [clipPlane, clipSag, clipCor];
const RENDER_ORDER = { bone: 1, joint: 1, organ: 2, muscle: 2, vessel: 3, lymph: 3, nerve: 3, skin: 6 };

const REAL_LAYERS = {
  kas:     { label: 'Kaslar',     v: { muscle: 1 } },
  iskelet: { label: 'İskelet',    v: { bone: 1, joint: 1 } },
  ic:      { label: 'İç Yapılar', v: { bone: .16, organ: 1, vessel: 1, nerve: 1, lymph: .6 } },
  tumu:    { label: 'Tümü',       v: { bone: 1, joint: 1, muscle: 1, organ: 1, vessel: 1, lymph: 1, nerve: 1 } },
};

function wrapModel(kind, built, extra = {}) {
  return {
    kind,
    root: built.body || built.root,
    parts: built.parts, structures: built.structures, pickMeshes: built.pickMeshes,
    pickCache: createVisiblePickCache(built.pickMeshes),
    db: extra.db, ids: extra.ids, sysOrder: extra.sysOrder, layers: extra.layers,
    defaultLayer: extra.defaultLayer,
    systems: Object.fromEntries(extra.sysOrder.map((s) => [s, 0])),
    fade: new Map(extra.ids.map((id) => [id, 0])),
    applied: new Map(),
    meta: built.meta || null,
  };
}
// Yükleme bitene kadar boş, etkileşimsiz atlas durumu; alternatif model yok.
let RM = null;
let M = wrapModel('real', { root: new THREE.Group(), parts: [], structures: new Map(), pickMeshes: [], meta: { meshCount: 0, entryCount: 0 } }, {
  db: {}, ids: [], sysOrder: REAL_SYS_ORDER, layers: REAL_LAYERS, defaultLayer: 'kas',
});

const xrayCache = new Map();
function xrayMatFor(kind, id) {
  const k = kind + ':' + id;
  if (!xrayCache.has(k)) {
    const m = new THREE.MeshPhysicalMaterial({
      color: 0x86d7ff, roughness: .25, metalness: .1, transparent: true,
      emissive: 0x0b3d5c, emissiveIntensity: .8, clippingPlanes: clipPlanes, depthWrite: false,
    });
    m.userData = { baseOpacity: .30, baseEmissive: 0x0b3d5c, baseEmissiveIntensity: .8 };
    xrayCache.set(k, m);
  }
  return xrayCache.get(k);
}
function prepareModel(mdl) {
  for (const p of mdl.parts) {
    for (const m of p.mats) {
      m.clippingPlanes = clipPlanes;
      if (m.emissive) {
        m.userData.baseEmissive = m.emissive.getHex();
        m.userData.baseEmissiveIntensity = m.emissiveIntensity;
      }
      if (m.userData.baseOpacity === undefined) m.userData.baseOpacity = 1;
      if (m.color && m.userData.baseColor === undefined) m.userData.baseColor = m.color.getHex();
      if (m.roughness !== undefined && m.userData.baseRoughness === undefined) m.userData.baseRoughness = m.roughness;
    }
    for (const mesh of p.meshes) {
      mesh.userData.origMat = mesh.material;
      mesh.renderOrder = RENDER_ORDER[p.system] ?? 1;
    }
  }
}

/* ================= GORUNUM TEMALARI =================
   Renk doygunlugu/acikligi + puruzluluk + studo isiklari hep birlikte
   sekillenir. Varsayilan "Gercekci": derin doku renkleri, islak parlama. */
const VISUAL_THEMES = {
  atlas:     { label: 'Atlas',     sat: -.05, light: .015, roughF: 1,    exposure: 1.03, env: .55, hemi: .65, keyI: 2.15, rimI: .8, fillI: .65 },
  gercekci:  { label: 'Gerçekçi',  sat: .01,  light: -.01, roughF: 1,    exposure: .98,  env: .55, hemi: .55, keyI: 2.3, rimI: 1, fillI: .6 },
  sinematik: { label: 'Sinematik', sat: .02,  light: -.06, roughF: 1.05, exposure: .95,  env: .4,  hemi: .3, keyI: 2.4, rimI: 1.65, fillI: .3 },
  klinik:    { label: 'Klinik',    sat: -.15, light: .055, roughF: 1.1,  exposure: 1.1,  env: .65, hemi: .85, keyI: 1.9, rimI: .7, fillI: .8 },
};
let visualTheme = (() => { try { const t = localStorage.getItem('corpus-theme'); return VISUAL_THEMES[t] ? t : 'gercekci'; } catch { return 'gercekci'; } })();
// sistem bazinda baz duzeltmeler (her temanin altinda uygulanir)
const SYS_GRADE = {
  bone:   { ds: -.18, dl: .07 },
  joint:  { ds: -.10, dl: .03 },
  muscle: { ds: 0,    dl: 0 },
  organ:  { ds: 0,    dl: 0 },
  vessel: { ds: 0,    dl: 0 },
  lymph:  { ds: 0,    dl: -.01 },
  nerve:  { ds: -.05, dl: 0 },
};
const _themeColor = new THREE.Color();
function applyVisualTheme(name, { announce = false } = {}) {
  visualTheme = VISUAL_THEMES[name] ? name : 'gercekci';
  const T = VISUAL_THEMES[visualTheme];
  try { localStorage.setItem('corpus-theme', visualTheme); } catch {}
  document.body.dataset.vtheme = visualTheme;
  renderer.toneMappingExposure = T.exposure;
  scene.environmentIntensity = T.env;
  hemi.intensity = T.hemi; key.intensity = T.keyI; rim.intensity = T.rimI; fill.intensity = T.fillI;
  for (const mdl of [RM]) {
    if (!mdl) continue;
    for (const part of mdl.parts) for (const m of part.mats) {
      if (m.color && m.userData.baseColor !== undefined) {
        const G = SYS_GRADE[part.system] || { ds: 0, dl: 0 };
        _themeColor.setHex(m.userData.baseColor);
        _themeColor.offsetHSL(0, T.sat + G.ds, T.light + G.dl);
        m.color.copy(_themeColor);
      }
      if (m.roughness !== undefined && m.userData.baseRoughness !== undefined)
        m.roughness = clamp(m.userData.baseRoughness * T.roughF, .05, 1);
      if (m.envMapIntensity !== undefined) m.envMapIntensity = .6;
    }
  }
  $$('#themeSeg button').forEach((b) => b.classList.toggle('active', b.dataset.vtheme === visualTheme));
  if (announce) toast(tr('🎨 Görünüm: ', '🎨 Appearance: ', '🎨 المظهر: ') + ($(`#themeSeg button[data-vtheme="${visualTheme}"]`)?.textContent || T.label));
}
$$('#themeSeg button').forEach((b) => b.onclick = () => applyVisualTheme(b.dataset.vtheme, { announce: true }));
applyVisualTheme(visualTheme);
function applyGraphicsQuality(value) {
  graphicsQuality = QUALITY_CAP[value] ? value : 'high';
  try { localStorage.setItem('corpus-quality', graphicsQuality); } catch {}
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, QUALITY_CAP[graphicsQuality]));
  renderer.setSize(innerWidth, innerHeight);
  $$('#qualitySeg button').forEach((b) => {
    const active = b.dataset.quality === graphicsQuality;
    b.classList.toggle('active', active); b.setAttribute('aria-pressed', String(active));
  });
}
$$('#qualitySeg button').forEach((b) => b.addEventListener('click', () => applyGraphicsQuality(b.dataset.quality)));
applyGraphicsQuality(graphicsQuality);

/* ================= DURUM ================= */
const tourState = { active: null, idx: 0, isolatedId: null, savedClips: null, clipEdited: false };
// Eski gerçek atlas favorileri aynı depolama anahtarından korunur.
const STAR_KEY = 'corpus-stars-v1';
let stars = { real: [] };
try {
  const saved = JSON.parse(localStorage.getItem(STAR_KEY) || '{}');
  for (const kind of ['real']) if (Array.isArray(saved[kind]))
    stars[kind] = [...new Set(saved[kind].filter((x) => typeof x === 'string'))];
} catch {}
let starsOnly = false;
const state = {
  selected: null, lastSide: null, hovered: null, isolate: null, override: null,
  xray: false, labels: false, spin: true, pan: false, explode: 0, showFascia: false,
};
function targetFor(id) {
  return targetOpacity(id, M.db[id].system, state, M.systems);
}
function dbGet(id) { return M.db[id]; }

/* ================= VURGULAMA ================= */
const flashState = new Map();
let highlighted = new Set();
function matsOf(id) {
  const out = [];
  const st = M.structures.get(id);
  if (st) for (const p of st.parts) out.push(...p.mats);
  const xk = M.kind + ':' + id;
  if (xrayCache.has(xk)) out.push(xrayCache.get(xk));
  return out;
}
function setIdEmissive(id, spec) {
  for (const m of matsOf(id)) {
    if (!m.emissive) continue;
    if (spec) { m.emissive.setHex(spec.hex); m.emissiveIntensity = spec.intensity; }
    else { m.emissive.setHex(m.userData.baseEmissive ?? 0); m.emissiveIntensity = m.userData.baseEmissiveIntensity ?? 1; }
  }
}
function refreshHighlights() {
  const next = new Set();
  const apply = (id, spec) => { if (id) { setIdEmissive(id, spec); next.add(id); } };
  for (const id of highlighted) if (!flashState.has(id) && id !== state.selected && id !== state.hovered) setIdEmissive(id, null);
  apply(state.hovered, { hex: 0x21506b, intensity: 1 });
  apply(state.selected, { hex: 0x0f6d8a, intensity: .9 });
  for (const [id, f] of flashState) apply(id, f);
  highlighted = next;
}
function flash(id, hex, ms = 750, intensity = 1.3) {
  flashState.set(id, { hex, intensity, expires: performance.now() + ms });
  refreshHighlights();
}

/* ================= KAMERA ================= */
let camAnim = null;
function animateCam(toPos, toTarget, dur = 1.15) {
  camAnim = { t: 0, dur, fromPos: camera.position.clone(), toPos: toPos.clone(), fromTgt: controls.target.clone(), toTgt: toTarget.clone() };
  controls.autoRotate = false;
}
controls.addEventListener('start', () => { camAnim = null; if (state.spin) controls.autoRotate = true; });
const HOME_POS = V3(4.6, 6.1, 12.6), HOME_TGT = V3(0, 5.0, 0);
function structBox(id) {
  const box = new THREE.Box3();
  for (const p of M.structures.get(id).parts) box.union(new THREE.Box3().setFromObject(p.group));
  return box;
}
function focusStructure(id) {
  const box = structBox(id);
  const center = box.getCenter(new THREE.Vector3());
  const sphere = box.getBoundingSphere(new THREE.Sphere());
  const dir = camera.position.clone().sub(controls.target).normalize();
  if (dir.lengthSq() < .01) dir.set(.4, .25, 1).normalize();
  dir.lerp(V3(.35, .18, 1).normalize(), .35).normalize();
  const dist = clamp(sphere.radius * 3.4, 1.4, 10);
  animateCam(center.clone().addScaledVector(dir, dist), center, 1.1);
}
const REGIONS = {
  tum:   { p: HOME_POS, t: HOME_TGT },
  bas:   { p: V3(1.9, 9.7, 4.3), t: V3(0, 9.3, 0) },
  gogus: { p: V3(2.6, 7.6, 5.4), t: V3(0, 7.3, 0) },
  karin: { p: V3(2.7, 5.7, 5.1), t: V3(0, 5.3, 0) },
  kol:   { p: V3(4.6, 7.4, 4.0), t: V3(1.1, 7.0, 0) },
  bacak: { p: V3(3.3, 3.1, 5.2), t: V3(.3, 2.5, 0) },
};
$$('#regionChips button').forEach((b) => b.onclick = () => { const r = REGIONS[b.dataset.region]; animateCam(r.p, r.t, 1.25); });
const VIEWS = { on: V3(0, 5.6, 13.8), arka: V3(0, 5.6, -13.8), sol: V3(13.8, 5.6, 0), sag: V3(-13.8, 5.6, 0) };
$$('.bb-group.views button').forEach((b) => b.onclick = () => animateCam(VIEWS[b.dataset.view], HOME_TGT, 1.1));

/* ================= SEÇİM & BİLGİ KARTI ================= */
const els = {
  card: $('#infoCard'), def: $('#infoDefault'), name: $('#infoName'), latin: $('#infoLatin'),
  desc: $('#infoDesc'), funcs: $('#infoFuncs'), clinic: $('#infoClinic'), fact: $('#infoFact'),
  badge: $('#infoSystem'), side: $('#infoSide'), en: $('#infoEn'),
  funcsWrap: $('#funcsWrap'), clinicWrap: $('#clinicWrap'), factWrap: $('#factWrap'),
  defWrap: $('#defWrap'), defText: $('#infoDef'), wiki: $('#infoWiki'),
  btnIsolate: $('#btnIsolate'),
};
function effectiveSys(sys) {
  if (state.override) {
    let m = 0; for (const [id, v] of state.override) if (M.db[id] && M.db[id].system === sys) m = Math.max(m, v);
    return m;
  }
  return M.systems[sys];
}
function defaultSysOpacity(sys) {
  if (sys !== 'skin') return 1;
  return M.sysOrder.some((s) => s !== 'skin' && effectiveSys(s) > 0) ? .13 : 1;
}
function ensureVisible(id) {
  if (targetFor(id) >= .5) return;
  state.override = null; state.isolate = null;
  const sys = M.db[id].system;
  M.systems[sys] = sys === 'skin' ? .9 : 1;
  markLayerCustom(); updateSystemRows(); syncIsolateBtn();
}
function fillInfo(id) {
  const d = M.db[id];
  els.badge.textContent = systemName(d.system);
  els.badge.style.setProperty('--sys', SYSTEMS[d.system].color);
  if (M.kind === 'real' && state.lastSide) {
    els.side.textContent = state.lastSide === 'l' ? tr('Sol Taraf', 'Left side', 'الجانب الأيسر') : tr('Sağ Taraf', 'Right side', 'الجانب الأيمن');
    els.side.classList.remove('hidden');
  } else els.side.classList.add('hidden');
  els.name.textContent = nameOf(d);
  els.latin.textContent = d.latin || '';
  els.latin.style.display = d.latin ? '' : 'none';
  if (lang === 'tr' || (lang === 'ar' && nameOf(d) !== d.en)) {
    els.en.textContent = tr('İngilizce: ', 'English: ', 'الاسم الإنجليزي: ') + d.en;
    els.en.classList.remove('hidden');
  } else els.en.classList.add('hidden');
  els.desc.textContent = lang === 'tr' ? (d.desc || '') : (d.englishDef || tr('', 'No source description available.', 'لا يتوفر وصف في المصدر.'));
  els.desc.dir = lang !== 'tr' && d.englishDef ? 'ltr' : 'auto';
  const summary = $('#localizedSummary');
  const summaryText = lang === 'ar' && arabicNames[d.en] && d.infoId ? tourNote('ar', { info: d.infoId }) : '';
  summary.textContent = summaryText === 'استكشف التركيب المحدد.' ? '' : summaryText;
  summary.classList.toggle('hidden', !summary.textContent);
  const notice = $('#translationNotice');
  notice.textContent = lang === 'ar'
    ? 'تتوفر أسماء وملخصات عربية لبعض التراكيب فقط؛ تعرض الأسماء الأخرى والأوصاف الأصلية بالإنجليزية.'
    : lang === 'en' ? 'Source descriptions are shown in English when available.' : '';
  notice.classList.toggle('hidden', lang === 'tr');
  els.funcsWrap.style.display = lang === 'tr' && d.funcs && d.funcs.length ? '' : 'none';
  els.funcs.innerHTML = '';
  for (const f of d.funcs || []) { const li = document.createElement('li'); li.textContent = f; els.funcs.appendChild(li); }
  els.clinicWrap.style.display = lang === 'tr' && d.clinic ? '' : 'none';
  els.clinic.textContent = d.clinic || '';
  els.factWrap.style.display = lang === 'tr' && d.fact ? '' : 'none';
  els.fact.textContent = d.fact || '';
  if (lang === 'tr' && d.def) { els.defText.textContent = d.def; els.defWrap.classList.remove('hidden'); }
  else els.defWrap.classList.add('hidden');
  if (d.wiki) { els.wiki.href = d.wiki; els.wiki.classList.remove('hidden'); }
  else els.wiki.classList.add('hidden');
  els.card.classList.remove('hidden'); els.def.classList.add('hidden');
  els.card.style.animation = 'none'; void els.card.offsetWidth; els.card.style.animation = '';
}
function select(id, { focus = false, ensure = false, side = null } = {}) {
  // Arama/turla fasyanın kendisi seçilirse kullanıcıdan gizli kalmasın.
  if (id && M.kind === 'real' && !state.showFascia && M.structures.get(id)?.parts.every((p) => p.isFascia)) setFasciaVisibility(true);
  state.selected = id;
  state.lastSide = side;
  if (id) {
    if (ensure) ensureVisible(id);
    fillInfo(id);
    if (focus) focusStructure(id);
    if (innerWidth <= 880) { $('#rightPanel').classList.add('open'); $('#leftPanel').classList.remove('open'); }
  } else {
    els.card.classList.add('hidden'); els.def.classList.remove('hidden');
  }
  $$('.struct-item').forEach((b) => b.classList.toggle('active', b.dataset.id === id));
  syncIsolateBtn();
  syncStarUI();
  refreshHighlights();
  if (state.xray) refreshXray();
}
function syncIsolateBtn() {
  const on = state.isolate && state.isolate === state.selected;
  els.btnIsolate.classList.toggle('on', !!on);
  els.btnIsolate.textContent = on ? tr('◐ İzolasyonu Bırak', '◐ End isolation', '◐ إنهاء العزل') : tr('◐ İzole Et', '◐ Isolate', '◐ عزل');
}
$('#infoClose').onclick = () => select(null);
$('#btnFocus').onclick = () => state.selected && focusStructure(state.selected);
els.btnIsolate.onclick = () => {
  if (!state.selected) return;
  state.isolate = state.isolate === state.selected ? null : state.selected;
  syncIsolateBtn();
};
/* bilgiId -> gerçek modelde temsilci yapı anahtarı */
const PREFERRED = { brain: 'Corpus callosum', heart: 'Left ventricle', lungs: 'Superior lobe of right lung', liver: 'Liver' };
function findEntryByInfo(infoId) {
  if (PREFERRED[infoId] && M.structures.has(PREFERRED[infoId])) return PREFERRED[infoId];
  let best = null;
  for (const id of M.ids) if (M.db[id].infoId === infoId && (!best || id.length < best.length)) best = id;
  return best;
}

/* ================= SİSTEM LİSTESİ & KATMANLAR ================= */
const EYE = '<svg class="ic" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
const EYE_OFF = '<svg class="ic" viewBox="0 0 24 24"><path d="M17.94 17.94A10.6 10.6 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 4.06-4.94M9.9 4.24A9.5 9.5 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M14.12 14.12A3 3 0 1 1 9.88 9.88" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M2 2l20 20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
let sysRows = new Map();
function buildSystemRows() {
  sysRows = new Map();
  const list = $('#systemList');
  list.innerHTML = '';
  for (const sys of M.sysOrder) {
    const count = M.ids.filter((id) => M.db[id].system === sys).length;
    const row = document.createElement('div');
    row.className = 'sys-row'; row.dataset.sys = sys;
    row.innerHTML = `
      <span class="sys-dot" style="background:${SYSTEMS[sys].color};color:${SYSTEMS[sys].color}"></span>
      <button class="sys-name" style="text-align:left">${systemName(sys)}</button>
      <span class="sys-count">${count} ${tr('yapı', 'structures', 'تركيب')}</span>
      <button class="sys-solo" title="${tr('Yalnızca bu sistemi göster', 'Show only this system', 'عرض هذا الجهاز فقط')}">${tr('SOLO', 'SOLO', 'فقط')}</button>
      <button class="sys-eye" title="${tr('Göster / gizle', 'Show / hide', 'إظهار / إخفاء')}">${EYE}</button>`;
    const toggle = () => toggleSystem(sys);
    row.querySelector('.sys-name').onclick = toggle;
    row.querySelector('.sys-eye').onclick = toggle;
    row.querySelector('.sys-solo').onclick = (e) => { e.stopPropagation(); soloSystem(sys); };
    list.appendChild(row);
    sysRows.set(sys, row);
  }
  updateSystemRows();
}
function updateSystemRows() {
  for (const sys of M.sysOrder) {
    const row = sysRows.get(sys);
    if (!row) continue;
    const on = effectiveSys(sys) > 0;
    row.classList.toggle('off', !on);
    row.querySelector('.sys-eye').innerHTML = on ? EYE : EYE_OFF;
  }
}
function markLayerCustom() {
  $$('#layerSeg button').forEach((b) => b.classList.remove('active'));
  $('#layerName').textContent = tr('Özel Karışım', 'Custom', 'مخصص');
}
function postVisibilityChange() { updateSystemRows(); syncIsolateBtn(); }
function toggleSystem(sys) {
  state.override = null; state.isolate = null;
  M.systems[sys] = M.systems[sys] > 0 ? 0 : defaultSysOpacity(sys);
  if (sys === 'skin' && M.systems.skin > 0 && M.sysOrder.every((s) => s === 'skin' || M.systems[s] === 0)) M.systems.skin = 1;
  markLayerCustom(); postVisibilityChange();
}
function soloSystem(sys) {
  state.override = null; state.isolate = null;
  for (const s of M.sysOrder) M.systems[s] = s === sys ? 1 : 0;
  markLayerCustom(); postVisibilityChange();
}
function setSystems(partial) {
  state.override = null; state.isolate = null;
  for (const s of M.sysOrder) M.systems[s] = partial[s] ?? 0;
  markLayerCustom(); postVisibilityChange();
}
function buildLayerSeg() {
  const seg = $('#layerSeg');
  seg.innerHTML = '';
  for (const [key2, L] of Object.entries(M.layers)) {
    const b = document.createElement('button');
    b.dataset.layer = key2; b.textContent = layerName(key2);
    b.onclick = () => applyLayer(key2);
    seg.appendChild(b);
  }
}
function applyLayer(name) {
  const L = M.layers[name]; if (!L) return;
  state.override = null; state.isolate = null;
  for (const s of M.sysOrder) M.systems[s] = L.v[s] ?? 0;
  $$('#layerSeg button').forEach((b) => b.classList.toggle('active', b.dataset.layer === name));
  $('#layerName').textContent = layerName(name);
  postVisibilityChange();
}

/* ================= HAZIR GÖRÜNÜMLER ================= */
function overrideWhereReal(re, boneGhost = .2) {
  const map = new Map();
  for (const id of M.ids) {
    if (re.test(M.db[id].en)) map.set(id, 1);
    else if (M.db[id].system === 'bone' || M.db[id].system === 'joint') map.set(id, boneGhost);
    else map.set(id, 0);
  }
  return map;
}
function afterPreset(selectKey, region) {
  state.isolate = null; markLayerCustom(); postVisibilityChange();
  if (selectKey) select(selectKey);
  if (region) animateCam(region.p, region.t, 1.25);
}
const PRESETS = {
  dolanim() { setSystems({ vessel: 1, bone: .15, organ: .18 }); afterPreset(findEntryByInfo('heart'), REGIONS.gogus); },
  solunum() { state.override = overrideWhereReal(/lung|trachea|bronch|laryng|diaphragm/i, .25); afterPreset(findEntryByInfo('lungs'), REGIONS.gogus); },
  sindirim() { state.override = overrideWhereReal(/liver|gallbladder|stomach|colon|duoden|jejun|ileum|oesophag|esophag|pancrea|appendix|caecum|cecum|rectum|bile duct/i, .2); afterPreset(findEntryByInfo('liver'), REGIONS.karin); },
  sinir() { setSystems({ nerve: 1, bone: .14 }); afterPreset(findEntryByInfo('brain'), { p: V3(5.6, 7.2, 10.5), t: V3(0, 6.2, 0) }); },
  iskelet() { applyLayer('iskelet'); animateCam(HOME_POS, HOME_TGT, 1.2); },
  kas() { applyLayer('kas'); animateCam(HOME_POS, HOME_TGT, 1.2); },
};
$$('#presetList button').forEach((b) => b.onclick = () => PRESETS[b.dataset.preset]());

/* ================= ÇALIŞMA LİSTESİ ================= */
function isStarred(id) { return stars[M.kind].includes(id); }
function syncStarUI() {
  const on = state.selected && isStarred(state.selected);
  $('#btnStar').classList.toggle('on', !!on);
  $('#btnStar').textContent = on ? tr('★ Yıldızlı', '★ Favourited', '★ في المفضلة') : tr('☆ Yıldızla', '☆ Favourite', '☆ أضف للمفضلة');
  $('#btnStar').setAttribute('aria-pressed', String(!!on));
  $('#starFilter').classList.toggle('on', starsOnly);
  $('#starFilter').setAttribute('aria-pressed', String(starsOnly));
  const count = M.ids.filter(isStarred).length;
  $('#starCount').textContent = count;
  $('#quizStarCount').textContent = `(${count})`;
}
$('#btnStar').onclick = () => {
  const id = state.selected;
  if (!id) return;
  stars[M.kind] = isStarred(id) ? stars[M.kind].filter((x) => x !== id) : [...stars[M.kind], id];
  try { localStorage.setItem(STAR_KEY, JSON.stringify(stars)); }
  catch { toast(tr('Yıldızlar bu oturum için kaydedildi; tarayıcı depolamasına yazılamadı.', 'Favourites could not be saved to browser storage.', 'تعذر حفظ المفضلة في المتصفح.'), 'bad'); }
  buildStructList();
};
$('#starFilter').onclick = () => { starsOnly = !starsOnly; syncStarUI(); filterStructList(); };

/* ================= YAPI LİSTESİ ================= */
function fold(s) {
  return s.toLocaleLowerCase('tr-TR')
    .replaceAll('ç', 'c').replaceAll('ğ', 'g').replaceAll('ı', 'i').replaceAll('İ', 'i')
    .replaceAll('ö', 'o').replaceAll('ş', 's').replaceAll('ü', 'u');
}
function buildStructList() {
  const list = $('#structList');
  list.innerHTML = '';
  const note = $('#structNote');
  let listedIds = M.ids;
  if (M.kind === 'real') {
    listedIds = lang === 'tr' ? M.ids.filter((id) => M.db[id].tr || isStarred(id)) : M.ids;
    note.textContent = tr(
      `Atlas içinde toplam ${M.meta.entryCount} benzersiz yapı (${M.meta.meshCount} mesh) var. Burada Türkçe adı/içeriği olan ${listedIds.length} yapı listelenir; geri kalanına üstteki aramayla ulaşabilirsiniz.`,
      `${M.meta.entryCount} structures in ${M.meta.meshCount} meshes. Search by English, Turkish or Latin name.`,
      `${M.meta.entryCount} تركيباً في ${M.meta.meshCount} شبكة. تتوفر أسماء عربية لبعض التراكيب؛ الأسماء الأخرى بالإنجليزية. ابحث بالعربية أو الإنجليزية أو اللاتينية.`);
    note.classList.remove('hidden');
  } else note.classList.add('hidden');
  for (const sys of M.sysOrder) {
    const ids = listedIds.filter((id) => M.db[id].system === sys)
      .sort((a, b) => nameOf(M.db[a]).localeCompare(nameOf(M.db[b]), lang));
    if (!ids.length) continue;
    const head = document.createElement('div');
    head.className = 'struct-group'; head.dataset.sys = sys; head.textContent = systemName(sys);
    list.appendChild(head);
    for (const id of ids) {
      const d = M.db[id];
      const btn = document.createElement('button');
      btn.className = 'struct-item'; btn.classList.toggle('active', id === state.selected); btn.dataset.id = id; btn.dataset.sys = sys;
      btn.innerHTML = `<span class="dot" style="background:${SYSTEMS[sys].color}"></span><span dir="auto">${nameOf(d)}</span>${lang === 'tr' && d.infoId ? '<span class="tr-badge">TR+</span>' : ''}${isStarred(id) ? '<span class="star-mark">★</span>' : ''}<span class="lat">${d.latin || ''}</span>`;
      btn.onclick = () => select(id, { ensure: true, focus: true });
      list.appendChild(btn);
    }
  }
  syncStarUI();
  filterStructList();
}
function filterStructList() {
  const q = fold($('#structFilter').value);
  let count = 0;
  const visBySys = {};
  $$('.struct-item').forEach((b) => {
    const d = M.db[b.dataset.id];
    const show = (!starsOnly || isStarred(b.dataset.id)) && (!q || fold(nameOf(d) + ' ' + d.name + ' ' + (d.latin || '') + ' ' + (d.en || '')).includes(q));
    if (show) count++;
    b.style.display = show ? '' : 'none';
    if (show) visBySys[b.dataset.sys] = true;
  });
  $$('.struct-group').forEach((h) => h.style.display = visBySys[h.dataset.sys] ? '' : 'none');
  $('#structCount').textContent = count;
}
$('#structFilter').addEventListener('input', filterStructList);
$$('.tab').forEach((t) => t.onclick = () => {
  $$('.tab').forEach((x) => x.classList.toggle('active', x === t));
  $('#tab-systems').classList.toggle('hidden', t.dataset.tab !== 'systems');
  $('#tab-structures').classList.toggle('hidden', t.dataset.tab !== 'structures');
});
function updateStats() {
  if (M.kind === 'real') {
    $('#stYapı').textContent = M.meta.meshCount;
    $('#stYapıLabel').textContent = tr(`mesh · ${M.meta.entryCount} yapı`, `meshes · ${M.meta.entryCount} structures`, `شبكة · ${M.meta.entryCount} تركيب`);
    $('#stUcuncu').textContent = M.ids.filter((id) => M.db[id].tr).length;
    $('#stUcuncuLabel').textContent = tr('Türkçe içerikli yapı', 'Turkish names', 'أسماء تركية');
  } else {
    $('#stYapı').textContent = M.ids.length;
    $('#stYapıLabel').textContent = 'tıklanabilir yapı';
    $('#stUcuncu').textContent = 206;
    $('#stUcuncuLabel').textContent = 'kemik temsil ediliyor';
  }
  $('#stSistem').textContent = M.sysOrder.length;
}

/* ================= ARAMA ================= */
const searchEl = $('#search'), resultsEl = $('#searchResults');
let searchHits = [];
function runSearch() {
  const q = fold(searchEl.value.trim());
  if (!q) { resultsEl.classList.add('hidden'); searchHits = []; return; }
  searchHits = [];
  for (const id of M.ids) {
    const d = M.db[id];
    const nameF = fold(nameOf(d)), enF = fold((d.en || '') + ' ' + d.name), latF = d.latin ? fold(d.latin) : '';
    let score = 9;
    if (nameF.startsWith(q) || enF.startsWith(q)) score = 0;
    else if (nameF.includes(q) || enF.includes(q)) score = 1;
    else if (latF.includes(q)) score = 2;
    if (score < 9) searchHits.push({ id, d, score, trRank: d.tr ? 0 : 1 });
  }
  searchHits.sort((a, b) => a.score - b.score || a.trRank - b.trRank || nameOf(a.d).localeCompare(nameOf(b.d), lang));
  searchHits = searchHits.slice(0, 9);
  resultsEl.innerHTML = searchHits.length
    ? searchHits.map(({ id, d }) => `<button data-id="${id}"><span class="dot" style="background:${SYSTEMS[d.system].color}"></span>${nameOf(d)}<span class="lat">${d.latin || ''}</span></button>`).join('')
    : `<div class="empty">${tr('Sonuç yok — başka bir ad deneyin.', 'No results — try another name.', 'لا توجد نتائج، جرّب اسماً آخر.')}</div>`;
  resultsEl.classList.remove('hidden');
  resultsEl.querySelectorAll('button').forEach((b) => b.onclick = () => {
    select(b.dataset.id, { ensure: true, focus: true });
    resultsEl.classList.add('hidden'); searchEl.value = ''; searchEl.blur();
  });
}
searchEl.addEventListener('input', runSearch);
searchEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && searchHits.length) resultsEl.querySelector('button')?.click();
  if (e.key === 'Escape') { resultsEl.classList.add('hidden'); searchEl.blur(); }
});
document.addEventListener('click', (e) => { if (!e.target.closest('.search-wrap')) resultsEl.classList.add('hidden'); });

/* ================= ALT BAR ================= */
function syncRange(el) { el.style.setProperty('--v', el.value + '%'); }
const rngExplode = $('#rngExplode'), rngClip = $('#rngClip'), rngClipSag = $('#rngClipSag'), rngClipCor = $('#rngClipCor');
function applyExplode(mdl = M) {
  for (const p of mdl.parts) {
    p.group.position.copy(p.home).addScaledVector(p.dir, state.explode * 1.7 * p.factor);
  }
}
rngExplode.addEventListener('input', () => { state.explode = rngExplode.value / 100; syncRange(rngExplode); applyExplode(); });
const clipControls = [[rngClip, clipPlane, -.2, 11.2], [rngClipSag, clipSag, -5, 10], [rngClipCor, clipCor, -5, 10]];
function updateClips() {
  for (const [input, plane, min, span] of clipControls) {
    syncRange(input);
    plane.constant = Number(input.value) === 100 ? 100 : min + Number(input.value) / 100 * span;
  }
}
for (const [input] of clipControls) input.addEventListener('input', () => {
  if (tourState.active) tourState.clipEdited = true;
  updateClips();
});
syncRange(rngExplode); updateClips();

function setFasciaVisibility(show) {
  state.showFascia = show;
  const button = $('#fasciaToggle');
  button.classList.toggle('on', show);
  button.setAttribute('aria-pressed', String(show));
  button.textContent = show ? tr('Fasya katmanı: Görünür', 'Fascia: visible', 'اللفافة: ظاهرة') : tr('Fasya katmanı: Gizli', 'Fascia: hidden', 'اللفافة: مخفية');
  if (M.kind === 'real') {
    for (const [id, st] of M.structures) if (st.parts.some((p) => p.isFascia)) applyEntryFade(id, M.fade.get(id) ?? 0);
  }
}
$('#fasciaToggle').onclick = () => setFasciaVisibility(!state.showFascia);

function applyEntryFade(id, cur) {
  const st = M.structures.get(id);
  if (!st) return;
  for (const p of st.parts) {
    const visible = cur > .02 && !(M.kind === 'real' && p.isFascia && !state.showFascia);
    if (p.group.visible !== visible) { p.group.visible = visible; M.pickCache.invalidate(); }
    if (!p.group.visible) continue;
    const mats = (state.xray && id !== state.selected) ? [xrayMatFor(M.kind, id)] : p.mats;
    for (const m of mats) {
      const op = cur * (m.userData.baseOpacity ?? 1);
      m.opacity = op;
      m.transparent = op < .985;
      m.depthWrite = op >= .985;
    }
  }
  M.applied.set(id, cur);
}
function refreshXray() {
  for (const p of M.parts) {
    for (const mesh of p.meshes) {
      mesh.material = (state.xray && p.id !== state.selected) ? xrayMatFor(M.kind, p.id) : mesh.userData.origMat;
    }
  }
  for (const id of M.ids) applyEntryFade(id, M.fade.get(id) ?? 0);
}
$('#tgXray').onclick = (e) => {
  state.xray = !state.xray;
  e.currentTarget.classList.toggle('active', state.xray);
  refreshXray(); refreshHighlights();
  toast(state.xray ? tr('🩻 X-Işını modu açık', '🩻 X-ray mode on', '🩻 وضع الأشعة مفعل') : tr('X-Işını modu kapalı', 'X-ray mode off', 'وضع الأشعة متوقف'));
};
function syncPan() {
  configurePanControls(controls, state.pan);
  const b = $('#tgPan'); b.classList.toggle('active', state.pan); b.setAttribute('aria-pressed', String(state.pan));
  b.textContent = tr('✥ Kaydır', '✥ Pan', '✥ تحريك');
  b.title = tr('Kaydırma modunu aç/kapat', 'Toggle pan mode', 'تفعيل أو إيقاف التحريك');
}
$('#tgPan').onclick = () => { state.pan = !state.pan; syncPan(); };
$('#tgSpin').onclick = (e) => {
  state.spin = !state.spin; controls.autoRotate = state.spin;
  e.currentTarget.classList.toggle('active', state.spin);
};
const labelsWrap = $('#labels'), leadersSvg = $('#leaders');
$('#tgLabels').onclick = (e) => {
  state.labels = !state.labels;
  e.currentTarget.classList.toggle('active', state.labels);
  labelsWrap.style.display = state.labels ? '' : 'none';
  leadersSvg.style.display = state.labels ? '' : 'none';
};
labelsWrap.style.display = 'none'; leadersSvg.style.display = 'none';
$('#btnReset').onclick = () => resetAll();
function resetAll() {
  select(null);
  state.isolate = null; state.override = null;
  if (state.xray) $('#tgXray').click();
  rngExplode.value = 0; state.explode = 0; syncRange(rngExplode); applyExplode();
  for (const [input] of clipControls) input.value = 100;
  updateClips();
  setFasciaVisibility(false);
  state.pan = false; syncPan();
  applyLayer(M.defaultLayer);
  animateCam(HOME_POS, HOME_TGT, 1.2);
}
$('#btnShot').onclick = () => {
  renderer.setClearColor(0x070d18, 1); renderer.render(scene, camera);
  renderer.domElement.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'tugrul-atlas-anatomi.png'; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
    toast(tr('📸 Görüntü kaydedildi.', '📸 Screenshot saved.', '📸 تم حفظ لقطة الشاشة.'), 'ok');
  });
  renderer.setClearColor(0x000000, 0);
};
$('#btnFull').onclick = () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen?.();
};
$('#btnCredits').onclick = () => $('#creditsModal').classList.remove('hidden');

let toastTimer;
function toast(msg, kind = '') {
  const t = $('#toast');
  t.textContent = msg; t.className = kind;
  t.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), 3600);
}
function randomFact() {
  if (lang !== 'tr') {
    const facts = [
      ['The heart has four chambers.', 'يتكون القلب من أربع حجرات.'],
      ['The diaphragm is a major muscle of breathing.', 'الحجاب الحاجز عضلة رئيسية في التنفس.'],
      ['The femur is the longest bone in the human body.', 'عظم الفخذ أطول عظم في جسم الإنسان.'],
      ['The kidneys filter blood and produce urine.', 'ترشح الكليتان الدم وتنتجان البول.'],
    ];
    const fact = facts[Math.floor(Math.random() * facts.length)];
    $('#factText').textContent = fact[lang === 'ar' ? 1 : 0];
    $('#factSrc').textContent = ''; $('#factSrc').onclick = null; return;
  }
  const ids = Object.keys(INFO);
  const id = ids[Math.floor(Math.random() * ids.length)];
  $('#factText').textContent = INFO[id].fact;
  const src = $('#factSrc');
  src.textContent = `— ${INFO[id].name} (${INFO[id].latin}) · karta git →`;
  src.style.cursor = 'pointer';
  src.onclick = () => { const target = findEntryByInfo(id); if (target) select(target, { ensure: true, focus: true }); };
}
$('#btnFact').onclick = randomFact;
randomFact();

/* ================= TIKLAMA ================= */
const raycaster = new THREE.Raycaster();
const pointerNDC = new THREE.Vector2();
let pointerClient = { x: 0, y: 0 }, needPick = false, downInfo = null;
const tooltip = $('#tooltip');
function castAt(clientX, clientY) {
  pointerNDC.set((clientX / innerWidth) * 2 - 1, -(clientY / innerHeight) * 2 + 1);
  raycaster.setFromCamera(pointerNDC, camera);
  const hits = raycaster.intersectObjects(M.pickCache.get(), false);
  for (const h of hits) {
    let o = h.object, shown = true;
    while (o) { if (!o.visible) { shown = false; break; } o = o.parent; }
    if (!shown || clipPlanes.some((plane) => plane.distanceToPoint(h.point) < 0)) continue;
    const id = h.object.userData.sid;
    if ((M.fade.get(id) ?? 0) > .15) return { id, side: h.object.userData.side || null };
  }
  return null;
}
renderer.domElement.addEventListener('pointermove', (e) => { pointerClient = { x: e.clientX, y: e.clientY }; needPick = true; });
renderer.domElement.addEventListener('pointerdown', (e) => {
  downInfo = e.isPrimary && e.button === 0 && !state.pan ? { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId } : null;
  if (state.spin) { state.spin = false; controls.autoRotate = false; $('#tgSpin').classList.remove('active'); }
});
renderer.domElement.addEventListener('pointerup', (e) => {
  if (!downInfo || !e.isPrimary || e.pointerId !== downInfo.id || e.button !== 0 || state.pan) { downInfo = null; return; }
  const moved = Math.hypot(e.clientX - downInfo.x, e.clientY - downInfo.y);
  const dt = performance.now() - downInfo.t;
  downInfo = null;
  if (moved > 6 || dt > 450) return;
  const hit = castAt(e.clientX, e.clientY);
  if (quiz.active) { quizClick(hit ? hit.id : null); return; }
  if (hit) select(hit.id, { side: hit.side }); else select(null);
});
renderer.domElement.addEventListener('dblclick', (e) => {
  const hit = castAt(e.clientX, e.clientY);
  if (hit && !quiz.active) { select(hit.id, { side: hit.side }); focusStructure(hit.id); }
});
document.addEventListener('keydown', (e) => {
  const tag = document.activeElement?.tagName;
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
  if (e.key === '/') { e.preventDefault(); searchEl.focus(); }
  else if (e.key === 'Escape') { select(null); hideModals(); }
  else if (e.key.toLowerCase() === 'r') animateCam(HOME_POS, HOME_TGT, 1.1);
  else if (/^[1-7]$/.test(e.key)) { const sys = M.sysOrder[Number(e.key) - 1]; if (sys) toggleSystem(sys); }
});
$('#mbLeft').onclick = () => { $('#leftPanel').classList.toggle('open'); $('#rightPanel').classList.remove('open'); };
$('#mbRight').onclick = () => { $('#rightPanel').classList.toggle('open'); $('#leftPanel').classList.remove('open'); };

/* ================= ETİKETLER ================= */
const LABEL_INFO_IDS = ['brain', 'cerebellum', 'cranium', 'mandible', 'eye', 'trachea', 'lungs', 'heart', 'aorta',
  'diaphragm', 'liver', 'stomach', 'kidneys', 'small_intestine', 'bladder', 'ribs', 'sternum', 'clavicle',
  'humerus', 'radius', 'pelvis', 'femur', 'patella', 'tibia', 'pectoralis', 'deltoid', 'biceps', 'trapezius',
  'latissimus', 'rectus_abdominis', 'gluteus', 'quadriceps', 'gastrocnemius', 'spinal_cord', 'sciatic', 'skin'];
let labelSpecs = [];
function buildLabels() {
  labelsWrap.innerHTML = '';
  leadersSvg.innerHTML = '';
  labelSpecs = [];
  const SVGNS = 'http://www.w3.org/2000/svg';
  const specs = [];
  for (const infoId of LABEL_INFO_IDS) {
    const key2 = findEntryByInfo(infoId);
    if (!key2) continue;
    const first = M.structures.get(key2).parts[0];
    const mesh0 = first.meshes[0];
    const center = new THREE.Box3().setFromObject(mesh0).getCenter(new THREE.Vector3());
    const w0 = mesh0.getWorldPosition(new THREE.Vector3());
    const delta = center.sub(w0);
    specs.push({ id: key2, getWorld: (out) => { mesh0.getWorldPosition(out); out.add(delta); } });
  }
  for (const sp of specs) {
    const d = M.db[sp.id];
    const div = document.createElement('div');
    div.className = 'label3d';
    div.innerHTML = `${nameOf(d)}<small>${d.latin || ''}</small>`;
    div.style.display = 'none';
    labelsWrap.appendChild(div);
    const line = document.createElementNS(SVGNS, 'polyline');
    line.setAttribute('fill', 'none'); line.setAttribute('stroke', 'rgba(103,232,249,.55)');
    line.setAttribute('stroke-width', '1.2'); line.style.display = 'none';
    leadersSvg.appendChild(line);
    const dot = document.createElementNS(SVGNS, 'circle');
    dot.setAttribute('r', '3'); dot.setAttribute('fill', '#67e8f9'); dot.style.display = 'none';
    leadersSvg.appendChild(dot);
    labelSpecs.push({ ...sp, div, line, dot });
  }
}
const _pv = new THREE.Vector3(), _rad = new THREE.Vector3(), _tc = new THREE.Vector3();
function updateLabels() {
  if (!state.labels) return;
  let i = 0;
  for (const L of labelSpecs) {
    i++;
    const hide = () => { L.div.style.display = 'none'; L.line.style.display = 'none'; L.dot.style.display = 'none'; };
    if ((M.fade.get(L.id) ?? 0) < .55) { hide(); continue; }
    L.getWorld(_pv);
    if (clipPlanes.some((plane) => plane.distanceToPoint(_pv) < 0)) { hide(); continue; }
    _rad.set(_pv.x, 0, _pv.z);
    if (_rad.length() > .28) {
      _tc.copy(camera.position).sub(_pv);
      if (_rad.normalize().dot(_tc.normalize()) < -.18) { hide(); continue; }
    }
    _pv.project(camera);
    if (_pv.z > 1 || _pv.z < -1) { hide(); continue; }
    const x = (_pv.x * .5 + .5) * innerWidth, y = (-_pv.y * .5 + .5) * innerHeight;
    const side = x < innerWidth / 2 ? -1 : 1;
    const lx = clamp(x + side * (95 + (i % 4) * 26), 70, innerWidth - 70);
    const ly = clamp(y - 6 + ((i % 5) - 2) * 7, 84, innerHeight - 90);
    L.div.style.display = ''; L.div.style.left = lx + 'px'; L.div.style.top = ly + 'px';
    L.line.style.display = ''; L.dot.style.display = '';
    L.line.setAttribute('points', `${x},${y} ${x + side * 34},${y} ${lx},${ly}`);
    L.dot.setAttribute('cx', x); L.dot.setAttribute('cy', y);
  }
}

/* ================= DERS TURLARI ================= */
function buildTourList() {
  const list = $('#tourList');
  if (!list) return;
  list.innerHTML = '';
  for (const t of TOURS) {
    const b = document.createElement('button');
    b.className = 'tour-item';
    b.innerHTML = `<span class="ti">${t.icon}</span><span class="tt"><b>${tourTitle(lang, t)}</b><small>${tourDesc(lang, t)}</small></span><span class="tc">${t.steps.length} ${tr('adım', 'steps', 'خطوات')}</span>`;
    b.onclick = () => startTour(t.id);
    list.appendChild(b);
  }
}
function tourStepId(step) {
  if (M.kind === 'real' && step.real && M.structures.has(step.real)) return step.real;
  return findEntryByInfo(step.info);
}
function startTour(id) {
  const t = TOURS.find((x) => x.id === id);
  if (!t) return;
  if (quiz.active) endQuiz();
  if (tourState.active) exitTour();
  tourState.active = t;
  tourState.idx = 0;
  // Kesit düzlemleri hedef yapıyı kesiyorsa ders boş görünür. Tur boyunca
  // kesitleri aç; kullanıcı değiştirmediyse çıkışta eski değerleri geri koy.
  tourState.savedClips = clipControls.map(([input]) => input.value);
  tourState.clipEdited = false;
  for (const [input] of clipControls) input.value = 100;
  updateClips();
  $('#tourPanel').classList.remove('hidden');
  applyTourStep();
  toast(tr(`🎓 "${t.title}" turu başladı — ←/→ tuşlarıyla da gezinebilirsin.`, `🎓 ${tourTitle(lang, t)} started.`, `🎓 بدأت جولة ${tourTitle(lang, t)}.`));
}
function applyTourStep() {
  const t = tourState.active;
  if (!t) return;
  const step = t.steps[tourState.idx];
  const id = tourStepId(step);
  if (tourState.isolatedId && state.isolate === tourState.isolatedId) state.isolate = null;
  tourState.isolatedId = null;
  if (id) {
    select(id, { focus: true, ensure: true });
    state.isolate = id; tourState.isolatedId = id; syncIsolateBtn();
  } else select(null);
  $('#tourIcon').textContent = t.icon;
  renderTourText();
  $('#tourDots').innerHTML = t.steps.map((_, i) => `<i class="${i === tourState.idx ? 'on' : ''}"></i>`).join('');
  $('#tourPrev').disabled = tourState.idx === 0;
  $('#tourNext').textContent = tourState.idx === t.steps.length - 1 ? tr('Bitir ✓', 'Finish ✓', 'إنهاء ✓') : tr('Sonraki →', 'Next →', '← التالي');
}
function renderTourText() {
  const t = tourState.active; if (!t) return;
  const step = t.steps[tourState.idx], id = tourStepId(step);
  $('#tourTitle').textContent = tourTitle(lang, t);
  $('#tourCounter').textContent = tr(`Adım ${tourState.idx + 1}/${t.steps.length}`, `Step ${tourState.idx + 1}/${t.steps.length}`, `الخطوة ${tourState.idx + 1}/${t.steps.length}`);
  $('#tourStepTitle').textContent = lang === 'tr' ? step.title : (id ? nameOf(M.db[id]) : step.real || step.info);
  $('#tourText').textContent = lang === 'tr' ? step.text : tourNote(lang, step);
  if (!id) $('#tourText').textContent += tr(' (Bu yapı atlas verisinde bulunamadı.)', ' (Structure not found in the atlas.)', ' (التركيب غير موجود في الأطلس.)');
  $('#tourNext').textContent = tourState.idx === t.steps.length - 1 ? tr('Bitir ✓', 'Finish ✓', 'إنهاء ✓') : tr('Sonraki →', 'Next →', '← التالي');
}
function stepTour(dir) {
  const t = tourState.active;
  if (!t) return;
  const next = tourState.idx + dir;
  if (next < 0) return;
  if (next >= t.steps.length) {
    exitTour();
    toast(tr('🏁 Tur tamamlandı!', '🏁 Tour complete!', '🏁 اكتملت الجولة!'));
    return;
  }
  tourState.idx = next;
  applyTourStep();
}
function exitTour() {
  if (tourState.isolatedId && state.isolate === tourState.isolatedId) {
    state.isolate = null; syncIsolateBtn();
  }
  tourState.isolatedId = null;
  if (tourState.savedClips && !tourState.clipEdited) {
    clipControls.forEach(([input], i) => { input.value = tourState.savedClips[i]; });
    updateClips();
  }
  tourState.savedClips = null;
  tourState.active = null;
  $('#tourPanel').classList.add('hidden');
}
$('#tourNext').onclick = () => stepTour(1);
$('#tourPrev').onclick = () => stepTour(-1);
$('#tourExit').onclick = exitTour;
addEventListener('keydown', (e) => {
  if (!tourState.active) return;
  if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
  if (e.key === 'ArrowRight') { stepTour(1); e.stopPropagation(); }
  else if (e.key === 'ArrowLeft') { stepTour(-1); e.stopPropagation(); }
  else if (e.key === 'Escape') { exitTour(); e.stopPropagation(); }
}, true);
buildTourList();

const quiz = { active: false, qs: [], idx: 0, score: 0, correct: 0, streak: 0, best: 0, attempts: 3, timeLeft: 20, locked: false, timer: null, cat: '' };
const CAT_LABEL = { bone: 'İskelet', muscle: 'Kaslar', organ: 'İç Organlar & Damarlar', nerve: 'Sinir Sistemi', stars: 'Yıldızlılarım' };
function hideModals() { $('#quizSetup').classList.add('hidden'); $('#quizResult').classList.add('hidden'); $('#creditsModal').classList.add('hidden'); }
$$('[data-close]').forEach((b) => b.onclick = () => $('#' + b.dataset.close).classList.add('hidden'));
$('#btnQuiz').onclick = () => { if (!quiz.active) $('#quizSetup').classList.remove('hidden'); };
$$('.quiz-cats button').forEach((b) => b.onclick = () => startQuiz(b.dataset.cat));
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function entryCategory(id) {
  const d = M.db[id];
  if (d.system === 'joint') return 'bone';
  if (d.system === 'lymph') return 'organ';
  return d.system;
}
function startQuiz(cat) {
  hideModals();
  let pool = M.ids.filter((id) => {
    const c = entryCategory(id);
    if (cat === 'stars') return isStarred(id);
    if (lang === 'tr' && !M.db[id].tr) return false;
    if (lang === 'ar' && !arabicNames[M.db[id].en]) return false;
    return cat === 'organ' ? (c === 'organ' || c === 'vessel') : c === cat;
  });
  if (!pool.length) { toast(cat === 'stars' ? tr('Önce bir yapıyı yıldızla.', 'Favourite a structure first.', 'أضف تركيباً إلى المفضلة أولاً.') : tr('Bu kategoride soru bulunamadı.', 'No questions found in this category.', 'لا توجد أسئلة في هذه الفئة.'), 'bad'); $('#quizSetup').classList.remove('hidden'); return; }
  if (tourState.active) exitTour();
  for (const [input] of clipControls) input.value = 100;
  updateClips();
  if (state.xray) $('#tgXray').click();
  if (state.labels) $('#tgLabels').click();
  select(null);
  if (cat === 'stars') setSystems(Object.fromEntries(M.sysOrder.map((s) => [s, 1])));
  else {
    if (cat === 'bone') setSystems({ bone: 1, joint: 1 });
    else if (cat === 'muscle') setSystems({ muscle: 1 });
    else if (cat === 'organ') setSystems({ bone: .15, organ: 1, vessel: 1, lymph: 1 });
    else setSystems({ bone: .12, nerve: 1 });
  }
  Object.assign(quiz, {
    active: true, cat, qs: shuffle([...pool]).slice(0, Math.min(10, pool.length)),
    idx: 0, score: 0, correct: 0, streak: 0, best: 0,
  });
  $('#quizHud').classList.remove('hidden');
  animateCam(HOME_POS, HOME_TGT, 1.1);
  setQuestion();
  clearInterval(quiz.timer);
  quiz.timer = setInterval(() => {
    if (!quiz.active || quiz.locked) return;
    quiz.timeLeft -= .1;
    const bar = $('#quizTimerBar');
    bar.style.width = clamp(quiz.timeLeft / 20 * 100, 0, 100) + '%';
    bar.classList.toggle('low', quiz.timeLeft <= 5);
    if (quiz.timeLeft <= 0) revealAnswer(tr('⏰ Süre doldu!', '⏰ Time is up!', '⏰ انتهى الوقت!'));
  }, 100);
}
function setQuestion() {
  select(null);
  const id = quiz.qs[quiz.idx];
  if (M.kind === 'real' && !state.showFascia && M.structures.get(id)?.parts.every((p) => p.isFascia)) setFasciaVisibility(true);
  if (quiz.cat === 'stars') {
    // Hedef sistemi görünür kıl; iç yapıları örten diğer sistemleri kaldır.
    setSystems({ [M.db[id].system]: 1 });
  }
  quiz.attempts = 3; quiz.timeLeft = 20; quiz.locked = false;
  renderQuizText();
  const bar = $('#quizTimerBar'); bar.style.width = '100%'; bar.classList.remove('low');
  const m = $('#quizMsg'); m.textContent = ''; m.className = '';
}
function renderQuizText() {
  if (!quiz.active || !quiz.qs[quiz.idx]) return;
  const d = M.db[quiz.qs[quiz.idx]];
  $('#quizProgress').textContent = tr(`Soru ${quiz.idx + 1}/${quiz.qs.length}`, `Question ${quiz.idx + 1}/${quiz.qs.length}`, `السؤال ${quiz.idx + 1}/${quiz.qs.length}`);
  $('#quizTarget').innerHTML = `${nameOf(d)}<small>${d.latin || ''}</small>`;
  $('#quizScore').textContent = tr(`${quiz.score} puan`, `${quiz.score} points`, `${quiz.score} نقطة`);
  $('#quizStreak').textContent = quiz.streak >= 2 ? tr(`🔥 ${quiz.streak} seri`, `🔥 ${quiz.streak} streak`, `🔥 ${quiz.streak} متتالية`) : '';
}
const PRAISE = ['Mükemmel!', 'Hekim gözü!', 'Şak diye buldunuz!', 'Netter görse gurur duyardı!', 'Tıp birincisi hareketi!'];
function quizClick(id) {
  if (quiz.locked || !id) return;
  const target = quiz.qs[quiz.idx];
  const m = $('#quizMsg');
  if (id === target) {
    quiz.locked = true; quiz.correct++; quiz.streak++;
    quiz.best = Math.max(quiz.best, quiz.streak);
    const mult = 1 + Math.min(quiz.streak - 1, 4) * .25;
    const gain = Math.round((100 + quiz.timeLeft * 5) * mult);
    quiz.score += gain;
    flash(id, 0x1d9e63, 1300, 1.6);
    m.className = 'ok';
    m.textContent = tr(`✅ ${PRAISE[Math.floor(Math.random() * PRAISE.length)]} +${gain} puan`, `✅ Correct! +${gain} points`, `✅ إجابة صحيحة! +${gain} نقطة`);
    renderQuizText();
    setTimeout(nextQuestion, 1400);
  } else {
    quiz.attempts--; quiz.streak = 0;
    flash(id, 0xb01e34, 650, 1.5);
    if (quiz.attempts > 0) {
      m.className = 'bad';
      m.textContent = tr(`❌ O yapı: ${nameOf(M.db[id])}. ${quiz.attempts} hakkın kaldı.`, `❌ That is ${nameOf(M.db[id])}. ${quiz.attempts} attempts left.`, `❌ هذا ${nameOf(M.db[id])}. المحاولات المتبقية: ${quiz.attempts}.`);
    } else revealAnswer(tr('❌ Hakların doldu.', '❌ No attempts left.', '❌ انتهت المحاولات.'));
  }
}
function revealAnswer(prefix) {
  if (quiz.locked) return;
  quiz.locked = true; quiz.streak = 0;
  const target = quiz.qs[quiz.idx];
  flash(target, 0x0f6d8a, 2200, 1.5);
  select(target);
  const m = $('#quizMsg');
  m.className = 'bad';
  m.textContent = tr(`${prefix} Doğru yapı ışıldıyor: ${nameOf(M.db[target])}.`, `${prefix} Correct structure: ${nameOf(M.db[target])}.`, `${prefix} التركيب الصحيح: ${nameOf(M.db[target])}.`);
  setTimeout(nextQuestion, 2300);
}
function nextQuestion() {
  if (!quiz.active) return;
  quiz.idx++;
  if (quiz.idx >= quiz.qs.length) finishQuiz();
  else setQuestion();
}
function endQuiz() {
  quiz.active = false; clearInterval(quiz.timer);
  $('#quizHud').classList.add('hidden');
}
function finishQuiz() {
  endQuiz();
  const total = quiz.qs.length, ratio = quiz.correct / total;
  const [emoji, title] = ratio >= .9 ? ['🏆', tr('Anatomi Profesörü', 'Anatomy Professor', 'أستاذ التشريح')]
    : ratio >= .7 ? ['🩺', tr('Uzman Hekim Adayı', 'Future Specialist', 'طبيب متخصص مستقبلي')]
    : ratio >= .5 ? ['📚', tr('Çalışkan Tıp Öğrencisi', 'Diligent Student', 'طالب مجتهد')]
    : ratio >= .3 ? ['🔬', tr('Meraklı Araştırmacı', 'Curious Explorer', 'باحث فضولي')]
    : ['🌱', tr('Anatomi Yolculuğu Başlıyor', 'Anatomy Journey Begins', 'بداية رحلة التشريح')];
  $('#resultEmoji').textContent = emoji;
  $('#resultTitle').textContent = title;
  $('#resultScore').textContent = quiz.score;
  $('#resultDetail').textContent =
    tr(`${total} soruda ${quiz.correct} doğru · En uzun seri: ${quiz.best} · Kategori: ${CAT_LABEL[quiz.cat]}`, `${quiz.correct}/${total} correct · Best streak: ${quiz.best}`, `${quiz.correct}/${total} إجابات صحيحة · أطول سلسلة: ${quiz.best}`);
  $('#quizResult').classList.remove('hidden');
  quiz.finalTitle = title;
}
$('#quizExit').onclick = () => { endQuiz(); toast(tr('Sınavdan çıktınız — keşfe devam!', 'Quiz exited — keep exploring!', 'خرجت من الاختبار، تابع الاستكشاف!')); };
$('#quizSkip').onclick = () => { if (!quiz.locked) revealAnswer(tr('⏭ Pas geçtiniz.', '⏭ Skipped.', '⏭ تم التخطي.')); };
$('#btnAgain').onclick = () => { hideModals(); $('#quizSetup').classList.remove('hidden'); };
$('#btnChallenge').onclick = async () => {
  const text = tr(`🫀 TUĞRUL ATLAS: ${quiz.score} puan (${quiz.correct}/${quiz.qs.length} doğru)`, `🫀 TUĞRUL ATLAS: ${quiz.score} points (${quiz.correct}/${quiz.qs.length} correct)`, `🫀 أطلس طغرل: ${quiz.score} نقطة (${quiz.correct}/${quiz.qs.length} إجابات صحيحة)`);
  try { await navigator.clipboard.writeText(text); toast(tr('📋 Sonuç kopyalandı!', '📋 Result copied!', '📋 تم نسخ النتيجة!'), 'ok'); }
  catch { toast(text); }
};

/* ================= MODEL DEĞİŞTİRME ================= */
function updateCredit() {
  const c = $('#modelCredit');
  c.classList.remove('hidden');
  c.innerHTML = tr('Bir <b>Muhammet TUĞRUL</b> projesi<br>Kaynaklar ve lisanslar ⓘ', 'A project by <b>Muhammet TUĞRUL</b><br>Sources and licences ⓘ', 'مشروع <b>Muhammet TUĞRUL</b><br>المصادر والتراخيص ⓘ');
}
$('#modelCredit').onclick = () => $('#creditsModal').classList.remove('hidden');
function rebuildModelUI() {
  buildLayerSeg();
  buildSystemRows();
  buildStructList();
  buildLabels();
  updateStats();
  updateCredit();
}
/* ================= GÖRÜNÜM BAĞLANTISI ================= */
function snapshotView() {
  if (state.override && state.override.size > 200) {
    toast(tr('Bu görünüm çok fazla yapı içeriyor. Paylaşmak için bir katman seçin.', 'This view contains too many structures. Select a layer to share.', 'يحتوي هذا العرض على تراكيب كثيرة. اختر طبقة للمشاركة.'), 'bad');
    return null;
  }
  return { v: 1, mode: M.kind, theme: visualTheme, camera: camera.position.toArray(), target: controls.target.toArray(),
    systems: M.systems, selected: state.selected, side: state.lastSide, isolate: state.isolate,
    override: state.override ? [...state.override] : null, clips: clipControls.map(([el]) => +el.value),
    explode: +rngExplode.value, xray: state.xray, labels: state.labels, fascia: state.showFascia };
}
$('#btnShare').onclick = async () => {
  const view = snapshotView(); if (!view) return;
  const url = new URL(location.href); url.hash = 'v=' + encodeURIComponent(JSON.stringify(view));
  try { await navigator.clipboard.writeText(url.href); toast(tr('🔗 Görünüm bağlantısı kopyalandı.', '🔗 View link copied.', '🔗 تم نسخ رابط المنظور.'), 'ok'); }
  catch { window.prompt(tr('Bağlantıyı kopyala:', 'Copy link:', 'انسخ الرابط:'), url.href); }
};
function restoreView() {
  if (!location.hash.startsWith('#v=')) return false;
  try {
    const data = JSON.parse(decodeURIComponent(location.hash.slice(3)));
    const vec = (v) => Array.isArray(v) && v.length === 3 && v.every((x) => typeof x === 'number' && Number.isFinite(x) && Math.abs(x) <= 100);
    if (data.v !== 1 || !['real', 'proc'].includes(data.mode) || !vec(data.camera) || !vec(data.target)) throw Error('Geçersiz bağlantı');
    if (data.mode === 'proc') { toast(tr('Bu bağlantıdaki model artık kullanılmıyor.', 'The model in this link is no longer available.', 'النموذج في هذا الرابط لم يعد متاحاً.'), 'bad'); return false; }
    if (!RM) return false;
    setFasciaVisibility(!!data.fascia);
    if (VISUAL_THEMES[data.theme]) applyVisualTheme(data.theme);
    if (data.systems && typeof data.systems === 'object') {
      for (const sys of M.sysOrder) {
        const value = data.systems[sys];
        if (typeof value === 'number' && Number.isFinite(value)) M.systems[sys] = clamp(value, 0, 1);
      }
      markLayerCustom(); postVisibilityChange();
    }
    if (Array.isArray(data.override) && data.override.length <= 200) {
      state.override = new Map(data.override.filter((item) => Array.isArray(item) && M.structures.has(item[0]) && typeof item[1] === 'number' && Number.isFinite(item[1])).map(([id, val]) => [id, clamp(val, 0, 1)]));
    }
    if (M.structures.has(data.selected)) select(data.selected, { side: ['l', 'r'].includes(data.side) ? data.side : null });
    if (M.structures.has(data.isolate)) { state.isolate = data.isolate; syncIsolateBtn(); }
    if (Array.isArray(data.clips)) clipControls.forEach(([el], i) => { if (Number.isFinite(data.clips[i])) el.value = clamp(data.clips[i], 0, 100); });
    updateClips();
    if (Number.isFinite(data.explode)) { rngExplode.value = clamp(data.explode, 0, 100); state.explode = +rngExplode.value / 100; syncRange(rngExplode); applyExplode(); }
    if (!!data.xray !== state.xray) $('#tgXray').click();
    if (!!data.labels !== state.labels) $('#tgLabels').click();
    state.spin = false; controls.autoRotate = false; $('#tgSpin').classList.remove('active');
    camAnim = null; camera.position.fromArray(data.camera); controls.target.fromArray(data.target); controls.update();
    toast(tr('🔗 Paylaşılan görünüm açıldı.', '🔗 Shared view opened.', '🔗 تم فتح المنظور المشترك.'), 'ok');
    return true;
  } catch (err) { console.warn('Görünüm bağlantısı okunamadı:', err); toast(tr('Görünüm bağlantısı geçersiz.', 'Invalid view link.', 'رابط المنظور غير صالح.'), 'bad'); return false; }
}

/* ================= ANA DÖNGÜ ================= */
const clock = new THREE.Clock();
const easeInOut = (t) => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
rebuildModelUI();
applyLayer(M.defaultLayer);
applyExplode();

function tick() {
  requestAnimationFrame(tick);
  const dt = Math.min(clock.getDelta(), .05);
  const t = clock.elapsedTime;

  if (camAnim) {
    camAnim.t += dt / camAnim.dur;
    const k = easeInOut(clamp(camAnim.t, 0, 1));
    camera.position.lerpVectors(camAnim.fromPos, camAnim.toPos, k);
    controls.target.lerpVectors(camAnim.fromTgt, camAnim.toTgt, k);
    if (camAnim.t >= 1) { camAnim = null; if (state.spin) controls.autoRotate = true; }
  }
  controls.update();

  /* yumuşak görünürlük geçişleri */
  const blend = Math.min(1, dt * 5.2);
  for (const id of M.ids) {
    const tgt = targetFor(id);
    let cur = M.fade.get(id) ?? 0;
    if (Math.abs(tgt - cur) < .004) cur = tgt; else cur += (tgt - cur) * blend;
    M.fade.set(id, cur);
    const last = M.applied.get(id);
    if (last !== undefined && Math.abs(last - cur) < .003 && (cur === 0 || cur === tgt)) continue;
    applyEntryFade(id, cur);
  }
  /* seçim nabzı + flaş */
  let flashChanged = false;
  for (const [id, f] of flashState) if (performance.now() > f.expires) { flashState.delete(id); flashChanged = true; }
  if (flashChanged) refreshHighlights();
  if (state.selected && !flashState.has(state.selected)) {
    const inten = .75 + Math.sin(t * 4.2) * .35;
    for (const m of matsOf(state.selected)) { if (m.emissive) { m.emissive.setHex(0x0f6d8a); m.emissiveIntensity = inten; } }
  }

  /* hover */
  if (needPick) {
    needPick = false;
    const hit = castAt(pointerClient.x, pointerClient.y);
    const id = hit ? hit.id : null;
    if (id !== state.hovered) { state.hovered = id; refreshHighlights(); }
    if (id) {
      const d = M.db[id];
      tooltip.innerHTML = `${nameOf(d)}<small>${d.latin || (d.en || '')}${quiz.active ? '' : tr(' · tıklayın', ' · click', ' · انقر')}</small>`;
      tooltip.style.opacity = 1;
      tooltip.style.left = (pointerClient.x + 16) + 'px';
      tooltip.style.top = (pointerClient.y + 14) + 'px';
      renderer.domElement.style.cursor = 'pointer';
    } else {
      tooltip.style.opacity = 0;
      renderer.domElement.style.cursor = '';
    }
  }

  const dust = scene.getObjectByName('dust');
  if (dust) dust.rotation.y = t * .006;

  updateLabels();
  renderer.render(scene, camera);
}
tick();

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, QUALITY_CAP[graphicsQuality]));
  renderer.setSize(innerWidth, innerHeight);
});

/* ================= BAŞLATMA: gerçek atlası yükle ================= */
{
  const fillEl = $('#introFill'), msg = $('#introMsg');
  const t0 = performance.now();
  const finishIntro = () => {
    fillEl.style.width = '100%'; msg.textContent = tr('Hazır!', 'Ready!', 'جاهز!');
    const wait = Math.max(0, 950 - (performance.now() - t0));
    setTimeout(() => {
      $('#intro').classList.add('done');
      if (!restoreView()) animateCam(HOME_POS, HOME_TGT, 1.9);
      setTimeout(() => toast(tr(`👋 Hoş geldiniz! ${M.meta.entryCount} yapıyı keşfedin.`, `👋 Welcome! Explore ${M.meta.entryCount} structures.`, `👋 أهلاً بك! استكشف ${M.meta.entryCount} تركيباً.`)), 1300);
    }, wait);
  };
  loadRealBody({
    onProgress: (frac, label) => { fillEl.style.width = Math.round(frac * 100) + '%'; if (label) msg.textContent = lang === 'tr' ? label : tr('', 'Loading anatomy atlas…', 'جارٍ تحميل أطلس التشريح…'); },
  }).then((built) => {
    RM = wrapModel('real', built, {
      db: built.db, ids: built.ids, sysOrder: REAL_SYS_ORDER, layers: REAL_LAYERS, defaultLayer: 'kas',
    });
    M = RM;
    scene.add(RM.root);
    prepareModel(RM);
    applyVisualTheme(visualTheme);
    if (contactBlob) contactBlob.visible = true;
    rebuildModelUI();
    applyLayer(M.defaultLayer);
    applyExplode();
    console.log(`Gerçek atlas hazır: ${built.meta.meshCount} parça, ${built.meta.entryCount} yapı.`);
    finishIntro();
  }).catch((err) => {
    console.error('Gerçek atlas yüklenemedi:', err);
    msg.textContent = tr('Atlas yüklenemedi. İnternet bağlantınızı kontrol edip tekrar deneyin.', 'The atlas could not load. Check your connection and retry.', 'تعذر تحميل الأطلس. تحقق من الاتصال وحاول مجدداً.');
    $('#introRetry').classList.remove('hidden');
  });
}
$('#introRetry').onclick = () => location.reload();
function setLanguage(value) {
  if (!['tr', 'en', 'ar'].includes(value)) return;
  const activeLayer = $('#layerSeg button.active')?.dataset.layer;
  lang = value;
  try { localStorage.setItem('tugrul-language', lang); } catch {}
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.title = tr('TUĞRUL ATLAS — İnteraktif Anatomi Atlası', 'TUĞRUL ATLAS — Interactive Anatomy Atlas', 'أطلس طغرل — أطلس التشريح التفاعلي');
  $('#language').value = lang;
  translateStatic(lang);
  document.querySelector('.credit-block .lic').textContent = tr(originalLicenceNotice,
    '“BodyParts3D — The Database Center for Life Science — CC BY-SA 2.1 Japan” · “Z-Anatomy — the open source atlas of anatomy — CC BY-SA 4.0”. “Brainder” and “White matter” — University of Washington; “Cranial Nerves and Foramina” — University of Dundee, CAHID (CC BY 4.0); “Anatomy of the Inner Ear” — University of Dundee School of Medicine (CC BY-NC-SA 4.0); “Kidney” — lissiecowley (CC BY-NC 4.0). Inner ear and kidney components carry non-commercial restrictions. The source notice does not specify licences for Brainder and White matter; verify their rights separately. Definitions are mostly from Wikipedia (CC BY-SA 3.0 / GFDL). Check each component’s licence and compatibility; see ATTRIBUTION.md and the bundled licence files.',
    '“BodyParts3D — The Database Center for Life Science — CC BY-SA 2.1 Japan” · “Z-Anatomy — the open source atlas of anatomy — CC BY-SA 4.0”. “Brainder” و “White matter” — University of Washington؛ “Cranial Nerves and Foramina” — University of Dundee, CAHID (CC BY 4.0)؛ “Anatomy of the Inner Ear” — University of Dundee School of Medicine (CC BY-NC-SA 4.0)؛ “Kidney” — lissiecowley (CC BY-NC 4.0). تحمل مكونات الأذن الداخلية والكلية قيود الاستخدام غير التجاري. لم يحدد المصدر تراخيص Brainder و White matter؛ يجب التحقق من حقوقهما. معظم التعريفات من ويكيبيديا (CC BY-SA 3.0 / GFDL). راجع تراخيص المكونات وتوافقها في ATTRIBUTION.md وملفات التراخيص المرفقة.');
  $('#panHint').textContent = tr('Kaydır: sağ tuşla sürükle veya Kaydır modunu seç · dokunmatik: iki parmakla sürükle', 'Pan: drag with the right mouse button or select Pan · touch: drag with two fingers', 'للتحريك: اسحب بزر الفأرة الأيمن أو اختر تحريك · اللمس: اسحب بإصبعين');
  rebuildModelUI(); buildTourList();
  const languageNotice = $('#languageNotice');
  languageNotice.textContent = tr('', 'Tours show brief English summaries; source descriptions are in English.', 'الجولات تقدم ملخصات عربية. تتوفر أسماء عربية لبعض التراكيب فقط؛ بقية الأسماء والأوصاف بالإنجليزية.');
  languageNotice.classList.toggle('hidden', lang === 'tr');
  if (activeLayer) { const button = $(`#layerSeg button[data-layer="${activeLayer}"]`); if (button) button.classList.add('active'); $('#layerName').textContent = layerName(activeLayer); }
  else markLayerCustom();
  setFasciaVisibility(state.showFascia); syncPan(); syncIsolateBtn(); syncStarUI();
  if (state.selected) fillInfo(state.selected);
  if (tourState.active) renderTourText();
  renderQuizText(); randomFact();
  if (searchEl.value.trim()) runSearch();
}
$('#language').addEventListener('change', (e) => setLanguage(e.target.value));
setLanguage(lang);

// Çevrimdışı kurulum yalnızca üretim derlemesinde etkin.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  const firstInstall = !navigator.serviceWorker.controller;
  navigator.serviceWorker.register(import.meta.env.BASE_URL + 'sw.js').then(() => navigator.serviceWorker.ready).then(() => {
    if (firstInstall) toast(tr('📱 Atlas çevrimdışı kullanım için hazır.', '📱 Atlas ready for offline use.', '📱 الأطلس جاهز للاستخدام دون اتصال.'), 'ok');
  }).catch((err) => console.warn('Çevrimdışı kurulum başarısız:', err));
}
