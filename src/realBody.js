// CORPUS·3D — Z-Anatomy gerçek anatomik model yükleyici
// Kaynak: github.com/nqwrc/3d-anatomy (Z-Anatomy glTF çıktısı, Draco sıkıştırmalı)
// Lisans: CC BY-NC-SA 4.0 (bkz. public/models/License.txt ve ATTRIBUTION.md)
//
// Her sistem dosyası yüklenir; her ağ (mesh) bir "part", sağ/sol çiftleri tek
// "structure" olur. Material'ler yapı bazında seçim/opacity için klonlanır.

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { INFO } from './data.js';
import { mapToInfo, turkishName } from './trmap.js';
import { atlasNodeName, parseAtlasName } from './atlasNames.js';
import { makeAnatomyMaterial } from './anatomyMaterials.js';

export const REAL_SYS_ORDER = ['bone', 'joint', 'muscle', 'organ', 'vessel', 'lymph', 'nerve'];
const FILES = [
  ['skeletal', 'bone'], ['joints', 'joint'], ['muscular', 'muscle'],
  ['visceral', 'organ'], ['cardiovascular', 'vessel'], ['lymphatic', 'lymph'], ['nervous', 'nerve'],
];
const SYS_FACTOR = { bone: .85, joint: .95, muscle: 1.4, organ: 1.1, vessel: .95, lymph: 1.0, nerve: 1.2 };
const BASE = import.meta.env.BASE_URL || '/';

function cleanDef(text) {
  if (!text) return { def: '', wiki: '' };
  let wiki = '';
  const m = text.match(/https?:\/\/[^\s)]+/);
  if (m) { wiki = m[0]; text = text.replace(m[0], ' '); }
  let def = text
    .replace(/===?\s*([^=]+?)===?/g, ' — ')
    .replace(/\[\[([^\]|]+)(\|[^\]]+)?\]\]/g, '$1')
    .replace(/\s+/g, ' ').trim();
  if (def.length > 640) {
    const cut = def.lastIndexOf('. ', 620);
    def = def.slice(0, cut > 200 ? cut + 1 : 620) + ' …';
  }
  return { def, wiki };
}

export async function loadRealBody({ onProgress = () => {} } = {}) {
  const draco = new DRACOLoader();
  draco.setDecoderPath(BASE + 'draco/');
  draco.setDecoderConfig({ type: 'wasm' });
  const loader = new GLTFLoader();
  loader.setDRACOLoader(draco);

  const totalSteps = FILES.length + 2;
  let done = 0;
  const step = (label) => onProgress(++done / totalSteps, label);

  const [defsJson, lexJson] = await Promise.all([
    fetch(BASE + 'data/definitions.json').then((r) => r.json()),
    fetch(BASE + 'data/lexicon.json').then((r) => r.json()),
  ]);
  step('Tanımlar yüklendi…'); step('Latince sözlük yüklendi…');

  const root = new THREE.Group();
  root.name = 'z-anatomy';
  const parts = [], structures = new Map(), pickMeshes = [];
  const sysGroups = {};

  const loaded = await Promise.all(FILES.map(async ([file, sys]) => {
    const gltf = await loader.loadAsync(BASE + 'models/' + file + '.glb');
    step(file + '.glb yüklendi…');
    return [sys, gltf.scene, gltf.parser];
  }));

  for (const [sys, scene] of loaded) {
    const g = new THREE.Group();
    g.name = 'sys-' + sys;
    g.add(scene);
    sysGroups[sys] = g;
    root.add(g);
  }

  // model boyutlandırma: iskelet kutusuna göre 10.05 sahne birimine ölçekle
  root.updateMatrixWorld(true);
  const skelBox = new THREE.Box3().setFromObject(sysGroups.bone);
  const size = skelBox.getSize(new THREE.Vector3());
  const center = skelBox.getCenter(new THREE.Vector3());
  const S = 10.05 / size.y;
  root.scale.setScalar(S);
  root.position.set(-center.x * S, -skelBox.min.y * S + .03, -center.z * S);
  root.updateMatrixWorld(true);

  const _wp = new THREE.Vector3(), _pq = new THREE.Quaternion(), _ps = new THREE.Vector3();
  for (const [sys, scene, parser] of loaded) {
    const meshes = [];
    scene.traverse((o) => { if (o.isMesh) meshes.push(o); });
    for (const mesh of meshes) {
      const { base, side } = parseAtlasName(atlasNodeName(mesh, scene, parser));
      if (!base) continue;
      // Z-Anatomy bazı kasları örten fasya yüzeylerini aynı GLB'ye koyar.
      const isFascia = sys === 'muscle' && /^fascia(?:_\d+)?$/i.test(mesh.material.name || '');
      mesh.material = makeAnatomyMaterial(mesh.material, sys);
      mesh.material.userData.baseOpacity = 1;
      mesh.castShadow = false; mesh.receiveShadow = false;
      mesh.userData.sid = base; mesh.userData.system = sys; mesh.userData.side = side;
      // explode yönü: dünya uzayı radyal -> ebeveyn uzayına çevir
      mesh.getWorldPosition(_wp);
      let dir = new THREE.Vector3(_wp.x, 0, _wp.z);
      if (dir.length() < .18) dir = new THREE.Vector3(0, 0, 1); else dir.normalize();
      if (mesh.parent) {
        mesh.parent.getWorldQuaternion(_pq).invert();
        dir = dir.applyQuaternion(_pq).normalize();
        mesh.parent.getWorldScale(_ps);
      }
      const parentScale = Math.max(_ps.x || S, .0001);
      const part = {
        id: base, system: sys, group: mesh, isFascia,
        mats: [mesh.material], meshes: [mesh],
        home: mesh.position.clone(), dir,
        factor: (SYS_FACTOR[sys] ?? 1) / parentScale,
      };
      parts.push(part);
      pickMeshes.push(mesh);
      if (!structures.has(base)) structures.set(base, { id: base, system: sys, parts: [] });
      structures.get(base).parts.push(part);
    }
  }

  // bilgi veritabanı: Türkçe eşleşme > Türkçe isim > İngilizce + tanım
  const db = {};
  for (const [base, st] of structures) {
    const infoId = mapToInfo(base);
    const info = infoId ? INFO[infoId] : null;
    const trName = turkishName(base, st.system);
    const lex = lexJson[base] || lexJson[`(${base})`] || null;
    const { def, wiki } = cleanDef(defsJson[base] || defsJson[`(${base})`] || '');
    db[base] = {
      name: trName || (info ? info.name : base),
      latin: (lex && lex.la) || (info ? info.latin : ''),
      system: st.system,
      desc: info ? info.desc : def,
      funcs: info ? info.funcs : [],
      clinic: info ? info.clinic : '',
      fact: info ? info.fact : '',
      en: base, def: info ? def : '', wiki,
      infoId, tr: !!(infoId || trName),
    };
  }

  // atan kalp nabzı için kalbe ait malzemeler (infoId==='heart' parçaları)

  draco.dispose();
  return {
    root, parts, structures, pickMeshes, flows: [], db,
    ids: [...structures.keys()],
    meta: { meshCount: parts.length, entryCount: structures.size, scale: S },
  };
}
