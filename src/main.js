// CORPUS·3D — İnteraktif Anatomi Atlası (uygulama mantığı)
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { INFO, SYSTEMS } from './data.js';
import { buildBody } from './body.js';

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ================= SAHNE ================= */
const stage = $('#stage');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
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
controls.minDistance = 1.1; controls.maxDistance = 30;
controls.maxPolarAngle = 1.66;
controls.autoRotate = true; controls.autoRotateSpeed = .8;

/* ışıklar */
scene.add(new THREE.HemisphereLight(0xbfd9ff, 0x241408, .55));
const key = new THREE.DirectionalLight(0xffffff, 2.4);
key.position.set(6, 13, 7); key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -7; key.shadow.camera.right = 7;
key.shadow.camera.top = 13; key.shadow.camera.bottom = -3;
key.shadow.camera.far = 40; key.shadow.bias = -.0006; key.shadow.normalBias = .02;
scene.add(key);
const rim = new THREE.DirectionalLight(0x37c8ff, 1.5); rim.position.set(-8, 6, -9); scene.add(rim);
const fill = new THREE.DirectionalLight(0xffd9b0, .5); fill.position.set(-6, 3, 9); scene.add(fill);

/* sahne zemini: hologram masası */
{
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(2.9, 3.05, .12, 64),
    new THREE.MeshStandardMaterial({ color: 0x0c1626, roughness: .35, metalness: .65 }));
  disc.position.y = -.06; disc.receiveShadow = true; scene.add(disc);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.9, .018, 8, 90),
    new THREE.MeshBasicMaterial({ color: 0x22d3ee }));
  ring.rotation.x = Math.PI / 2; ring.position.y = .004; scene.add(ring);
  const polar = new THREE.PolarGridHelper(2.82, 12, 5, 48, 0x1e4a66, 0x16344d);
  polar.position.y = .008; polar.material.transparent = true; polar.material.opacity = .5; scene.add(polar);
  const shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(90, 90),
    new THREE.ShadowMaterial({ opacity: .32 }));
  shadowPlane.rotation.x = -Math.PI / 2; shadowPlane.position.y = -.13; shadowPlane.receiveShadow = true; scene.add(shadowPlane);
  // zemin ışıması
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(128, 128, 8, 128, 128, 128);
  grad.addColorStop(0, 'rgba(34,211,238,.30)'); grad.addColorStop(.55, 'rgba(34,211,238,.08)'); grad.addColorStop(1, 'rgba(34,211,238,0)');
  g.fillStyle = grad; g.fillRect(0, 0, 256, 256);
  const glow = new THREE.Mesh(new THREE.CircleGeometry(5.2, 48),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  glow.rotation.x = -Math.PI / 2; glow.position.y = -.12; scene.add(glow);
  // süzülen toz parçacıkları
  const n = 340, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const r = 4 + Math.random() * 15, a = Math.random() * Math.PI * 2;
    pos[i * 3] = Math.cos(a) * r; pos[i * 3 + 1] = Math.random() * 13 - .5; pos[i * 3 + 2] = Math.sin(a) * r;
  }
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(dg, new THREE.PointsMaterial({ color: 0x86c5ff, size: .04, transparent: true, opacity: .45, depthWrite: false }));
  dust.name = 'dust'; scene.add(dust);
}

/* ================= VÜCUT ================= */
const { body, parts, structures, pickMeshes, flows, animated } = buildBody();
scene.add(body);
const ALL_IDS = Object.keys(INFO).filter((id) => structures.has(id));
const SYS_ORDER = ['skin', 'muscle', 'bone', 'organ', 'vessel', 'nerve'];

/* kesit düzlemi: tüm malzemelere uygula */
const clipPlane = new THREE.Plane(V3(0, -1, 0), 11);
const RENDER_ORDER = { bone: 1, organ: 2, muscle: 2, vessel: 3, nerve: 3, skin: 6 };
const xrayCache = new Map();
for (const p of parts) {
  for (const m of p.mats) {
    m.clippingPlanes = [clipPlane];
    m.userData.baseEmissive = m.emissive.getHex();
    m.userData.baseEmissiveIntensity = m.emissiveIntensity;
  }
  for (const mesh of p.meshes) {
    mesh.userData.origMat = mesh.material;
    mesh.renderOrder = RENDER_ORDER[p.system] ?? 1;
  }
}
for (const f of flows) { f.mat.clippingPlanes = [clipPlane]; f.points.renderOrder = 8; }
function xrayMatFor(id) {
  if (!xrayCache.has(id)) {
    const m = new THREE.MeshPhysicalMaterial({
      color: 0x86d7ff, roughness: .25, metalness: .1, transparent: true,
      emissive: 0x0b3d5c, emissiveIntensity: .8, clippingPlanes: [clipPlane], depthWrite: false,
    });
    m.userData = { baseOpacity: .30, baseEmissive: 0x0b3d5c, baseEmissiveIntensity: .8 };
    xrayCache.set(id, m);
  }
  return xrayCache.get(id);
}

/* ================= DURUM ================= */
const state = {
  systems: { skin: .13, muscle: 1, bone: 0, organ: 0, vessel: 0, nerve: 0 },
  selected: null, hovered: null, isolate: null, override: null,
  xray: false, labels: false, spin: true, explode: 0,
};
const structFade = new Map(ALL_IDS.map((id) => [id, 0]));
function targetFor(id) {
  if (state.isolate) return id === state.isolate ? 1 : .07;
  if (state.override) return state.override.get(id) ?? 0;
  return state.systems[INFO[id].system] ?? 0;
}

