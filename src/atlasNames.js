// GLTFLoader, düğüm adlarını animasyon yolları için değiştirir; çok parçalı
// düğümlerde çizilen mesh'in adı da farklı olabilir. Kaynak glTF adını kullan.
export function atlasNodeName(object, scene, parser) {
  // Loader özgün adı düğümün userData'sında saklar. Önce bunu kullan: aynı
  // mesh'i paylaşan klonların parser.associations girdileri ortak olabilir.
  for (let node = object; node && node !== scene; node = node.parent) {
    if (typeof node.userData?.name === 'string' && node.userData.name) return node.userData.name;
  }
  for (let node = object; node && node !== scene; node = node.parent) {
    const index = parser.associations.get(node)?.nodes;
    if (Number.isInteger(index)) return parser.json.nodes[index]?.name || '';
  }
  return '';
}

export function parseAtlasName(raw) {
  const match = /\.(l|r)$/i.exec(raw);
  return match ? { base: raw.slice(0, -2), side: match[1].toLowerCase() } : { base: raw, side: null };
}
