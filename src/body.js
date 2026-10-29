// CORPUS·3D — Prosedürel insan vücudu üretimi (Three.js)
// Her anatomik yapı ayrı, tıklanabilir bir "part" olarak kayıt altına alınır.
// Vücut sol tarafı +X (anatomik pozisyon), ön yüz +Z, yükseklik 0..10 birim.

import * as THREE from 'three';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const lerpV = (a, b, t) => a.clone().lerp(b, t);
const SIDES = [1, -1]; // +1 = vücudun solu, -1 = sağı

export function buildBody() {
  const body = new THREE.Group();
  body.name = 'human-body';
  const parts = [];              // {id, system, group, home, dir, factor, mats, meshes}
  const structures = new Map();  // id -> {id, system, parts[]}
  const pickMeshes = [];
  const flows = [];              // kan akışı / sinir impulsu parçacıkları
  const animated = { heart: null, lungs: [], diaphragm: null };

  /* ---------- prosedürel dokular ---------- */
  function makeTex(draw, size = 256) {
    const c = document.createElement('canvas'); c.width = c.height = size;
    draw(c.getContext('2d'), size);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  const muscleTex = makeTex((g, s) => {
    g.fillStyle = '#cfcfcf'; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 220; i++) {
      const x = Math.random() * s, w = 1 + Math.random() * 3, l = 170 + Math.random() * 85;
      g.strokeStyle = `rgb(${l},${l},${l})`; g.lineWidth = w;
      g.beginPath(); g.moveTo(x, -10);
      g.bezierCurveTo(x + 6, s * .33, x - 6, s * .66, x + 3, s + 10); g.stroke();
    }
  });
  const boneTex = makeTex((g, s) => {
    g.fillStyle = '#d9d9d9'; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 2600; i++) {
      const l = 190 + Math.random() * 65;
      g.fillStyle = `rgb(${l},${l},${l})`;
      g.fillRect(Math.random() * s, Math.random() * s, 2, 2);
    }
  });
  const speckleTex = makeTex((g, s) => {
    g.fillStyle = '#c9c9c9'; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 900; i++) {
      const l = 150 + Math.random() * 105;
      g.fillStyle = `rgb(${l},${l},${l})`;
      g.beginPath(); g.arc(Math.random() * s, Math.random() * s, 1 + Math.random() * 4, 0, 7); g.fill();
    }
  });
  const ringsTex = makeTex((g, s) => {
    g.fillStyle = '#c4c4c4'; g.fillRect(0, 0, s, s);
    g.fillStyle = '#f2f2f2';
    for (let y = 0; y < s; y += 22) g.fillRect(0, y, s, 11);
  });
  const stripesTex = makeTex((g, s) => {
    g.fillStyle = '#d2d2d2'; g.fillRect(0, 0, s, s);
    g.fillStyle = '#a8a8a8';
    for (let y = 0; y < s; y += 7) g.fillRect(0, y, s, 2);
  });

  /* ---------- malzeme fabrikaları ---------- */
  function mat(color, rough = .55, o = {}) {
    const m = new THREE.MeshPhysicalMaterial({
      color, roughness: rough, metalness: 0.02,
      clearcoat: o.clearcoat ?? 0, clearcoatRoughness: .45,
      map: o.map || null, bumpMap: o.bump || o.map || null, bumpScale: o.bumpScale ?? (o.map ? .6 : 0),
      emissive: o.emissive ?? 0x000000, emissiveIntensity: o.emissiveIntensity ?? 1,
      side: o.side || THREE.FrontSide,
      sheen: o.sheen ?? 0, sheenColor: new THREE.Color(0xffd9b0),
    });
    m.userData.baseOpacity = o.opacity ?? 1;
    if (o.opacity !== undefined && o.opacity < 1) { m.transparent = true; m.opacity = o.opacity; }
    return m;
  }
  const skinMat   = () => mat(0xdaa57f, .58, { clearcoat: .18, sheen: .35, bump: speckleTex, bumpScale: .12 });
  const hairMat   = () => mat(0x2e2119, .85, { side: THREE.DoubleSide });
  const boneMat   = () => mat(0xe9dfc6, .48, { map: boneTex, bumpScale: .25 });
  const teethMat  = () => mat(0xf5efdd, .3, { clearcoat: .4 });
  const darkMat   = () => mat(0x0b0b0e, .9);
  const muscleMat = (c = 0xb02a30) => mat(c, .58, { map: muscleTex, bumpScale: .8, clearcoat: .12 });
  const tendonMat = () => mat(0xe6dcc4, .5);
  const nerveMat  = () => mat(0xf0bd3c, .42, { emissive: 0x7a5000, emissiveIntensity: .45, clearcoat: .3 });
  const artMat    = () => mat(0xc81f2e, .34, { clearcoat: .5, emissive: 0x4a0208, emissiveIntensity: .6 });
  const veinMat   = () => mat(0x2a56c9, .38, { clearcoat: .5, emissive: 0x061a4d, emissiveIntensity: .6 });

  /* ---------- kayıt sistemi ---------- */
  const SYS_FACTOR = { skin: 2.0, muscle: 1.45, bone: .85, organ: 1.1, vessel: .95, nerve: 1.25 };
  function register(id, system, group, opts = {}) {
    const mats = new Set(), meshes = [];
    group.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true; o.receiveShadow = false;
        o.userData.sid = id; o.userData.system = system;
        meshes.push(o); pickMeshes.push(o);
        (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => mats.add(m));
      }
    });
    body.add(group);
    // patlama (explode) yönü: vücut ekseninden dışarı
    const c = new THREE.Box3().setFromObject(group).getCenter(new THREE.Vector3());
    let dir = opts.dir ? opts.dir.clone() : V(c.x, 0, c.z);
    if (dir.length() < .15) dir = opts.fallbackDir ? opts.fallbackDir.clone() : V(0, 0, 1);
    dir.normalize();
    if (opts.dirUp) dir.y += opts.dirUp, dir.normalize();
    const part = {
      id, system, group, mats: [...mats], meshes,
      home: group.position.clone(), dir,
      factor: opts.factor ?? SYS_FACTOR[system] ?? 1,
    };
    parts.push(part);
    if (!structures.has(id)) structures.set(id, { id, system, parts: [] });
    structures.get(id).parts.push(part);
    return part;
  }

  /* ---------- geometri yardımcıları ---------- */
  function grp(x = 0, y = 0, z = 0) { const g = new THREE.Group(); g.position.set(x, y, z); return g; }
  function sph(rx, ry, rz, m, x = 0, y = 0, z = 0) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 20), m);
    mesh.scale.set(rx, ry, rz); mesh.position.set(x, y, z); return mesh;
  }
  function box(w, h, d, m, x = 0, y = 0, z = 0) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.position.set(x, y, z); return mesh;
  }
  function orient(g, a, b) {
    const dir = b.clone().sub(a); const len = dir.length();
    g.position.copy(lerpV(a, b, .5));
    g.quaternion.setFromUnitVectors(V(0, 1, 0), dir.normalize());
    return len;
  }
  // iki nokta arası konik uzuv (deri için)
  function limb(a, b, r1, r2, m) {
    const g = new THREE.Group(); const len = orient(g, a, b);
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(r2, r1, len, 22), m); g.add(cyl);
    g.add(sph(r1, r1 * .92, r1, m, 0, -len / 2, 0));
    g.add(sph(r2, r2 * .92, r2, m, 0, len / 2, 0));
    return g;
  }
  // klasik kemik: ince gövde + şişkin uçlar
  function bone(a, b, r, m) {
    const g = new THREE.Group(); const len = orient(g, a, b);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(r * .62, r * .68, len * .94, 16), m); g.add(shaft);
    g.add(sph(r * 1.08, r * 1.12, r * 1.08, m, 0, -len / 2, 0));
    g.add(sph(r * .98, r * 1.05, r * .98, m, 0, len / 2, 0));
    return g;
  }
  // iğ biçimli kas (lathe profili)
  function muscle(a, b, R, m, flat = .84) {
    const g = new THREE.Group(); const len = orient(g, a, b);
    const pts = [];
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      const rad = Math.max(.012, R * Math.pow(Math.sin(Math.PI * t), .62));
      pts.push(new THREE.Vector2(rad, -len / 2 + t * len));
    }
    const mesh = new THREE.Mesh(new THREE.LatheGeometry(pts, 20), m);
    mesh.scale.z = flat; g.add(mesh);
    return g;
  }
  // eğri boyunca boru (damar, sinir, bağırsak...)
  function tube(pts, r, m, radial = 10) {
    const curve = new THREE.CatmullRomCurve3(pts);
    const c = pts.reduce((acc, p) => acc.add(p), V(0, 0, 0)).multiplyScalar(1 / pts.length);
    const geo = new THREE.TubeGeometry(curve, Math.max(16, pts.length * 8), r, radial, false);
    geo.translate(-c.x, -c.y, -c.z);
    const g = grp(c.x, c.y, c.z);
    g.add(new THREE.Mesh(geo, m));
    const localCurve = new THREE.CatmullRomCurve3(pts.map((p) => p.clone().sub(c)));
    return { group: g, curve: localCurve, length: curve.getLength() };
  }
  function latheTorso(profile, m, zScale) {
    const pts = profile.map(([y, r]) => new THREE.Vector2(r, y));
    const mesh = new THREE.Mesh(new THREE.LatheGeometry(pts, 36), m);
    mesh.scale.z = zScale;
    const g = grp(0, 0, 0); g.add(mesh); return g;
  }
  function deform(geo, fn) {
    const pos = geo.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i); fn(v, i);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals(); return geo;
  }
  function addFlow(res, sid, system, { color = 0xff5566, count = 10, speed = .16, size = .085, type = 'blood', reverse = false } = {}) {
    const geo = new THREE.BufferGeometry();
    const arr = new Float32Array(count * 3);
    geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    const material = new THREE.PointsMaterial({
      color, size, sizeAttenuation: true, transparent: true, opacity: .95,
      depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(geo, material);
    points.frustumCulled = false;
    res.group.add(points);
    flows.push({ sid, system, points, curve: res.curve, speed, type, reverse, mat: material, offsets: Array.from({ length: count }, (_, i) => i / count), count });
  }

  /* ---------- eklem tanımları ---------- */
  const J = {
    hip: (s) => V(.52 * s, 5.02, 0), knee: (s) => V(.58 * s, 2.62, .02), ankle: (s) => V(.60 * s, .48, 0),
    shoulder: (s) => V(1.12 * s, 8.32, 0), elbow: (s) => V(1.42 * s, 6.75, .05), wrist: (s) => V(1.63 * s, 5.48, .10),
  };

  /* ---------- el & ayak üreticileri ---------- */
  function buildHand(s, m, boneMode = false) {
    const w = J.wrist(s), e = J.elbow(s);
    const g = grp(w.x, w.y, w.z);
    const down = w.clone().sub(e).normalize();           // parmak yönü
    const yA = down.clone().negate();
    let zA = V(0, 0, 1).addScaledVector(yA, -yA.z).normalize();
    if (zA.lengthSq() < .1) zA = V(0, 0, 1);
    const xA = new THREE.Vector3().crossVectors(yA, zA).normalize();
    zA = new THREE.Vector3().crossVectors(xA, yA).normalize();
    g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(xA, yA, zA));
    const palmT = boneMode ? .055 : .085;
    g.add(sph(.20, .29, palmT, m, 0, -.25, 0));
    const thumbS = s;
    const fingerX = [-.135, -.045, .045, .135];
    const lens = { '-1': [.24, .33, .37, .34], '1': [.34, .37, .33, .24] };
    fingerX.forEach((fx, i) => {
      const L = lens[String(thumbS)][i] * (boneMode ? .95 : 1.05);
      const r = boneMode ? .033 : .045;
      if (boneMode) {
        for (let k = 0; k < 3; k++) g.add(sph(r, r * 1.7, r, m, fx, -.54 - k * (L / 3) - L / 6, 0));
      } else {
        const cap = new THREE.Mesh(new THREE.CapsuleGeometry(r, L, 4, 10), m);
        cap.position.set(fx, -.54 - L / 2, 0); g.add(cap);
      }
    });
    const thumb = new THREE.Mesh(new THREE.CapsuleGeometry(boneMode ? .038 : .05, .20, 4, 10), m);
    thumb.position.set(thumbS * .21, -.34, .05); thumb.rotation.z = thumbS * .75; thumb.rotation.x = -.25;
    g.add(thumb);
    return g;
  }
  function buildFoot(s, m, boneMode = false) {
    const a = J.ankle(s);
    const g = grp(a.x, .27, .04);
    const k = boneMode ? .9 : 1.05;
    g.add(sph(.16 * k, .15 * k, .19 * k, m, 0, -.06, -.13));            // topuk
    g.add(sph(.185 * k, .115 * k, .37 * k, m, 0, -.13, .17));           // orta ayak
    for (let i = 0; i < 5; i++) {
      const x = -s * .135 + s * i * .072;
      const rr = (i === 0 ? .052 : .04) * k;
      const toe = new THREE.Mesh(new THREE.CapsuleGeometry(rr, .09, 3, 8), m);
      toe.rotation.x = Math.PI / 2; toe.position.set(x, -.19, .52 + (i === 0 ? .03 : 0));
      g.add(toe);
    }
    return g;
  }

  /* ================= DERİ ================= */
  {
    const torso = latheTorso([[4.52, .74], [4.8, .95], [5.25, .99], [5.75, .81], [6.35, .89], [7.0, 1.03], [7.7, 1.05], [8.25, .93], [8.5, .56], [8.66, .30]], skinMat(), .74);
    register('skin', 'skin', torso, { factor: .25 });
    const pelvisBase = grp(0, 4.62, 0); pelvisBase.add(sph(.64, .42, .5, skinMat()));
    register('skin', 'skin', pelvisBase, { factor: .4 });
    register('skin', 'skin', limb(V(0, 8.32, 0), V(0, 9.05, 0), .30, .27, skinMat()), { factor: .6, dirUp: .6 });
    const head = grp(0, 9.42, .02);
    const sm = skinMat();
    head.add(sph(.52, .62, .56, sm));
    head.add(sph(.40, .36, .42, sm, 0, -.34, .07));
    const nose = new THREE.Mesh(new THREE.ConeGeometry(.065, .17, 12), sm);
    nose.position.set(0, -.10, .55); nose.rotation.x = 1.95; head.add(nose);
    head.add(sph(.055, .12, .09, sm, .52, -.06, 0)); head.add(sph(.055, .12, .09, sm, -.52, -.06, 0));
    const hair = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 18, 0, Math.PI * 2, 0, Math.PI * .58), hairMat());
    hair.scale.set(.55, .65, .59); hair.position.set(0, .04, -.04); hair.rotation.x = -.28; head.add(hair);
    register('skin', 'skin', head, { dirUp: 1 });
    for (const s of SIDES) {
      register('skin', 'skin', limb(J.shoulder(s), J.elbow(s), .355, .26, skinMat()));
      register('skin', 'skin', limb(J.elbow(s), J.wrist(s), .26, .185, skinMat()));
      register('skin', 'skin', buildHand(s, skinMat()));
      register('skin', 'skin', limb(J.hip(s), J.knee(s), .52, .335, skinMat()));
      register('skin', 'skin', limb(J.knee(s), J.ankle(s), .335, .20, skinMat()));
      register('skin', 'skin', buildFoot(s, skinMat()));
    }
  }

  /* ================= KASLAR ================= */
  {
    const core = latheTorso([[4.58, .70], [4.85, .89], [5.3, .92], [5.75, .75], [6.35, .85], [7.0, .97], [7.7, .99], [8.2, .87], [8.45, .5], [8.6, .27]], muscleMat(0x9c252b), .72);
    register('obliques', 'muscle', core, { factor: .2 });
    const pelvMuscle = grp(0, 4.72, -.02); pelvMuscle.add(sph(.6, .44, .46, muscleMat(0x9c252b)));
    register('gluteus', 'muscle', pelvMuscle, { factor: .5 });

    const mHead = grp(0, 9.42, .02); const hm = muscleMat(0x98272c);
    mHead.add(sph(.48, .56, .52, hm));
    mHead.add(sph(.36, .30, .38, hm, 0, -.34, .07));
    mHead.add(sph(.13, .19, .10, muscleMat(0xb02a30), .33, -.28, .2));
    mHead.add(sph(.13, .19, .10, muscleMat(0xb02a30), -.33, -.28, .2));
    register('masseter', 'muscle', mHead, { dirUp: 1 });

    for (const s of SIDES) {
      register('sternocleidomastoid', 'muscle', muscle(V(.40 * s, 9.3, -.1), V(.12 * s, 8.48, .36), .095, muscleMat()));
      const pec = grp(.50 * s, 7.55, .52);
      const pm = sph(.56, .41, .17, muscleMat()); pm.rotation.z = -.3 * s; pm.rotation.y = .18 * s; pec.add(pm);
      register('pectoralis', 'muscle', pec);
      const obl = grp(.73 * s, 5.95, .10);
      const om = sph(.19, .53, .30, muscleMat()); om.rotation.z = .18 * s; obl.add(om);
      register('obliques', 'muscle', obl);
      const delt = grp(1.2 * s, 8.28, 0); delt.add(sph(.41, .47, .41, muscleMat()));
      register('deltoid', 'muscle', delt);
      const sh = J.shoulder(s), el = J.elbow(s), wr = J.wrist(s);
      register('biceps', 'muscle', muscle(lerpV(sh, el, .1).add(V(0, 0, .15)), lerpV(sh, el, .94).add(V(0, 0, .10)), .265, muscleMat()));
      register('triceps', 'muscle', muscle(lerpV(sh, el, .06).add(V(0, 0, -.16)), lerpV(sh, el, .96).add(V(0, 0, -.10)), .285, muscleMat()));
      const fore = grp(); fore.add(muscle(lerpV(el, wr, .04), lerpV(el, wr, .96), .235, muscleMat()));
      fore.add(muscle(lerpV(el, wr, .1).add(V(.07 * s, 0, -.06)), lerpV(el, wr, .8).add(V(.05 * s, 0, -.04)), .16, muscleMat()));
      register('forearm', 'muscle', fore);
      const gl = grp(.46 * s, 4.98, -.42);
      const glm = sph(.47, .54, .30, muscleMat()); glm.rotation.x = .18; gl.add(glm);
      register('gluteus', 'muscle', gl);
      const hip = J.hip(s), knee = J.knee(s), ank = J.ankle(s);
      const quad = grp();
      quad.add(muscle(lerpV(hip, knee, .03).add(V(0, 0, .17)), lerpV(hip, knee, .96).add(V(0, 0, .13)), .40, muscleMat()));
      quad.add(muscle(lerpV(hip, knee, .08).add(V(.22 * s, 0, .05)), lerpV(hip, knee, .9).add(V(.16 * s, 0, .05)), .23, muscleMat()));
      quad.add(muscle(lerpV(hip, knee, .45).add(V(-.2 * s, 0, .07)), lerpV(hip, knee, .97).add(V(-.13 * s, 0, .07)), .21, muscleMat()));
      register('quadriceps', 'muscle', quad);
      const ham = grp();
      ham.add(muscle(lerpV(hip, knee, .05).add(V(0, 0, -.20)), lerpV(hip, knee, .95).add(V(0, 0, -.13)), .35, muscleMat()));
      ham.add(muscle(lerpV(hip, knee, .5).add(V(.13 * s, 0, -.22)), lerpV(hip, knee, .98).add(V(.13 * s, 0, -.14)), .165, muscleMat()));
      register('hamstrings', 'muscle', ham);
      register('sartorius', 'muscle', muscle(V(.86 * s, 5.42, .33), V(.30 * s, 2.88, .30), .085, muscleMat()));
      const calf = grp();
      calf.add(muscle(V(knee.x - .14, knee.y - .05, -.18), lerpV(knee, ank, .52).add(V(-.06, 0, -.14)), .205, muscleMat()));
      calf.add(muscle(V(knee.x + .14, knee.y - .05, -.18), lerpV(knee, ank, .52).add(V(.06, 0, -.14)), .205, muscleMat()));
      const ach = tube([lerpV(knee, ank, .5).add(V(0, 0, -.13)), V(ank.x, .62, -.16), V(ank.x, .3, -.2)], .055, tendonMat());
      calf.add(ach.group);
      register('gastrocnemius', 'muscle', calf);
      register('tibialis', 'muscle', muscle(lerpV(knee, ank, .08).add(V(.17 * s, 0, .12)), lerpV(knee, ank, .82).add(V(.12 * s, 0, .07)), .14, muscleMat()));
      const lat = grp(.50 * s, 6.72, -.46);
      const lm = sph(.47, .67, .135, muscleMat()); lm.rotation.z = .32 * s; lm.rotation.y = -.15 * s; lat.add(lm);
      register('latissimus', 'muscle', lat);
    }
    const abs = grp(); const am = muscleMat(0xbb3238);
    [6.58, 6.06, 5.54].forEach((y) => { abs.add(sph(.21, .23, .14, am, .215, y, .50)); abs.add(sph(.21, .23, .14, am, -.215, y, .50)); });
    register('rectus_abdominis', 'muscle', abs, { dir: V(0, 0, 1) });
    const trap = grp(0, 7.88, -.5);
    trap.add(sph(.86, .5, .15, muscleMat()));
    trap.add(sph(.48, .34, .13, muscleMat(), 0, .4, .02));
    register('trapezius', 'muscle', trap, { dir: V(0, 0, -1) });
  }

  /* ================= İSKELET ================= */
  {
    const cran = grp(0, 9.48, 0); const bm = boneMat();
    cran.add(sph(.50, .585, .55, bm));
    cran.add(sph(.36, .32, .35, bm, 0, -.30, .10));
    cran.add(sph(.085, .095, .06, darkMat(), .175, -.16, .46));
    cran.add(sph(.085, .095, .06, darkMat(), -.175, -.16, .46));
    const nasal = new THREE.Mesh(new THREE.ConeGeometry(.05, .12, 10), darkMat());
    nasal.position.set(0, -.33, .47); nasal.rotation.x = Math.PI / 2; cran.add(nasal);
    for (const s of SIDES) {
      const cheek = tube([V(.44 * s, -.04, .02), V(.48 * s, -.16, .26), V(.30 * s, -.3, .4)], .038, bm);
      cran.add(cheek.group);
    }
    cran.add(sph(.20, .055, .07, teethMat(), 0, -.53, .30));
    register('cranium', 'bone', cran, { dirUp: 1 });

    const mand = grp(0, 9.08, .04); const mm2 = boneMat();
    const uT = tube([V(-.34, .24, -.05), V(-.34, -.08, .1), V(-.22, -.21, .31), V(0, -.25, .39), V(.22, -.21, .31), V(.34, -.08, .1), V(.34, .24, -.05)], .062, mm2);
    mand.add(uT.group);
    mand.add(sph(.055, .21, .15, mm2, .34, .08, -.01)); mand.add(sph(.055, .21, .15, mm2, -.34, .08, -.01));
    mand.add(sph(.185, .05, .06, teethMat(), 0, -.12, .32));
    register('mandible', 'bone', mand, { dir: V(0, -.4, .8) });

    const vertebra = (id, y, z, r, h) => {
      const g = grp(0, y, z); const m = boneMat();
      const bodyC = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 14), m); g.add(bodyC);
      const spin = box(r * .34, r * .3, r * 1.0, m, 0, -r * .15, -r * 1.05); spin.rotation.x = -.35; g.add(spin);
      g.add(box(r * 1.7, r * .26, r * .3, m, 0, 0, -r * .45));
      register(id, 'bone', g, { dir: V(0, 0, -1), factor: .7 });
    };
    for (let i = 0; i < 7; i++) vertebra('cervical', 8.94 - i * .115, -.17 - .04 * Math.sin(i / 6 * Math.PI), .125, .095);
    for (let i = 0; i < 12; i++) vertebra('thoracic', 8.2 - i * .175, -.35 - .06 * Math.sin(i / 11 * Math.PI), .185, .14);
    for (let i = 0; i < 5; i++) vertebra('lumbar', 6.02 - i * .21, -.32 + i * .015, .25, .17);

    const sac = grp(0, 4.92, -.2);
    const sacM = new THREE.Mesh(new THREE.CylinderGeometry(.30, .05, .58, 4), boneMat());
    sacM.rotation.y = Math.PI / 4; sacM.scale.z = .48; sacM.rotation.x = .22; sac.add(sacM);
    sac.add(sph(.07, .1, .05, boneMat(), 0, -.36, -.02));
    register('sacrum', 'bone', sac, { dir: V(0, 0, -1) });

    const ster = grp(0, 7.52, .68); const stm = boneMat();
    ster.add(sph(.19, .15, .055, stm, 0, .48, 0));
    ster.add(sph(.115, .44, .05, stm, 0, -.02, 0));
    ster.add(sph(.045, .09, .03, stm, 0, -.55, 0));
    register('sternum', 'bone', ster, { dir: V(0, 0, 1) });

    for (let i = 0; i < 12; i++) {
      const y = 8.08 - i * .165;
      const R = .68 + Math.sin(i / 11 * Math.PI) * .36 - Math.max(0, i - 9) * .08;
      const g = grp(0, y, -.04);
      const rib = new THREE.Mesh(new THREE.TorusGeometry(R, .04, 8, 44), boneMat());
      rib.rotation.x = Math.PI / 2; rib.scale.set(1, .78, 1);
      g.add(rib); g.rotation.x = .1;
      register('ribs', 'bone', g, { dir: V(0, Math.sign(y - 7.15) || .3, 0), factor: .55 });
    }

    for (const s of SIDES) {
      const cl = tube([V(.08 * s, 8.3, .55), V(.45 * s, 8.37, .49), V(.75 * s, 8.3, .34), V(1.08 * s, 8.41, .16)], .052, boneMat());
      register('clavicle', 'bone', cl.group);
      const sc = grp(.58 * s, 7.72, -.55); const scm = boneMat();
      const scBody = sph(.38, .48, .055, scm); scBody.rotation.y = -.26 * s; scBody.rotation.z = .14 * s; sc.add(scBody);
      sc.add(box(.4, .045, .06, scm, 0, .3, -.04));
      register('scapula', 'bone', sc);
      const sh = J.shoulder(s), el = J.elbow(s), wr = J.wrist(s);
      const hum = grp(); hum.add(bone(sh, el, .16, boneMat()));
      hum.add(sph(.185, .185, .185, boneMat(), sh.x - .07 * s, sh.y + .04, 0));
      register('humerus', 'bone', hum);
      register('radius', 'bone', bone(el.clone().add(V(.10 * s, 0, .03)), wr.clone().add(V(.10 * s, 0, .05)), .082, boneMat()));
      register('ulna', 'bone', bone(el.clone().add(V(-.09 * s, .02, -.02)), wr.clone().add(V(-.07 * s, 0, -.01)), .09, boneMat()));
      register('hand_bones', 'bone', buildHand(s, boneMat(), true));
      const pel = grp(); const pm2 = boneMat();
      const il = grp(.56 * s, 5.28, -.02);
      const ilm = sph(.47, .51, .15, pm2); ilm.rotation.y = .3 * s; ilm.rotation.x = -.08; il.add(ilm); pel.add(il);
      const crest = tube([V(.18 * s, 5.66, -.28), V(.62 * s, 5.8, -.06), V(.9 * s, 5.56, .24)], .065, pm2); pel.add(crest.group);
      const loop = tube([V(.10 * s, 4.78, .38), V(.42 * s, 4.6, .26), V(.46 * s, 4.54, -.08), V(.3 * s, 4.8, -.28)], .082, pm2); pel.add(loop.group);
      pel.add(sph(.19, .19, .19, pm2, .52 * s, 5.02, 0));
      register('pelvis', 'bone', pel);
      const hip = J.hip(s), knee = J.knee(s), ank = J.ankle(s);
      const fem = grp(); const fm = boneMat();
      fem.add(bone(lerpV(hip, knee, .05), knee, .205, fm));
      fem.add(sph(.165, .165, .165, fm, .35 * s, 5.14, 0));
      fem.add(bone(V(.36 * s, 5.12, 0), V(.56 * s, 4.94, 0), .105, fm));
      fem.add(sph(.125, .15, .125, fm, .63 * s, 4.9, 0));
      register('femur', 'bone', fem);
      const pat = grp(knee.x, knee.y + .02, .29); pat.add(sph(.115, .13, .06, boneMat()));
      register('patella', 'bone', pat, { dir: V(0, 0, 1) });
      const tib = grp(); const tm = boneMat();
      tib.add(bone(knee, ank, .185, tm));
      tib.add(sph(.24, .11, .22, tm, knee.x, knee.y - .06, .01));
      tib.add(sph(.09, .11, .09, tm, ank.x - .11 * s, ank.y - .07, 0));
      register('tibia', 'bone', tib);
      register('fibula', 'bone', bone(V(knee.x + .2 * s, knee.y - .16, -.03), V(ank.x + .15 * s, ank.y - .03, 0), .068, boneMat()));
      register('foot_bones', 'bone', buildFoot(s, boneMat(), true));
    }
  }

  /* ================= SİNİR: beyin ve merkezi ================= */
  {
    const brainGeo = deform(new THREE.SphereGeometry(.5, 56, 40), (v) => {
      const n = v.clone().normalize();
      v.x *= 1.02; v.y *= .80; v.z *= 1.18;
      const d = .014 * Math.sin(15 * v.x + 6 * v.y) * Math.sin(13 * v.z - 4 * v.y) + .009 * Math.sin(26 * v.z + 9 * v.x);
      v.addScaledVector(n, d);
      if (v.y > 0) { const g = Math.exp(-Math.pow(v.x / .055, 2)); v.y -= .085 * g * Math.min(1, v.y / .35); }
      if (v.y < -.22) v.y = -.22 + (v.y + .22) * .35;
      if (v.z > 0) v.x *= 1 - .07 * (v.z / .59);
    });
    const br = grp(0, 9.54, -.03);
    br.add(new THREE.Mesh(brainGeo, mat(0xe2a48c, .5, { clearcoat: .35, bump: speckleTex, bumpScale: .3 })));
    register('brain', 'nerve', br, { dirUp: 1.2 });

    const cer = grp(0, 9.2, -.37);
    cer.add(sph(.33, .19, .21, mat(0xd99a83, .55, { map: stripesTex, bumpScale: .5 }), 0, 0, 0));
    register('cerebellum', 'nerve', cer, { dir: V(0, -.2, -1) });

    const bs = grp();
    const bst = tube([V(0, 9.34, -.12), V(0, 9.06, -.16), V(0, 8.8, -.18)], .082, mat(0xecc39d, .5));
    bs.add(bst.group); bs.add(sph(.125, .09, .11, mat(0xecc39d, .5), 0, 9.06, -.06));
    register('brainstem', 'nerve', bs, { dir: V(0, 0, -1) });

    const cord = grp(); const cm = nerveMat();
    const cordT = tube([V(0, 8.85, -.18), V(0, 8.2, -.34), V(0, 7.2, -.41), V(0, 6.2, -.35), V(0, 5.55, -.28)], .07, cm);
    cord.add(cordT.group);
    for (const xo of [-.05, 0, .05]) {
      const cq = tube([V(xo, 5.55, -.28), V(xo * 1.6, 5.1, -.26), V(xo * 2.2, 4.82, -.22)], .016, cm);
      cord.add(cq.group);
    }
    [8.3, 7.7, 7.1, 6.5, 5.95].forEach((y) => {
      for (const s of SIDES) {
        const root = tube([V(0, y, -.37), V(.3 * s, y - .06, -.3), V(.58 * s, y - .18, -.16)], .019, cm);
        cord.add(root.group);
      }
    });
    addFlow(cordT, 'spinal_cord', 'nerve', { color: 0xffe27a, count: 3, speed: .5, size: .13, type: 'nerve' });
    register('spinal_cord', 'nerve', cord, { dir: V(0, 0, -1), factor: .6 });

    for (const s of SIDES) {
      const pl = grp(); const nm = nerveMat();
      const p1 = tube([V(.18 * s, 8.58, -.02), V(.6 * s, 8.42, 0), V(1.05 * s, 8.22, .03), V(1.3 * s, 7.5, .1), V(1.47 * s, 6.6, .13), V(1.64 * s, 5.6, .15)], .03, nm);
      const p2 = tube([V(.16 * s, 8.5, -.06), V(.62 * s, 8.34, -.04), V(1.1 * s, 8.16, -.05), V(1.34 * s, 7.42, -.02), V(1.45 * s, 6.7, .02)], .024, nm);
      pl.add(p1.group, p2.group);
      addFlow(p1, 'brachial_plexus', 'nerve', { color: 0xffe27a, count: 2, speed: .45, size: .11, type: 'nerve' });
      register('brachial_plexus', 'nerve', pl);

      const sc = grp(); const nm2 = nerveMat();
      const s1 = tube([V(.28 * s, 4.95, -.28), V(.48 * s, 4.62, -.44), V(.55 * s, 3.9, -.33), V(.57 * s, 3.0, -.25), V(.57 * s, 2.55, -.2)], .048, nm2);
      const s2 = tube([V(.57 * s, 2.55, -.2), V(.67 * s, 1.7, -.08), V(.68 * s, .8, .02)], .026, nm2);
      const s3 = tube([V(.57 * s, 2.55, -.2), V(.5 * s, 1.6, -.18), V(.52 * s, .7, -.08)], .026, nm2);
      sc.add(s1.group, s2.group, s3.group);
      addFlow(s1, 'sciatic', 'nerve', { color: 0xffe27a, count: 2, speed: .4, size: .12, type: 'nerve' });
      register('sciatic', 'nerve', sc);

      const fnT = tube([V(.3 * s, 5.02, -.05), V(.42 * s, 4.72, .18), V(.46 * s, 4.0, .3), V(.48 * s, 3.2, .27)], .033, nerveMat());
      register('femoral_nerve', 'nerve', fnT.group);

      const eyeG = grp(.185 * s, 9.43, .4);
      eyeG.add(sph(.105, .105, .105, mat(0xf3efe6, .22, { clearcoat: .7 })));
      const iris = new THREE.Mesh(new THREE.CircleGeometry(.046, 20), mat(0x51371f, .3));
      iris.position.z = .102; eyeG.add(iris);
      const pupil = new THREE.Mesh(new THREE.CircleGeometry(.021, 16), darkMat());
      pupil.position.z = .105; eyeG.add(pupil);
      register('eye', 'organ', eyeG, { dir: V(0, 0, 1), factor: 1.4 });

      const opT = tube([V(.185 * s, 9.43, .31), V(.12 * s, 9.4, .13), V(0, 9.36, .02)], .027, nerveMat());
      register('optic_nerve', 'nerve', opT.group, { factor: .8 });
    }
  }

  /* ================= İÇ ORGANLAR ================= */
  {
    const thy = grp(); const thm = mat(0x9c4a38, .45, { clearcoat: .3 });
    thy.add(sph(.085, .155, .075, thm, .125, 8.6, .16));
    thy.add(sph(.085, .155, .075, thm, -.125, 8.6, .16));
    thy.add(tube([V(-.12, 8.56, .18), V(0, 8.54, .22), V(.12, 8.56, .18)], .038, thm).group);
    register('thyroid', 'organ', thy, { dir: V(0, 0, 1) });

    const tra = grp(); const trm = mat(0xd7b3a0, .5, { map: ringsTex, bumpScale: .7 });
    tra.add(tube([V(0, 8.78, .1), V(0, 8.25, .1), V(0, 7.78, .05)], .102, trm).group);
    for (const s of SIDES) tra.add(tube([V(0, 7.78, .05), V(.3 * s, 7.56, .02), V(.5 * s, 7.4, 0)], .058, trm).group);
    register('trachea', 'organ', tra, { factor: .7 });

    for (const s of SIDES) {
      const lungGeo = deform(new THREE.SphereGeometry(.62, 40, 30), (v) => {
        v.y *= 1.48; v.x *= .80 * (s === -1 ? 1.08 : .96); v.z *= .9;
        const ny = v.y / .92;
        if (ny > 0) { const f = 1 - .36 * ny * ny; v.x *= f; v.z *= f; }
        if (v.y < -.76) v.y = -.76 + (v.y + .76) * .3;
        const med = -s;
        if (v.x * med > .12 && Math.abs(v.y) < .5) v.x -= med * .06;
      });
      const lg = grp(.60 * s, 7.3, -.02);
      lg.add(new THREE.Mesh(lungGeo, mat(0xd97773, .72, { map: speckleTex, bumpScale: .7 })));
      animated.lungs.push({ group: lg, base: lg.scale.clone() });
      register('lungs', 'organ', lg);
    }

    const dia = grp(0, 6.04, -.02);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(1, 36, 18, 0, Math.PI * 2, 0, Math.PI * .48),
      mat(0xa52e33, .6, { map: muscleTex, side: THREE.DoubleSide, bumpScale: .4 }));
    dome.scale.set(1.02, .5, .78); dia.add(dome);
    animated.diaphragm = dia;
    register('diaphragm', 'organ', dia, { dir: V(0, -1, 0), factor: .6 });

    const eso = tube([V(0, 8.72, -.05), V(0, 7.9, -.14), V(.02, 7.0, -.17), V(.08, 6.35, .08)], .055, mat(0xd9a08c, .5));
    register('esophagus', 'organ', eso.group, { factor: .6 });

    const liverGeo = deform(new THREE.SphereGeometry(.6, 44, 30), (v) => {
      v.x *= 1.5; v.y *= .6; v.z *= .95;
      if (v.x > 0) { const t = Math.min(1, v.x / .9); v.y *= 1 - .5 * t; v.z *= 1 - .32 * t; }
      if (v.y < -.26) v.y = -.26 + (v.y + .26) * .4;
    });
    const liv = grp(-.2, 6.06, .08); liv.rotation.z = .07;
    liv.add(new THREE.Mesh(liverGeo, mat(0x7e2f22, .34, { clearcoat: .55 })));
    register('liver', 'organ', liv);

    const gb = grp(-.4, 5.68, .32);
    const gbm = sph(.095, .16, .095, mat(0x55813d, .35, { clearcoat: .5 })); gbm.rotation.z = .45; gb.add(gbm);
    register('gallbladder', 'organ', gb);

    const sto = grp(); const som = mat(0xdd8a72, .45, { clearcoat: .3 });
    sto.add(tube([V(.08, 6.32, .16), V(.4, 6.34, .24), V(.56, 6.06, .27), V(.47, 5.74, .25), V(.24, 5.62, .21), V(.0, 5.8, .16)], .165, som).group);
    sto.add(sph(.19, .17, .17, som, .44, 6.32, .25));
    register('stomach', 'organ', sto);

    const spl = grp(.79, 6.28, -.14);
    const spm = sph(.13, .28, .19, mat(0x74304e, .45, { clearcoat: .35 })); spm.rotation.z = -.3; spl.add(spm);
    register('spleen', 'organ', spl);

    const pan = grp(); const pam = mat(0xe0b57f, .55, { map: speckleTex, bumpScale: .4 });
    pan.add(tube([V(.0, 5.86, -.02), V(.3, 5.95, -.05), V(.6, 6.09, -.06)], .082, pam).group);
    pan.add(sph(.115, .1, .1, pam, -.02, 5.85, 0));
    register('pancreas', 'organ', pan, { dir: V(0, 0, -1), factor: .7 });

    for (const s of SIDES) {
      const kidGeo = deform(new THREE.SphereGeometry(.22, 34, 26), (v) => {
        v.x *= .8; v.y *= 1.3; v.z *= .64;
        const med = -s, facing = v.x * med;
        if (facing > 0) {
          const gg = Math.exp(-Math.pow(v.y / .13, 2)) * Math.exp(-Math.pow(v.z / .12, 2));
          v.x -= med * .06 * gg * (facing / .17);
        }
      });
      const kg = grp(); const km = mat(0x8e3226, .38, { clearcoat: .45 });
      const kidney = new THREE.Mesh(kidGeo, km);
      const holder = grp(.55 * s, 5.94, -.33); holder.rotation.z = .1 * s; holder.add(kidney); kg.add(holder);
      kg.add(tube([V(.47 * s, 5.78, -.3), V(.34 * s, 5.2, -.16), V(.12 * s, 4.56, .06)], .028, mat(0xd9b48c, .5)).group);
      register('kidneys', 'organ', kg);
    }

    const coilPts = [];
    for (let r = 0; r < 6; r++) {
      const y = 5.48 - r * .175;
      for (let k = 0; k <= 10; k++) {
        const t = k / 10, tt = r % 2 ? 1 - t : t;
        coilPts.push(V(tt * .86 - .43, y + .03 * Math.sin(t * 9 + r * 2), .17 + .085 * Math.sin(t * Math.PI * 2 + r)));
      }
    }
    const si = tube(coilPts, .08, mat(0xe08a6d, .42, { clearcoat: .35 }), 9);
    register('small_intestine', 'organ', si.group, { dir: V(0, 0, 1), factor: .9 });

    const liG = grp(); const lim = mat(0xc96f58, .5, { clearcoat: .2 });
    liG.add(tube([V(-.5, 4.5, .2), V(-.57, 5.0, .2), V(-.56, 5.5, .18), V(-.34, 5.66, .23), V(0, 5.6, .27), V(.34, 5.66, .23), V(.56, 5.52, .18), V(.55, 5.0, .18), V(.5, 4.62, .16), V(.28, 4.48, .1), V(.04, 4.56, .02), V(-.05, 4.34, -.08), V(0, 4.16, -.12)], .118, lim).group);
    liG.add(tube([V(-.5, 4.5, .2), V(-.44, 4.36, .22)], .03, lim).group);
    register('large_intestine', 'organ', liG, { dir: V(0, 0, 1), factor: .8 });

    const bla = grp(0, 4.4, .2);
    bla.add(sph(.25, .23, .2, mat(0xe7c98c, .4, { clearcoat: .3 })));
    register('bladder', 'organ', bla, { dir: V(0, 0, 1) });
  }

  /* ================= DOLAŞIM ================= */
  {
    // kalp
    const heartG = grp(.16, 7.13, .2); heartG.rotation.z = .42; heartG.rotation.x = .22;
    const prof = [[.012, -.55], [.15, -.45], [.26, -.25], [.33, -.02], [.335, .18], [.28, .36], [.17, .47], [.05, .5]]
      .map(([r, y]) => new THREE.Vector2(r, y));
    const heartMesh = new THREE.Mesh(new THREE.LatheGeometry(prof, 28), mat(0xa01c28, .3, { clearcoat: .7, map: muscleTex, bumpScale: .3 }));
    heartMesh.scale.set(1.05, 1, .88); heartG.add(heartMesh);
    const hAtria = mat(0x8f1822, .35, { clearcoat: .6 });
    heartG.add(sph(.16, .13, .13, hAtria, .18, .36, -.02));
    heartG.add(sph(.16, .13, .13, hAtria, -.18, .36, -.02));
    animated.heart = heartG;
    register('heart', 'vessel', heartG, { dir: V(0, 0, 1), factor: 1.2 });

    // aort
    const ao = grp();
    const aoMain = tube([V(.14, 7.42, .22), V(.1, 7.82, .14), V(.04, 8.02, .02), V(.1, 7.92, -.16), V(.12, 7.4, -.28), V(.1, 6.4, -.3), V(.06, 5.4, -.22), V(.02, 4.82, -.08)], .102, artMat());
    ao.add(aoMain.group);
    addFlow(aoMain, 'aorta', 'vessel', { color: 0xff6a5e, count: 16, speed: .3, size: .1 });
    ao.add(tube([V(.03, 8.0, .02), V(-.12, 8.22, .04), V(-.32, 8.3, .05)], .045, artMat()).group);
    ao.add(tube([V(.05, 8.02, .02), V(.14, 8.22, .04)], .042, artMat()).group);
    ao.add(tube([V(-.02, 7.99, -.02), V(.3, 8.22, 0), V(.62, 8.3, 0)], .045, artMat()).group);
    for (const s of SIDES) ao.add(tube([V(.02, 4.82, -.08), V(.22 * s, 4.78, 0), V(.4 * s, 4.8, .12)], .058, artMat()).group);
    register('aorta', 'vessel', ao, { factor: .7 });

    // vena kavalar
    const vc = grp();
    const ivc = tube([V(-.06, 4.85, -.02), V(-.16, 5.4, -.14), V(-.2, 6.1, -.16), V(-.18, 6.7, -.04), V(-.08, 7.02, .08)], .098, veinMat());
    const svc = tube([V(-.1, 7.32, .12), V(-.16, 7.8, .08), V(-.2, 8.16, .05)], .092, veinMat());
    vc.add(ivc.group, svc.group);
    addFlow(ivc, 'vena_cava', 'vessel', { color: 0x6f9bff, count: 10, speed: .18, size: .095 });
    addFlow(svc, 'vena_cava', 'vessel', { color: 0x6f9bff, count: 6, speed: .2, size: .09, reverse: true });
    for (const s of SIDES) vc.add(tube([V(-.2, 8.16, .05), V(.3 * s, 8.26, .03), V(.92 * s, 8.3, 0)], .058, veinMat()).group);
    register('vena_cava', 'vessel', vc, { factor: .7 });

    // pulmoner damarlar
    const pu = grp(); const pam2 = mat(0x5468c9, .38, { clearcoat: .4 });
    const trunk = tube([V(.28, 7.42, .3), V(.18, 7.62, .18), V(0, 7.74, 0)], .082, pam2);
    pu.add(trunk.group);
    addFlow(trunk, 'pulmonary', 'vessel', { color: 0x8fa8ff, count: 6, speed: .25, size: .09 });
    for (const s of SIDES) {
      pu.add(tube([V(0, 7.74, 0), V(.3 * s, 7.66, -.02), V(.52 * s, 7.45, -.02)], .052, pam2).group);
      const pv = tube([V(.5 * s, 7.1, -.1), V(.28 * s, 7.05, -.08), V(.1, 7.12, -.02)], .044, artMat());
      pu.add(pv.group);
      addFlow(pv, 'pulmonary', 'vessel', { color: 0xff6a5e, count: 4, speed: .22, size: .08 });
    }
    register('pulmonary', 'vessel', pu, { factor: .8 });

    for (const s of SIDES) {
      const ca = tube([V(.16 * s, 8.06, .04), V(.17 * s, 8.45, .07), V(.16 * s, 8.86, .05), V(.13 * s, 9.2, .02)], .046, artMat());
      addFlow(ca, 'carotid', 'vessel', { color: 0xff6a5e, count: 5, speed: .3, size: .075 });
      register('carotid', 'vessel', ca.group, { dirUp: .4 });
      const ju = tube([V(.2 * s, 9.16, .02), V(.27 * s, 8.7, .05), V(.3 * s, 8.36, .03), V(.52 * s, 8.25, .02)], .058, veinMat());
      addFlow(ju, 'jugular', 'vessel', { color: 0x6f9bff, count: 4, speed: .2, size: .08 });
      register('jugular', 'vessel', ju.group, { dirUp: .4 });

      const sh = J.shoulder(s), el = J.elbow(s), wr = J.wrist(s);
      const bv = grp();
      const ba = tube([sh.clone().add(V(-.05 * s, -.04, .05)), lerpV(sh, el, .5).add(V(-.1 * s, 0, .08)), el.clone().add(V(-.05 * s, 0, .1)), lerpV(el, wr, .5).add(V(-.02 * s, 0, .09)), wr.clone().add(V(0, -.02, .08))], .04, artMat());
      const bvv = tube([wr.clone().add(V(-.06 * s, 0, .13)), lerpV(el, wr, .5).add(V(-.08 * s, 0, .13)), el.clone().add(V(-.11 * s, 0, .12)), lerpV(sh, el, .5).add(V(-.16 * s, 0, .11)), sh.clone().add(V(-.1 * s, -.02, .08))], .044, veinMat());
      bv.add(ba.group, bvv.group);
      addFlow(ba, 'brachial_vessels', 'vessel', { color: 0xff6a5e, count: 7, speed: .22, size: .07 });
      addFlow(bvv, 'brachial_vessels', 'vessel', { color: 0x6f9bff, count: 7, speed: .15, size: .07 });
      register('brachial_vessels', 'vessel', bv);

      const fv = grp();
      const fa = tube([V(.38 * s, 4.8, .12), V(.48 * s, 4.55, .26), V(.5 * s, 3.8, .27), V(.52 * s, 3.0, .12), V(.56 * s, 2.55, -.15), V(.58 * s, 1.6, -.12), V(.6 * s, .62, -.02), V(.6 * s, .34, .24)], .05, artMat());
      const fvv = tube([V(.53 * s, .4, .18), V(.53 * s, .7, -.04), V(.52 * s, 1.6, -.14), V(.5 * s, 2.5, -.16), V(.45 * s, 3.2, .1), V(.42 * s, 3.9, .24), V(.4 * s, 4.6, .22), V(.3 * s, 4.82, .08)], .056, veinMat());
      fv.add(fa.group, fvv.group);
      addFlow(fa, 'femoral_vessels', 'vessel', { color: 0xff6a5e, count: 10, speed: .2, size: .075 });
      addFlow(fvv, 'femoral_vessels', 'vessel', { color: 0x6f9bff, count: 10, speed: .13, size: .075 });
      register('femoral_vessels', 'vessel', fv);

      const rv = grp();
      rv.add(tube([V(.07, 5.96, -.22), V(.25 * s, 5.96, -.27), V(.46 * s, 5.95, -.31)], .032, artMat()).group);
      rv.add(tube([V(.46 * s, 5.85, -.28), V(.15 * s - .05, 5.82, -.2), V(-.16, 5.8, -.14)], .038, veinMat()).group);
      register('renal_vessels', 'vessel', rv, { factor: .7 });
    }
  }

  return { body, parts, structures, pickMeshes, flows, animated };
}
