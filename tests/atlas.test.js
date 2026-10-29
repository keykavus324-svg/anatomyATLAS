import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { INFO } from '../src/data.js';
import { TOURS } from '../src/tours.js';
import { mapToInfo } from '../src/trmap.js';
import { buildBody } from '../src/body.js';

// CanvasTexture için yalnızca çizim API'si gereklidir; WebGL ortamı gerekmez.
const ctx = new Proxy({}, { get: (_obj, key) => key === 'createRadialGradient' ? () => ({ addColorStop() {} }) : () => {}, set: () => true });
globalThis.document = { createElement: () => ({ getContext: () => ctx }) };
const proc = buildBody();
const data = JSON.parse(readFileSync('public/data/systems.json', 'utf8'));
const names = [...new Set(Object.values(data).flat().map((name) => name.replace(/\.[lr]$/, '')))];

test('tüm ders adımları iki modelde çözülür veya gerçek modele özel işaretlenir', () => {
  assert.equal(TOURS.length, 8);
  for (const tour of TOURS) for (const step of tour.steps) {
    assert.ok(INFO[step.info], `${tour.id}: bilgi anahtarı ${step.info}`);
    if (!step.realOnly) assert.ok(proc.structures.has(step.info), `${tour.id}: stilize ${step.info}`);
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
