import * as THREE from 'three';

// Kaynak modelin yüzeyleri doku haritası içermez. Ayrımı yalnızca gerçek
// kas materyallerine uygula; tendon, fasya ve damar renkleri değişmesin.
const MUSCLE_NAMES = new Set(['Internal rotator', 'Trapezius', 'Diaphragm']);
const PROFILE = {
  bone: { roughness: .64, coat: .02 },
  joint: { roughness: .48, coat: .14 },
  muscle: { roughness: .58, coat: .09 },
  organ: { roughness: .43, coat: .2 },
  vessel: { roughness: .38, coat: .2 },
  lymph: { roughness: .48, coat: .12 },
  nerve: { roughness: .52, coat: .1 },
};

// Hafif, yönsüz renk varyasyonu bir yüzey sunumu efektidir; anatomik lif
// yönü veya ilave geometri iddiası taşımaz. UV'siz GLB için dünya konumu kullanılır.
export function addSubtleTissueVariation(material) {
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vTissuePosition;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvTissuePosition = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vTissuePosition;')
      .replace('#include <color_fragment>', `#include <color_fragment>
        vec3 tissueP = vTissuePosition * 31.0;
        float tissueDetail = sin(tissueP.x + sin(tissueP.z * .73)) * sin(tissueP.y * 1.37 + tissueP.z * .41);
        diffuseColor.rgb *= 0.975 + 0.025 * tissueDetail;`);
  };
  material.customProgramCacheKey = () => 'anatomy-tissue-variation-v1';
}

export function makeAnatomyMaterial(src, system) {
  const p = PROFILE[system] || { roughness: .5, coat: .1 };
  const isMuscle = system === 'muscle' && MUSCLE_NAMES.has(src.name);
  const color = isMuscle ? new THREE.Color('#a84a44') : (src.color ? src.color.clone() : new THREE.Color(0xffffff));
  const material = new THREE.MeshPhysicalMaterial({
    name: src.name, color, map: src.map || null,
    roughness: p.roughness, metalness: 0,
    clearcoat: p.coat, clearcoatRoughness: .65, envMapIntensity: .6,
    sheen: isMuscle ? .16 : 0, sheenRoughness: .75,
    sheenColor: new THREE.Color('#df9990'),
    emissive: src.emissive ? src.emissive.clone() : new THREE.Color(0x000000),
    emissiveIntensity: src.emissiveIntensity ?? 1,
    transparent: !!src.transparent, opacity: src.opacity ?? 1,
    alphaTest: src.alphaTest || 0, side: src.side ?? THREE.FrontSide,
    depthWrite: src.depthWrite !== false,
  });
  material.userData.anatomyTissue = isMuscle ? 'muscle' : 'original';
  if (isMuscle) addSubtleTissueVariation(material);
  return material;
}