/* ================= VURGULAMA ================= */
const flashState = new Map(); // id -> {hex, intensity, expires}
let highlighted = new Set();
function matsOf(id) {
  const out = [];
  for (const p of structures.get(id).parts) out.push(...p.mats);
  if (xrayCache.has(id)) out.push(xrayCache.get(id));
  return out;
}
function setIdEmissive(id, spec) {
  for (const m of matsOf(id)) {
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

/* ================= KAMERA ANİMASYONU ================= */
let camAnim = null;
function animateCam(toPos, toTarget, dur = 1.15) {
  camAnim = {
    t: 0, dur, fromPos: camera.position.clone(), toPos: toPos.clone(),
    fromTgt: controls.target.clone(), toTgt: toTarget.clone(),
  };
  controls.autoRotate = false;
}
controls.addEventListener('start', () => { camAnim = null; if (state.spin) controls.autoRotate = true; });
const HOME_POS = V3(4.6, 6.1, 12.6), HOME_TGT = V3(0, 5.0, 0);
function structBox(id) {
  const box = new THREE.Box3();
  for (const p of structures.get(id).parts) box.union(new THREE.Box3().setFromObject(p.group));
  return box;
}
function focusStructure(id) {
  const box = structBox(id);
  const center = box.getCenter(new THREE.Vector3());
  const sphere = box.getBoundingSphere(new THREE.Sphere());
  const dir = camera.position.clone().sub(controls.target).normalize();
  if (dir.lengthSq() < .01) dir.set(.4, .25, 1).normalize();
  // önden bakışa hafif meyil ver (organlar önden daha iyi görünür)
  dir.lerp(V3(.35, .18, 1).normalize(), .35).normalize();
  const dist = clamp(sphere.radius * 3.4, 1.7, 10);
  animateCam(center.clone().addScaledVector(dir, dist), center, 1.1);
}

/* ================= SEÇİM & BİLGİ KARTI ================= */
const els = {
  card: $('#infoCard'), def: $('#infoDefault'), name: $('#infoName'), latin: $('#infoLatin'),
  desc: $('#infoDesc'), funcs: $('#infoFuncs'), clinic: $('#infoClinic'), fact: $('#infoFact'),
  badge: $('#infoSystem'), btnIsolate: $('#btnIsolate'),
};
function defaultSysOpacity(sys) {
  if (sys !== 'skin') return 1;
  const otherOn = SYS_ORDER.some((s) => s !== 'skin' && effectiveSys(s) > 0);
  return otherOn ? .13 : 1;
}
function effectiveSys(sys) {
  if (state.override) {
    let m = 0; for (const [id, v] of state.override) if (INFO[id].system === sys) m = Math.max(m, v);
    return m;
  }
  return state.systems[sys];
}
function ensureVisible(id) {
  if (targetFor(id) >= .5) return;
  state.override = null; state.isolate = null;
  const sys = INFO[id].system;
  state.systems[sys] = sys === 'skin' ? .9 : 1;
  markLayerCustom(); updateSystemRows(); syncIsolateBtn();
}
function fillInfo(id) {
  const d = INFO[id];
  els.badge.textContent = SYSTEMS[d.system].tr;
  els.badge.style.setProperty('--sys', SYSTEMS[d.system].color);
  els.name.textContent = d.name;
  els.latin.textContent = d.latin;
  els.desc.textContent = d.desc;
  els.funcs.innerHTML = '';
  for (const f of d.funcs) { const li = document.createElement('li'); li.textContent = f; els.funcs.appendChild(li); }
  els.clinic.textContent = d.clinic;
  els.fact.textContent = d.fact;
  els.card.classList.remove('hidden'); els.def.classList.add('hidden');
  // animasyonu yeniden tetikle
  els.card.style.animation = 'none'; void els.card.offsetWidth; els.card.style.animation = '';
}
function select(id, { focus = false, ensure = false } = {}) {
  state.selected = id;
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
  refreshHighlights();
  if (state.xray) refreshXray();
}
function syncIsolateBtn() {
  const on = state.isolate && state.isolate === state.selected;
  els.btnIsolate.classList.toggle('on', !!on);
  els.btnIsolate.textContent = on ? '◐ İzolasyonu Bırak' : '◐ İzole Et';
}
$('#infoClose').onclick = () => select(null);
$('#btnFocus').onclick = () => state.selected && focusStructure(state.selected);
els.btnIsolate.onclick = () => {
  if (!state.selected) return;
  state.isolate = state.isolate === state.selected ? null : state.selected;
  syncIsolateBtn();
};

/* ================= SİSTEM LİSTESİ & KATMANLAR ================= */
const EYE = '<svg class="ic" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
const EYE_OFF = '<svg class="ic" viewBox="0 0 24 24"><path d="M17.94 17.94A10.6 10.6 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 4.06-4.94M9.9 4.24A9.5 9.5 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M14.12 14.12A3 3 0 1 1 9.88 9.88" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M2 2l20 20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const sysRows = new Map();
{
  const list = $('#systemList');
  for (const sys of SYS_ORDER) {
    const count = ALL_IDS.filter((id) => INFO[id].system === sys).length;
    const row = document.createElement('div');
    row.className = 'sys-row'; row.dataset.sys = sys;
    row.innerHTML = `
      <span class="sys-dot" style="background:${SYSTEMS[sys].color};color:${SYSTEMS[sys].color}"></span>
      <button class="sys-name" style="text-align:left">${SYSTEMS[sys].tr}</button>
      <span class="sys-count">${count} yapı</span>
      <button class="sys-solo" title="Yalnızca bu sistemi göster">SOLO</button>
      <button class="sys-eye" title="Göster / gizle">${EYE}</button>`;
    const toggle = () => toggleSystem(sys);
    row.querySelector('.sys-name').onclick = toggle;
    row.querySelector('.sys-eye').onclick = toggle;
    row.querySelector('.sys-solo').onclick = (e) => { e.stopPropagation(); soloSystem(sys); };
    list.appendChild(row);
    sysRows.set(sys, row);
  }
}
function updateSystemRows() {
  for (const sys of SYS_ORDER) {
    const row = sysRows.get(sys);
    const on = effectiveSys(sys) > 0;
    row.classList.toggle('off', !on);
    row.querySelector('.sys-eye').innerHTML = on ? EYE : EYE_OFF;
  }
}
function markLayerCustom() {
  $$('#layerSeg button').forEach((b) => b.classList.remove('active'));
  $('#layerName').textContent = 'Özel Karışım';
}
function postVisibilityChange() { updateSystemRows(); syncIsolateBtn(); }
function toggleSystem(sys) {
  state.override = null; state.isolate = null;
  state.systems[sys] = state.systems[sys] > 0 ? 0 : defaultSysOpacity(sys);
  if (sys === 'skin' && state.systems.skin > 0 && SYS_ORDER.every((s) => s === 'skin' || state.systems[s] === 0)) state.systems.skin = 1;
  markLayerCustom(); postVisibilityChange();
}
function soloSystem(sys) {
  state.override = null; state.isolate = null;
  for (const s of SYS_ORDER) state.systems[s] = s === sys ? 1 : 0;
  markLayerCustom(); postVisibilityChange();
}
const LAYERS = {
  deri:    { label: 'Deri',       v: { skin: 1,   muscle: 0, bone: 0,   organ: 0, vessel: 0, nerve: 0 } },
  kas:     { label: 'Kaslar',     v: { skin: .13, muscle: 1, bone: 0,   organ: 0, vessel: 0, nerve: 0 } },
  iskelet: { label: 'İskelet',    v: { skin: 0,   muscle: 0, bone: 1,   organ: 0, vessel: 0, nerve: 0 } },
  ic:      { label: 'İç Yapılar', v: { skin: 0,   muscle: 0, bone: .18, organ: 1, vessel: 1, nerve: 1 } },
};
function applyLayer(name) {
  const L = LAYERS[name]; if (!L) return;
  state.override = null; state.isolate = null;
  state.systems = { ...L.v };
  $$('#layerSeg button').forEach((b) => b.classList.toggle('active', b.dataset.layer === name));
  $('#layerName').textContent = L.label;
  postVisibilityChange();
}
$$('#layerSeg button').forEach((b) => b.onclick = () => applyLayer(b.dataset.layer));

/* bölge uçuşları */
const REGIONS = {
  tum:   { p: HOME_POS, t: HOME_TGT },
  bas:   { p: V3(1.9, 9.7, 4.3), t: V3(0, 9.3, 0) },
  gogus: { p: V3(2.6, 7.5, 5.4), t: V3(0, 7.2, 0) },
  karin: { p: V3(2.7, 5.7, 5.1), t: V3(0, 5.3, 0) },
  kol:   { p: V3(4.6, 7.4, 4.0), t: V3(1.35, 7.0, 0) },
  bacak: { p: V3(3.3, 3.1, 5.2), t: V3(.3, 2.5, 0) },
};
$$('#regionChips button').forEach((b) => b.onclick = () => {
  const r = REGIONS[b.dataset.region]; animateCam(r.p, r.t, 1.25);
});
const VIEWS = {
  on: V3(0, 5.6, 13.8), arka: V3(0, 5.6, -13.8),
  sol: V3(13.8, 5.6, 0), sag: V3(-13.8, 5.6, 0),
};
$$('.bb-group.views button').forEach((b) => b.onclick = () => animateCam(VIEWS[b.dataset.view], HOME_TGT, 1.1));

/* hazır ders görünümleri */
function overrideFrom(spec) {
  const map = new Map();
  for (const [key, op] of Object.entries(spec)) {
    if (SYS_ORDER.includes(key)) { for (const id of ALL_IDS) if (INFO[id].system === key) map.set(id, op); }
    else if (INFO[key]) map.set(key, op);
  }
  return map;
}
const PRESETS = {
  dolanim: () => { state.override = overrideFrom({ bone: .13, vessel: 1, lungs: .16 }); afterPreset('heart', REGIONS.gogus); },
  solunum: () => { state.override = overrideFrom({ trachea: 1, lungs: 1, diaphragm: 1, ribs: .32, sternum: .32, thoracic: .25 }); afterPreset('lungs', REGIONS.gogus); },
  sindirim: () => { state.override = overrideFrom({ esophagus: 1, stomach: 1, liver: 1, gallbladder: 1, pancreas: 1, small_intestine: 1, large_intestine: 1, lumbar: .25, pelvis: .25, sacrum: .25 }); afterPreset('liver', REGIONS.karin); },
  sinir: () => { state.override = overrideFrom({ nerve: 1, eye: 1, cranium: .14, cervical: .2, thoracic: .2, lumbar: .2, sacrum: .2 }); afterPreset('brain', { p: V3(5.6, 7.2, 10.5), t: V3(0, 6.2, 0) }); },
  iskelet: () => { applyLayer('iskelet'); animateCam(HOME_POS, HOME_TGT, 1.2); },
  kas: () => {
    state.override = null; state.isolate = null;
    state.systems = { skin: 0, muscle: 1, bone: 0, organ: 0, vessel: 0, nerve: 0 };
    $$('#layerSeg button').forEach((b) => b.classList.toggle('active', b.dataset.layer === 'kas'));
    $('#layerName').textContent = 'Kas Posteri'; postVisibilityChange();
    animateCam(HOME_POS, HOME_TGT, 1.2);
  },
};
function afterPreset(selectId, region) {
  state.isolate = null; markLayerCustom(); postVisibilityChange();
  select(selectId);
  animateCam(region.p, region.t, 1.25);
}
$$('#presetList button').forEach((b) => b.onclick = () => PRESETS[b.dataset.preset]());

/* yapılar sekmesi */
{
  const list = $('#structList');
  for (const sys of SYS_ORDER) {
    const head = document.createElement('div');
    head.className = 'struct-group'; head.dataset.sys = sys; head.textContent = SYSTEMS[sys].tr;
    list.appendChild(head);
    const ids = ALL_IDS.filter((id) => INFO[id].system === sys)
      .sort((a, b) => INFO[a].name.localeCompare(INFO[b].name, 'tr'));
    for (const id of ids) {
      const btn = document.createElement('button');
      btn.className = 'struct-item'; btn.dataset.id = id; btn.dataset.sys = sys;
      btn.innerHTML = `<span class="dot" style="background:${SYSTEMS[sys].color}"></span><span>${INFO[id].name}</span><span class="lat">${INFO[id].latin}</span>`;
      btn.onclick = () => { select(id, { ensure: true, focus: true }); };
      list.appendChild(btn);
    }
  }
  $('#structFilter').addEventListener('input', (e) => {
    const q = fold(e.target.value);
    const visBySys = {};
    $$('.struct-item').forEach((b) => {
      const d = INFO[b.dataset.id];
      const show = !q || fold(d.name + ' ' + d.latin).includes(q);
      b.style.display = show ? '' : 'none';
      if (show) visBySys[b.dataset.sys] = true;
    });
    $$('.struct-group').forEach((h) => h.style.display = visBySys[h.dataset.sys] ? '' : 'none');
  });
}
$$('.tab').forEach((t) => t.onclick = () => {
  $$('.tab').forEach((x) => x.classList.toggle('active', x === t));
  $('#tab-systems').classList.toggle('hidden', t.dataset.tab !== 'systems');
  $('#tab-structures').classList.toggle('hidden', t.dataset.tab !== 'structures');
});
$('#structCount').textContent = ALL_IDS.length;
$('#stYapı').textContent = ALL_IDS.length;

/* ================= ARAMA ================= */
function fold(s) {
  return s.toLocaleLowerCase('tr-TR')
    .replaceAll('ç', 'c').replaceAll('ğ', 'g').replaceAll('ı', 'i').replaceAll('İ', 'i')
    .replaceAll('ö', 'o').replaceAll('ş', 's').replaceAll('ü', 'u');
}
const searchEl = $('#search'), resultsEl = $('#searchResults');
let searchHits = [];
function runSearch() {
  const q = fold(searchEl.value.trim());
  if (!q) { resultsEl.classList.add('hidden'); searchHits = []; return; }
  searchHits = ALL_IDS
    .map((id) => ({ id, d: INFO[id], score: (fold(INFO[id].name).startsWith(q) ? 0 : 1) + (fold(INFO[id].name + ' ' + INFO[id].latin).includes(q) ? 0 : 9) }))
    .filter((x) => x.score < 9)
    .sort((a, b) => a.score - b.score || a.d.name.localeCompare(b.d.name, 'tr'))
    .slice(0, 9);
  resultsEl.innerHTML = searchHits.length
    ? searchHits.map(({ id, d }) => `<button data-id="${id}"><span class="dot" style="background:${SYSTEMS[d.system].color}"></span>${d.name}<span class="lat">${d.latin}</span></button>`).join('')
    : '<div class="empty">Sonuç yok — başka bir ad deneyin (örn. "femur", "dalak").</div>';
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
const rngExplode = $('#rngExplode'), rngClip = $('#rngClip');
let diaExplodeY = animated.diaphragm ? animated.diaphragm.position.y : 0;
function applyExplode() {
  for (const p of parts) {
    p.group.position.copy(p.home).addScaledVector(p.dir, state.explode * 1.7 * p.factor);
    if (animated.diaphragm && p.group === animated.diaphragm) diaExplodeY = p.group.position.y;
  }
}
rngExplode.addEventListener('input', () => { state.explode = rngExplode.value / 100; syncRange(rngExplode); applyExplode(); });
rngClip.addEventListener('input', () => {
  syncRange(rngClip);
  clipPlane.constant = -.2 + (rngClip.value / 100) * 11.2;
});
syncRange(rngExplode); syncRange(rngClip);

function refreshXray() {
  for (const p of parts) {
    for (const mesh of p.meshes) {
      mesh.material = (state.xray && p.id !== state.selected) ? xrayMatFor(p.id) : mesh.userData.origMat;
    }
  }
}
$('#tgXray').onclick = (e) => {
  state.xray = !state.xray;
  e.currentTarget.classList.toggle('active', state.xray);
  refreshXray(); refreshHighlights();
  toast(state.xray ? '🩻 X-Işını modu açık — seçili yapı gerçek rengiyle parlar' : 'X-Işını modu kapalı');
};
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
  rngClip.value = 100; syncRange(rngClip); clipPlane.constant = 11;
  applyLayer('kas');
  animateCam(HOME_POS, HOME_TGT, 1.2);
}

/* ekran görüntüsü + tam ekran */
$('#btnShot').onclick = () => {
  renderer.setClearColor(0x070d18, 1); renderer.render(scene, camera);
  renderer.domElement.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'corpus3d-anatomi.png'; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
    toast('📸 Görüntü kaydedildi — arkadaşına gönder bakalım kim gülecek 😏', 'ok');
  });
  renderer.setClearColor(0x000000, 0);
};
$('#btnFull').onclick = () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen?.();
};

