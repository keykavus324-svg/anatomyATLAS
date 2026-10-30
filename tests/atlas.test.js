import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { INFO } from '../src/data.js';
import { TOURS } from '../src/tours.js';
import { mapToInfo } from '../src/trmap.js';
const data = JSON.parse(readFileSync('public/data/systems.json', 'utf8'));
const names = [...new Set(Object.values(data).flat().map((name) => name.replace(/\.[lr]$/, '')))];

test('tüm ders adımları atlas verisinde çözülür', () => {
  assert.equal(TOURS.length, 8);
  for (const tour of TOURS) for (const step of tour.steps) {
    assert.ok(INFO[step.info], `${tour.id}: bilgi anahtarı ${step.info}`);
    if (step.real) assert.ok(names.includes(step.real), `${tour.id}: gerçek ${step.real}`);
    else assert.ok(names.some((name) => mapToInfo(name) === step.info), `${tour.id}: gerçek ${step.info}`);
  }
});

test('üretim service worker kabuğu ve tüm model verilerini önbelleğe alır, çevrimdışı sayfayı sunar', async () => {
  const sw = readFileSync('dist/sw.js', 'utf8');
  assert.doesNotMatch(sw, /__PRECACHE__|__VERSION__/);
  const handlers = {}; let added; let claimed = false;
  const cache = { addAll: async (paths) => { added = paths; }, match: async (key) => key === 'https://example.test/app/index.html' ? 'offline-html' : undefined };
  const caches = { open: async () => cache, keys: async () => ['another-app', 'corpus3d-old'], delete: async (key) => { assert.equal(key, 'corpus3d-old'); } };
  const self = { registration: { scope: 'https://example.test/app/' }, location: { origin: 'https://example.test' }, addEventListener: (name, cb) => { handlers[name] = cb; }, skipWaiting: async () => {}, clients: { claim: async () => { claimed = true; } } };
  vm.runInNewContext(sw, { self, caches, URL, Response, fetch: async () => { throw Error('offline'); } });
  let promise;
  handlers.install({ waitUntil: (p) => { promise = p; } }); await promise;
  for (const file of ['index.html', 'manifest.webmanifest', 'models/skeletal.glb', 'models/visceral.glb', 'draco/draco_decoder.wasm', 'data/lexicon.json']) assert.ok(added.includes(`https://example.test/app/${file}`), file);
  assert.ok(added.some((url) => /assets\/index-.*\.js$/.test(url)));
  handlers.activate({ waitUntil: (p) => { promise = p; } }); await promise; assert.ok(claimed);
  handlers.fetch({ request: { method: 'GET', url: 'https://example.test/app/?view=abc', mode: 'navigate' }, respondWith: (p) => { promise = p; } });
  assert.equal(await promise, 'offline-html');
});

test('çok parçalı ve ortak mesh kullanan düğümlerde özgün anatomi adı korunur', async () => {
  const { atlasNodeName, parseAtlasName } = await import('../src/atlasNames.js');
  const scene = { parent: null, userData: {} };
  const parent = { parent: scene, userData: { name: 'Nucleus pulposus C3-C4.l' } };
  const primitive = { parent, userData: {}, name: 'Nucleus_pulposus_primitive_1' };
  // Üç.js klonları yanlış/ortak association taşısa bile düğümün adı öncelikli.
  const parser = { associations: new Map([[primitive, { nodes: 0 }], [parent, { nodes: 0 }]]), json: { nodes: [{ name: 'Nucleus pulposus C7-T1.r' }] } };
  assert.deepEqual(parseAtlasName(atlasNodeName(primitive, scene, parser)), { base: 'Nucleus pulposus C3-C4', side: 'l' });
  assert.deepEqual(parseAtlasName('Biceps brachii.r'), { base: 'Biceps brachii', side: 'r' });
  assert.deepEqual(parseAtlasName('Diaphragm'), { base: 'Diaphragm', side: null });
  const unnamed = { parent: scene, userData: {} };
  parser.associations.set(unnamed, { nodes: 0 });
  assert.equal(atlasNodeName(unnamed, scene, parser), 'Nucleus pulposus C7-T1.r');
});

test('izolasyon yalnızca açık katmanları soldurur ve seçimi görünür yapar', async () => {
  const { targetOpacity } = await import('../src/visibility.js');
  const systems = { muscle: 1, organ: 0, bone: 0.2 };
  const state = { isolate: 'heart', override: null };
  assert.equal(targetOpacity('heart', 'organ', state, systems), 1);
  assert.equal(targetOpacity('lung', 'organ', state, systems), 0);
  assert.equal(targetOpacity('biceps', 'muscle', state, systems), 0.07);
  assert.equal(targetOpacity('femur', 'bone', state, systems), 0.07);
  state.override = new Map([['biceps', 0.03]]);
  assert.equal(targetOpacity('biceps', 'muscle', state, systems), 0.03);
  assert.equal(targetOpacity('femur', 'bone', state, systems), 0);
  state.isolate = null;
  assert.equal(targetOpacity('biceps', 'muscle', state, systems), 0.03);
});

test('seçim önbelleği gizli parçaları ve gizli ebeveynlerini atlar, geçersizleştirilince güncellenir', async () => {
  const { createVisiblePickCache } = await import('../src/visibility.js');
  const root = { visible: true, parent: null };
  const group = { visible: true, parent: root };
  const a = { visible: true, parent: group }, b = { visible: false, parent: root };
  const cache = createVisiblePickCache([a, b]);
  const first = cache.get();
  assert.deepEqual(first, [a]);
  assert.equal(cache.get(), first);
  b.visible = true; group.visible = false; cache.invalidate();
  assert.deepEqual(cache.get(), [b]);
  root.visible = false; cache.invalidate();
  assert.deepEqual(cache.get(), []);
});

