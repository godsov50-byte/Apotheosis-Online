/** Propose an entrance at the midpoint of the longest footprint edge. Leaflet [lat, lon]. Placeholder only. */
export function createProvisionalEntrance(footprint) {
  if (!Array.isArray(footprint) || footprint.length < 3 || !footprint.every(p => Array.isArray(p) && p.length >= 2 && Number.isFinite(p[0]) && Number.isFinite(p[1]))) return null;
  let best = null;
  for (let i = 0; i < footprint.length; i++) {
    const a = footprint[i], b = footprint[(i + 1) % footprint.length];
    const dy = b[0] - a[0], dx = (b[1] - a[1]) * Math.cos((a[0] + b[0]) * Math.PI / 360);
    const length2 = dy * dy + dx * dx;
    if (!best || length2 > best.length2) best = { index: i, length2, a, b };
  }
  if (!best || best.length2 <= 0) return null;
  return { position: [(best.a[0] + best.b[0]) / 2, (best.a[1] + best.b[1]) / 2], method: 'longest-edge-midpoint', boundaryEdge: { start: best.a.slice(0, 2), end: best.b.slice(0, 2), index: best.index } };
}