/* toast */
let toastTimer;
function toast(msg, kind = '') {
  const t = $('#toast');
  t.textContent = msg; t.className = kind;
  t.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), 3400);
}

/* rastgele bilgi */
function randomFact() {
  const id = ALL_IDS[Math.floor(Math.random() * ALL_IDS.length)];
  $('#factText').textContent = INFO[id].fact;
  const src = $('#factSrc');
  src.textContent = `— ${INFO[id].name} (${INFO[id].latin}) · karta git →`;
  src.style.cursor = 'pointer';
  src.onclick = () => select(id, { ensure: true, focus: true });
}
$('#btnFact').onclick = randomFact;
randomFact();

/* ================= TIKLAMA / SEÇİM ================= */
const raycaster = new THREE.Raycaster();
const pointerNDC = new THREE.Vector2();
let pointerClient = { x: 0, y: 0 }, needPick = false, downInfo = null;
const tooltip = $('#tooltip');
function castAt(clientX, clientY) {
  pointerNDC.set((clientX / innerWidth) * 2 - 1, -(clientY / innerHeight) * 2 + 1);
  raycaster.setFromCamera(pointerNDC, camera);
  const hits = raycaster.intersectObjects(pickMeshes, false);
  for (const h of hits) {
    let o = h.object, shown = true;
    while (o) { if (!o.visible) { shown = false; break; } o = o.parent; }
    if (!shown) continue;
    const id = h.object.userData.sid;
    if ((structFade.get(id) ?? 0) > .15) return id;
  }
  return null;
}
renderer.domElement.addEventListener('pointermove', (e) => {
  pointerClient = { x: e.clientX, y: e.clientY }; needPick = true;
});
renderer.domElement.addEventListener('pointerdown', (e) => {
  downInfo = { x: e.clientX, y: e.clientY, t: performance.now() };
  if (state.spin) { state.spin = false; controls.autoRotate = false; $('#tgSpin').classList.remove('active'); }
});
renderer.domElement.addEventListener('pointerup', (e) => {
  if (!downInfo) return;
  const moved = Math.hypot(e.clientX - downInfo.x, e.clientY - downInfo.y);
  const dt = performance.now() - downInfo.t;
  downInfo = null;
  if (moved > 6 || dt > 450) return;
  const id = castAt(e.clientX, e.clientY);
  if (quiz.active) { quizClick(id); return; }
  if (id) select(id); else select(null);
});
renderer.domElement.addEventListener('dblclick', (e) => {
  const id = castAt(e.clientX, e.clientY);
  if (id && !quiz.active) { select(id); focusStructure(id); }
});

