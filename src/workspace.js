// Panel visibility is UI state only; model, selection and camera are never reset.
export function initialWorkspace(mobile) {
  return { mobile, left: !mobile, right: !mobile, tools: true, focus: false, saved: null };
}

export function toggleWorkspaceSection(state, section) {
  if (!['left', 'right', 'tools'].includes(section)) return state;
  const next = { ...state, focus: false, saved: null, [section]: !state[section] };
  if (next.mobile && next[section] && section === 'left') next.right = false;
  if (next.mobile && next[section] && section === 'right') next.left = false;
  return next;
}

export function toggleWorkspaceFocus(state) {
  if (!state.focus) {
    return { ...state, saved: { left: state.left, right: state.right, tools: state.tools }, left: false, right: false, tools: false, focus: true };
  }
  const next = { ...state, ...state.saved, focus: false, saved: null };
  if (next.mobile && next.left && next.right) next.left = false;
  return next;
}

export function workspaceForSelection(state) {
  if (!state.mobile || state.focus) return state;
  return { ...state, left: false, right: true };
}

export function workspaceForViewport(state, mobile) {
  if (state.mobile === mobile) return state;
  if (state.focus) return { ...state, mobile };
  return { ...state, mobile, left: !mobile, right: !mobile };
}