test('atlas materyalleri kası iyileştirir ve diğer anatomik renkleri korur', async () => {
  const THREE = await import('three');
  const { makeAnatomyMaterial } = await import('../src/anatomyMaterials.js');
  const source = new THREE.MeshStandardMaterial({ name: 'Internal rotator', color: '#a43e32', side: THREE.DoubleSide, opacity: .8, transparent: true });
  const muscle = makeAnatomyMaterial(source, 'muscle');
  assert.equal(muscle.isMeshPhysicalMaterial, true);
  assert.equal(muscle.userData.anatomyTissue, 'muscle');
  assert.equal(muscle.side, THREE.DoubleSide);
  assert.equal(muscle.opacity, .8);
  assert.equal(muscle.transparent, true);
  assert.equal(muscle.customProgramCacheKey(), 'anatomy-tissue-variation-v1');
  const shader = { vertexShader: '#include <common>\n#include <begin_vertex>', fragmentShader: '#include <common>\n#include <color_fragment>' };
  muscle.onBeforeCompile(shader);
  assert.match(shader.vertexShader, /vTissuePosition/);
  assert.match(shader.fragmentShader, /tissueDetail/);
  const artery = new THREE.MeshStandardMaterial({ name: 'Artery', color: '#d22d32' });
  const vessel = makeAnatomyMaterial(artery, 'vessel');
  assert.equal(vessel.color.getHexString(), artery.color.getHexString());
  assert.equal(vessel.userData.anatomyTissue, 'original');
  const tendon = new THREE.MeshStandardMaterial({ name: 'Tendon', color: '#f0dacc' });
  assert.equal(makeAnatomyMaterial(tendon, 'muscle').color.getHexString(), tendon.color.getHexString());
});

test('proje sahibi görünür; veri kaynağı ve zorunlu atıflar kaynaklar bölümünde korunur', () => {
  const html = readFileSync('index.html', 'utf8');
  const [mainPage, credits] = html.split('<!-- KAYNAKLAR -->');
  assert.match(mainPage, /Muhammet TUĞRUL/);
  assert.match(mainPage, /MUHAMMET TUĞRUL \/ ATLAS/);
  assert.doesNotMatch(mainPage, /Z-Anatomy|BodyParts3D|nqwrc/i);
  assert.match(credits, /Muhammet TUĞRUL/);
  assert.match(credits, /Z-Anatomy/);
  assert.match(credits, /BodyParts3D/);
  assert.match(credits, /University of Washington/);
  assert.match(credits, /University of Dundee/);
  assert.match(credits, /lissiecowley/);
  const manifest = JSON.parse(readFileSync('public/manifest.webmanifest', 'utf8'));
  assert.match(manifest.description, /Muhammet TUĞRUL/);
  assert.doesNotMatch(manifest.description, /Z-Anatomy/i);
  assert.match(readFileSync('README.md', 'utf8'), /Muhammet TUĞRUL/);
});


test('yalnızca gerçek atlas kullanılır; yükleme hatasında yeniden deneme sunulur', () => {
  const main = readFileSync('src/main.js', 'utf8');
  const html = readFileSync('index.html', 'utf8');
  assert.doesNotMatch(main, /buildBody|setMode\(|from ['"]\.\/body\.js/);
  assert.doesNotMatch(html, /modeSeg|Stilize Model|id="vitals"/);
  assert.match(main, /data\.mode === 'proc'/); // eski bağlantıyı yanlış modele uygulama
  assert.match(main, /Atlas yüklenemedi/);
  assert.match(main, /introRetry.*classList\.remove\('hidden'\)/);
  assert.match(html, /id="introRetry"/);
});


test('uygulama adı başlıkta, arayüzde ve kurulum manifestinde aynıdır', () => {
  const html = readFileSync('index.html', 'utf8');
  const manifest = JSON.parse(readFileSync('public/manifest.webmanifest', 'utf8'));
  assert.match(html, /<title>TUĞRUL ATLAS/);
  assert.equal((html.match(/TUĞRUL <span>ATLAS<\/span>/g) || []).length, 2);
  assert.equal(manifest.short_name, 'TUĞRUL ATLAS');
  assert.match(manifest.name, /^TUĞRUL ATLAS/);
  assert.doesNotMatch(html, /CORPUS·3D/);
});


test('marka simgesi sitede, açılışta ve kurulumda kullanılır', () => {
  const html = readFileSync('index.html', 'utf8');
  const manifest = JSON.parse(readFileSync('public/manifest.webmanifest', 'utf8'));
  assert.match(html, /rel="icon" type="image\/png" href="icons\/icon-192\.png"/);
  assert.equal((html.match(/src="icons\/atlas-emblem\.png"/g) || []).length, 2);
  assert.equal(readFileSync('public/icons/atlas-emblem.png').toString('hex', 0, 8), '89504e470d0a1a0a');
  assert.match(html, /amblemde aynı veri kümesinden kafatası görüntüsü/);
  for (const icon of manifest.icons) {
    const png = readFileSync(`public/${icon.src}`);
    assert.equal(png.toString('hex', 0, 8), '89504e470d0a1a0a');
    const [width, height] = icon.sizes.split('x').map(Number);
    assert.equal(png.readUInt32BE(16), width);
    assert.equal(png.readUInt32BE(20), height);
  }
  assert.ok(manifest.icons.some((icon) => icon.purpose === 'maskable' && icon.src === 'icons/icon-maskable-512.png'));
});