/* klavye */
document.addEventListener('keydown', (e) => {
  const tag = document.activeElement?.tagName;
  if (tag === 'INPUT') return;
  if (e.key === '/') { e.preventDefault(); searchEl.focus(); }
  else if (e.key === 'Escape') { select(null); hideModals(); }
  else if (e.key.toLowerCase() === 'r') animateCam(HOME_POS, HOME_TGT, 1.1);
  else if (['1', '2', '3', '4', '5', '6'].includes(e.key)) toggleSystem(SYS_ORDER[Number(e.key) - 1]);
});

/* mobil paneller */
$('#mbLeft').onclick = () => { $('#leftPanel').classList.toggle('open'); $('#rightPanel').classList.remove('open'); };
$('#mbRight').onclick = () => { $('#rightPanel').classList.toggle('open'); $('#leftPanel').classList.remove('open'); };

/* ================= ETİKETLER ================= */
const LABEL_IDS = ['brain', 'cerebellum', 'cranium', 'mandible', 'eye', 'trachea', 'lungs', 'heart', 'aorta',
  'diaphragm', 'liver', 'stomach', 'kidneys', 'small_intestine', 'bladder', 'ribs', 'sternum', 'clavicle',
  'humerus', 'radius', 'pelvis', 'femur', 'patella', 'tibia', 'pectoralis', 'deltoid', 'biceps', 'trapezius',
  'latissimus', 'rectus_abdominis', 'gluteus', 'quadriceps', 'gastrocnemius', 'spinal_cord', 'sciatic', 'skin'];
