// İzolasyon, önceden kapalı olan katmanları yanlışlıkla tekrar açmamalı.
export function targetOpacity(id, system, state, systems) {
  const base = state.override ? (state.override.get(id) ?? 0) : (systems[system] ?? 0);
  if (state.isolate) return id === state.isolate ? 1 : Math.min(base, 0.07);
  return base;
}

// Raycaster görünmez nesneleri otomatik atlamaz. Görünürlük değişene kadar
// adayları saklamak, özellikle gizli anatomik sistemlerde üçgen testlerini azaltır.
export function createVisiblePickCache(meshes) {
  let dirty = true;
  let visible = [];
  return {
    invalidate() { dirty = true; },
    get() {
      if (dirty) {
        visible = meshes.filter((mesh) => {
          for (let node = mesh; node; node = node.parent) if (!node.visible) return false;
          return true;
        });
        dirty = false;
      }
      return visible;
    },
  };
}

// Anatomy entries can contain both left and right meshes, or unsided meshes.
// A whole-entry hide supersedes individual sides without deleting geometry.
export function hidePart(hidden, id, side) {
  const part = side === 'l' || side === 'r' ? side : 'all';
  const sides = hidden.get(id) || new Set();
  if (part === 'all') { sides.clear(); sides.add('all'); }
  else if (!sides.has('all')) sides.add(part);
  hidden.set(id, sides);
}
export function restorePart(hidden, id, side) {
  const sides = hidden.get(id);
  if (!sides) return;
  sides.delete(side === 'l' || side === 'r' ? side : 'all');
  if (!sides.size) hidden.delete(id);
}
export function isPartHidden(hidden, id, side) {
  const sides = hidden.get(id);
  return !!sides && (sides.has('all') || ((side === 'l' || side === 'r') && sides.has(side)));
}
