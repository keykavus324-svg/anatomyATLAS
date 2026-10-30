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