const ANCHOR_OVERRIDE = {
  ribs: V3(1.02, 7.2, .1), spinal_cord: V3(0, 7.0, -.42), aorta: V3(.1, 6.3, -.28),
  lungs: V3(.62, 7.5, .35), skin: V3(-1.4, 7.6, .3), small_intestine: V3(.3, 5.0, .42),
  heart: V3(.2, 7.15, .45), trachea: V3(0, 8.3, .2),
};
const labelEls = new Map();
{
  const SVGNS = 'http://www.w3.org/2000/svg';
  for (const id of LABEL_IDS) {
    if (!structures.has(id)) continue;
    let anchor;
    if (ANCHOR_OVERRIDE[id]) anchor = ANCHOR_OVERRIDE[id].clone();
    else {
      const first = structures.get(id).parts[0];
      anchor = new THREE.Box3().setFromObject(first.group).getCenter(new THREE.Vector3());
    }
    const div = document.createElement('div');
    div.className = 'label3d';
    div.innerHTML = `${INFO[id].name}<small>${INFO[id].latin}</small>`;
    div.style.display = 'none';
    labelsWrap.appendChild(div);
    const line = document.createElementNS(SVGNS, 'polyline');
    line.setAttribute('fill', 'none'); line.setAttribute('stroke', 'rgba(103,232,249,.55)');
    line.setAttribute('stroke-width', '1.2'); line.style.display = 'none';
    leadersSvg.appendChild(line);
    const dot = document.createElementNS(SVGNS, 'circle');
    dot.setAttribute('r', '3'); dot.setAttribute('fill', '#67e8f9'); dot.style.display = 'none';
    leadersSvg.appendChild(dot);
    labelEls.set(id, { div, line, dot, anchor, first: structures.get(id).parts[0] });
  }
}
const _pv = new THREE.Vector3(), _rad = new THREE.Vector3(), _tc = new THREE.Vector3();
function updateLabels() {
  if (!state.labels) return;
  let i = 0;
  for (const [id, L] of labelEls) {
    i++;
    const hide = () => { L.div.style.display = 'none'; L.line.style.display = 'none'; L.dot.style.display = 'none'; };
    if ((structFade.get(id) ?? 0) < .55) { hide(); continue; }
    _pv.copy(L.anchor).add(_tc.copy(L.first.group.position).sub(L.first.home));
    // arka yüz filtresi
    _rad.set(_pv.x, 0, _pv.z);
    const rl = _rad.length();
    if (rl > .28) {
      _tc.copy(camera.position).sub(_pv);
      if (_rad.normalize().dot(_tc.normalize()) < -.18) { hide(); continue; }
    }
    const wp = _pv.clone();
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
    void wp;
  }
}

/* ================= CANLI SİMÜLASYON (kalp, solunum, EKG) ================= */
let bpm = 72, bpmTarget = 72, respRate = 12;
let beatAcc = 0, respAcc = 0, flowT = 0;
const gauss = (x, c, w) => Math.exp(-Math.pow((x - c) / w, 2));
function ecgWave(p) {
  return .13 * gauss(p, .18, .032) - .13 * gauss(p, .30, .011) + 1.0 * gauss(p, .33, .013)
       - .24 * gauss(p, .365, .012) + .24 * gauss(p, .56, .046);
}
const ecgCtx = $('#ecg').getContext('2d');
function drawECG() {
  const W = 520, H = 110, base = 72;
  ecgCtx.clearRect(0, 0, W, H);
  ecgCtx.strokeStyle = 'rgba(52,211,153,.13)'; ecgCtx.lineWidth = 1;
  for (let x = 0; x < W; x += 26) { ecgCtx.beginPath(); ecgCtx.moveTo(x, 0); ecgCtx.lineTo(x, H); ecgCtx.stroke(); }
  for (let y = 0; y < H; y += 22) { ecgCtx.beginPath(); ecgCtx.moveTo(0, y); ecgCtx.lineTo(W, y); ecgCtx.stroke(); }
  ecgCtx.strokeStyle = '#34d399'; ecgCtx.lineWidth = 2.4;
  ecgCtx.shadowColor = 'rgba(52,211,153,.75)'; ecgCtx.shadowBlur = 9;
  ecgCtx.beginPath();
  const pxPerBeat = 150;
  for (let x = 0; x <= W; x += 2) {
    const beats = beatAcc - (W - x) / pxPerBeat;
    const p = ((beats % 1) + 1) % 1;
    const y = base - ecgWave(p) * 52;
    x === 0 ? ecgCtx.moveTo(x, y) : ecgCtx.lineTo(x, y);
  }
  ecgCtx.stroke(); ecgCtx.shadowBlur = 0;
}
setInterval(() => {
  $('#vBpm').innerHTML = `${Math.round(bpm + Math.sin(Date.now() / 9000) * 1.5)} <small>bpm</small>`;
  $('#vSpo2').textContent = '%' + (98 + Math.round(Math.sin(Date.now() / 17000)));
  $('#vResp').innerHTML = `${Math.round(respRate)} <small>/dk</small>`;
}, 1000);

/* ================= SINAV MODU ================= */
const quiz = { active: false, qs: [], idx: 0, score: 0, correct: 0, streak: 0, best: 0, attempts: 3, timeLeft: 20, locked: false, timer: null, cat: '' };
const CAT_LABEL = { bone: 'İskelet', muscle: 'Kaslar', organ: 'İç Organlar & Damarlar', nerve: 'Sinir Sistemi' };
function hideModals() { $('#quizSetup').classList.add('hidden'); $('#quizResult').classList.add('hidden'); }
$$('[data-close]').forEach((b) => b.onclick = () => $('#' + b.dataset.close).classList.add('hidden'));
$('#btnQuiz').onclick = () => { if (!quiz.active) $('#quizSetup').classList.remove('hidden'); };
$$('.quiz-cats button').forEach((b) => b.onclick = () => startQuiz(b.dataset.cat));
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function startQuiz(cat) {
  hideModals();
  let pool;
  if (cat === 'organ') pool = ALL_IDS.filter((id) => ['organ', 'vessel'].includes(INFO[id].system));
  else pool = ALL_IDS.filter((id) => INFO[id].system === cat);
  if (state.xray) $('#tgXray').click();
  if (state.labels) $('#tgLabels').click();
  select(null);
  if (cat === 'bone') applyLayer('iskelet');
  else if (cat === 'muscle') { state.systems = { skin: 0, muscle: 1, bone: 0, organ: 0, vessel: 0, nerve: 0 }; state.override = null; state.isolate = null; markLayerCustom(); postVisibilityChange(); }
  else if (cat === 'organ') { state.systems = { skin: 0, muscle: 0, bone: .18, organ: 1, vessel: 1, nerve: 0 }; state.override = null; state.isolate = null; markLayerCustom(); postVisibilityChange(); }
  else { state.systems = { skin: 0, muscle: 0, bone: .14, organ: 0, vessel: 0, nerve: 1 }; state.override = null; state.isolate = null; markLayerCustom(); postVisibilityChange(); }
  Object.assign(quiz, {
    active: true, cat, qs: shuffle([...pool]).slice(0, Math.min(10, pool.length)),
    idx: 0, score: 0, correct: 0, streak: 0, best: 0,
  });
  $('#quizHud').classList.remove('hidden');
  bpmTarget = 96; respRate = 16;
  animateCam(HOME_POS, HOME_TGT, 1.1);
  setQuestion();
  clearInterval(quiz.timer);
  quiz.timer = setInterval(() => {
    if (!quiz.active || quiz.locked) return;
    quiz.timeLeft -= .1;
    const bar = $('#quizTimerBar');
    bar.style.width = clamp(quiz.timeLeft / 20 * 100, 0, 100) + '%';
    bar.classList.toggle('low', quiz.timeLeft <= 5);
    if (quiz.timeLeft <= 0) revealAnswer('⏰ Süre doldu!');
  }, 100);
}
function setQuestion() {
  select(null);
  const id = quiz.qs[quiz.idx];
  quiz.attempts = 3; quiz.timeLeft = 20; quiz.locked = false;
  $('#quizProgress').textContent = `Soru ${quiz.idx + 1}/${quiz.qs.length}`;
  $('#quizTarget').innerHTML = `${INFO[id].name}<small>${INFO[id].latin}</small>`;
  $('#quizScore').textContent = `${quiz.score} puan`;
  $('#quizStreak').textContent = quiz.streak >= 2 ? `🔥 ${quiz.streak} seri` : '';
  const bar = $('#quizTimerBar'); bar.style.width = '100%'; bar.classList.remove('low');
  const m = $('#quizMsg'); m.textContent = ''; m.className = '';
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
    m.textContent = `✅ ${PRAISE[Math.floor(Math.random() * PRAISE.length)]} +${gain} puan${mult > 1 ? ` (seri ×${mult.toFixed(2).replace(/0$/, '')})` : ''}`;
    $('#quizScore').textContent = `${quiz.score} puan`;
    setTimeout(nextQuestion, 1400);
  } else {
    quiz.attempts--; quiz.streak = 0;
    flash(id, 0xb01e34, 650, 1.5);
    if (quiz.attempts > 0) {
      m.className = 'bad';
      m.textContent = `❌ O yapı: ${INFO[id].name}. ${quiz.attempts} hakkın kaldı.`;
    } else revealAnswer('❌ Hakların doldu.');
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
  m.textContent = `${prefix} Doğru yapı ışıldıyor: ${INFO[target].name}. Karta göz at!`;
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
  bpmTarget = 72; respRate = 12;
}
function finishQuiz() {
  endQuiz();
  const total = quiz.qs.length, ratio = quiz.correct / total;
  const [emoji, title] = ratio >= .9 ? ['🏆', 'Anatomi Profesörü']
    : ratio >= .7 ? ['🩺', 'Uzman Hekim Adayı']
    : ratio >= .5 ? ['📚', 'Çalışkan Tıp Öğrencisi']
    : ratio >= .3 ? ['🔬', 'Meraklı Araştırmacı']
    : ['🌱', 'Anatomi Yolculuğu Başlıyor'];
  $('#resultEmoji').textContent = emoji;
  $('#resultTitle').textContent = title;
  $('#resultScore').textContent = quiz.score;
  $('#resultDetail').textContent =
    `${total} soruda ${quiz.correct} doğru · En uzun seri: ${quiz.best} · Kategori: ${CAT_LABEL[quiz.cat]}`;
  $('#quizResult').classList.remove('hidden');
  quiz.finalTitle = title;
}
$('#quizExit').onclick = () => { endQuiz(); toast('Sınavdan çıktınız — keşfe devam!'); };
$('#quizSkip').onclick = () => { if (!quiz.locked) revealAnswer('⏭ Pas geçtiniz.'); };
$('#btnAgain').onclick = () => { hideModals(); $('#quizSetup').classList.remove('hidden'); };
$('#btnChallenge').onclick = async () => {
  const text = `🫀 CORPUS·3D Anatomi Sınavı'nda ${quiz.score} puan yaptım! (${quiz.correct}/${quiz.qs.length} doğru — unvanım: ${quiz.finalTitle || 'Hekim Adayı'})\nMacBook'undaki o uygulamayla beni geçebilir misin bakalım? 😏`;
  try { await navigator.clipboard.writeText(text); toast('📋 Meydan okuma kopyalandı! Arkadaşına gönder, cevabını bekle 😎', 'ok'); }
  catch { toast(text); }
};

/* ================= ANA DÖNGÜ ================= */
const clock = new THREE.Clock();
const easeInOut = (t) => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const _fp = new THREE.Vector3();
updateSystemRows(); applyExplode();

function tick() {
  requestAnimationFrame(tick);
  const dt = Math.min(clock.getDelta(), .05);
  const t = clock.elapsedTime;

  /* kamera animasyonu */
  if (camAnim) {
    camAnim.t += dt / camAnim.dur;
    const k = easeInOut(clamp(camAnim.t, 0, 1));
    camera.position.lerpVectors(camAnim.fromPos, camAnim.toPos, k);
    controls.target.lerpVectors(camAnim.fromTgt, camAnim.toTgt, k);
    if (camAnim.t >= 1) { camAnim = null; if (state.spin) controls.autoRotate = true; }
  }
  controls.target.x = clamp(controls.target.x, -4, 4);
  controls.target.y = clamp(controls.target.y, .2, 10.2);
  controls.target.z = clamp(controls.target.z, -4, 4);
  controls.update();

  /* sistem yumuşak geçişleri */
  const blend = Math.min(1, dt * 5.2);
  for (const id of ALL_IDS) {
    const tgt = targetFor(id);
    let cur = structFade.get(id) ?? 0;
    if (Math.abs(tgt - cur) < .004) cur = tgt; else cur += (tgt - cur) * blend;
    structFade.set(id, cur);
    const st = structures.get(id);
    for (const p of st.parts) {
      p.group.visible = cur > .02;
      if (!p.group.visible) continue;
      const cast = cur > .85 && !state.xray;
      for (const mesh of p.meshes) mesh.castShadow = cast;
      const mats = (state.xray && id !== state.selected) ? [xrayMatFor(id)] : p.mats;
      for (const m of mats) {
        const op = cur * (m.userData.baseOpacity ?? 1);
        m.opacity = op;
        m.transparent = op < .985;
        m.depthWrite = op >= .985;
      }
    }
  }
  for (const f of flows) {
    const k = structFade.get(f.sid) ?? 0;
    f.points.visible = k > .06;
    f.mat.opacity = .95 * clamp(k, 0, 1);
  }

  /* nabız & solunum */
  bpm += (bpmTarget - bpm) * Math.min(1, dt * .8);
  beatAcc += dt * bpm / 60;
  respAcc += dt * respRate / 60;
  flowT += dt;
  const phase = beatAcc % 1;
  if (animated.heart) {
    const pulse = gauss(phase, .33, .055) * .95 + gauss(phase, .55, .06) * .4;
    const s = 1 + pulse * .085;
    animated.heart.scale.set(s, s, s);
  }
  const breath = (Math.sin(respAcc * Math.PI * 2 - Math.PI / 2) + 1) / 2;
  for (const L of animated.lungs) {
    L.group.scale.set(
      L.base.x * (1 + breath * .075),
      L.base.y * (1 + breath * .04),
      L.base.z * (1 + breath * .075));
  }
  if (animated.diaphragm) {
    animated.diaphragm.position.y = diaExplodeY - breath * .14;
    animated.diaphragm.scale.y = 1 - breath * .3;
  }
  drawECG();

  /* kan akışı & sinir impulsları */
  for (const f of flows) {
    if (!f.points.visible) continue;
    const arr = f.points.geometry.attributes.position.array;
    for (let i = 0; i < f.count; i++) {
      let tt;
      if (f.type === 'nerve') {
        const rr = (f.offsets[i] + flowT * f.speed) % 1.5;
        if (rr > 1) { arr[i * 3 + 1] = -999; continue; }
        tt = rr;
      } else {
        tt = (f.offsets[i] + flowT * f.speed) % 1;
        if (f.reverse) tt = 1 - tt;
      }
      f.curve.getPointAt(tt, _fp);
      arr[i * 3] = _fp.x; arr[i * 3 + 1] = _fp.y; arr[i * 3 + 2] = _fp.z;
    }
    f.points.geometry.attributes.position.needsUpdate = true;
  }

  /* seçim nabzı + flaş süreleri */
  let flashChanged = false;
  for (const [id, f] of flashState) if (performance.now() > f.expires) { flashState.delete(id); flashChanged = true; }
  if (flashChanged) refreshHighlights();
  if (state.selected && !flashState.has(state.selected)) {
    const inten = .75 + Math.sin(t * 4.2) * .35;
    for (const m of matsOf(state.selected)) { m.emissive.setHex(0x0f6d8a); m.emissiveIntensity = inten; }
  }

  /* hover seçimi */
  if (needPick) {
    needPick = false;
    const id = castAt(pointerClient.x, pointerClient.y);
    if (id !== state.hovered) { state.hovered = id; refreshHighlights(); }
    if (id) {
      tooltip.innerHTML = `${INFO[id].name}<small>${INFO[id].latin}${quiz.active ? '' : ' · tıklayın'}</small>`;
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

/* boyutlandırma */
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

/* giriş sekansı */
{
  const fillEl = $('#introFill'), msg = $('#introMsg');
  const steps = [[35, 'İskelet diziliyor…'], [62, 'Kaslar dokuluyor…'], [84, 'Kalp çalıştırılıyor…'], [100, 'Hazır!']];
  steps.forEach(([v, m], i) => setTimeout(() => { fillEl.style.width = v + '%'; msg.textContent = m; }, 180 * (i + 1)));
  setTimeout(() => {
    $('#intro').classList.add('done');
    animateCam(HOME_POS, HOME_TGT, 1.9);
    setTimeout(() => toast('👋 HOŞ GELDİNİZ! Bir kasa tıklayın ya da "İç Yapılar" katmanına geçip atan kalbi izleyin.'), 1400);
  }, 1050);
}
console.log(`CORPUS·3D hazır: ${ALL_IDS.length} yapı, ${parts.length} parça, ${pickMeshes.length} tıklanabilir ağ.`);
