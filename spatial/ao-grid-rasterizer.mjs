/**
 * AO deterministic sparse-grid rasterizer.
 *
 * Input geometry is already transformed into an approved local metric frame.
 * Coordinates are [u_mm, v_mm]; levelMm is a separate vertical/layer value.
 * This module never projects WGS84, chooses a Houston origin, assigns S2 IDs,
 * infers surface widths, or grants walkability. It only derives cell coverage.
 */

const SUPPORTED = new Set(["LineString", "MultiLineString", "Polygon", "MultiPolygon"]);
const safeInteger = (value, label) => {
  if (!Number.isSafeInteger(value)) throw new TypeError(label + " must be a safe integer millimetre value");
  return value;
};
const floorCell = (value, size) => Math.floor(value / size);
const keyOf = (u, v) => u + ":" + v;

function validatePosition(position, label) {
  if (!Array.isArray(position) || position.length < 2) {
    throw new TypeError(label + " must be [u_mm, v_mm]");
  }
  return [safeInteger(position[0], label + "[0]"), safeInteger(position[1], label + "[1]")];
}

function validateLine(line, label) {
  if (!Array.isArray(line) || line.length < 2) throw new TypeError(label + " needs at least two positions");
  return line.map((point, i) => validatePosition(point, label + "[" + i + "]"));
}

function addCell(cells, u, v) {
  cells.set(keyOf(u, v), { cellU: u, cellV: v });
}

function rasterizeSegment(a, b, cells, cellSizeMm) {
  let x = floorCell(a[0], cellSizeMm);
  let y = floorCell(a[1], cellSizeMm);
  const endX = floorCell(b[0], cellSizeMm);
  const endY = floorCell(b[1], cellSizeMm);
  const dx = Math.abs(endX - x);
  const dy = Math.abs(endY - y);
  const sx = Math.sign(endX - x);
  const sy = Math.sign(endY - y);
  let ix = 0;
  let iy = 0;
  addCell(cells, x, y);

  // Integer supercover traversal. At exact corner crossings include both
  // side-adjacent cells as well as the diagonal destination cell.
  while (ix < dx || iy < dy) {
    const decision = (1 + 2 * ix) * dy - (1 + 2 * iy) * dx;
    if (decision === 0) {
      addCell(cells, x + sx, y);
      addCell(cells, x, y + sy);
      x += sx; y += sy; ix++; iy++;
    } else if (decision < 0) {
      x += sx; ix++;
    } else {
      y += sy; iy++;
    }
    addCell(cells, x, y);
  }

  // A line exactly on a grid boundary touches cells on both sides.
  if (a[0] === b[0] && a[0] % cellSizeMm === 0) {
    const minY = Math.min(a[1], b[1]);
    const maxY = Math.max(a[1], b[1]);
    for (let v = floorCell(minY, cellSizeMm); v <= floorCell(maxY, cellSizeMm); v++) {
      addCell(cells, floorCell(a[0], cellSizeMm) - 1, v);
    }
  }
  if (a[1] === b[1] && a[1] % cellSizeMm === 0) {
    const minX = Math.min(a[0], b[0]);
    const maxX = Math.max(a[0], b[0]);
    for (let u = floorCell(minX, cellSizeMm); u <= floorCell(maxX, cellSizeMm); u++) {
      addCell(cells, u, floorCell(a[1], cellSizeMm) - 1);
    }
  }
}

function pointOnSegment(p, a, b) {
  const cross = (p[1] - a[1]) * (b[0] - a[0]) - (p[0] - a[0]) * (b[1] - a[1]);
  if (cross !== 0) return false;
  return p[0] >= Math.min(a[0], b[0]) && p[0] <= Math.max(a[0], b[0]) &&
    p[1] >= Math.min(a[1], b[1]) && p[1] <= Math.max(a[1], b[1]);
}

function pointOnRing(point, ring) {
  for (let i = 0; i < ring.length - 1; i++) {
    if (pointOnSegment(point, ring[i], ring[i + 1])) return true;
  }
  return false;
}

function pointInRing(point, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[j], b = ring[i];
    const crosses = (a[1] > point[1]) !== (b[1] > point[1]) &&
      point[0] < ((b[0] - a[0]) * (point[1] - a[1])) / (b[1] - a[1]) + a[0];
    if (crosses) inside = !inside;
  }
  return inside;
}

function pointInPolygon(point, rings) {
  if (rings.some(ring => pointOnRing(point, ring))) return false;
  if (!pointInRing(point, rings[0])) return false;
  for (let i = 1; i < rings.length; i++) {
    if (pointInRing(point, rings[i])) return false;
  }
  return true;
}

function orient(a, b, c) {
  return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
}
function segmentsIntersect(a, b, c, d) {
  const o1 = orient(a, b, c), o2 = orient(a, b, d);
  const o3 = orient(c, d, a), o4 = orient(c, d, b);
  if (((o1 > 0 && o2 < 0) || (o1 < 0 && o2 > 0)) &&
      ((o3 > 0 && o4 < 0) || (o3 < 0 && o4 > 0))) return true;
  return (o1 === 0 && pointOnSegment(c, a, b)) ||
    (o2 === 0 && pointOnSegment(d, a, b)) ||
    (o3 === 0 && pointOnSegment(a, c, d)) ||
    (o4 === 0 && pointOnSegment(b, c, d));
}

function segmentIntersectsCell(a, b, left, bottom, right, top) {
  // Positive-length intersection with the open cell interior only. Merely
  // touching a cell edge does not occupy the cell (important for polygon holes).
  const dx = b[0] - a[0], dy = b[1] - a[1];
  let t0 = 0, t1 = 1;
  const clip = (p, q) => {
    if (p === 0) return q > 0;
    const t = q / p;
    if (p < 0) { if (t > t1) return false; if (t > t0) t0 = t; }
    else { if (t < t0) return false; if (t < t1) t1 = t; }
    return true;
  };
  if (!clip(-dx, a[0] - left) || !clip(dx, right - a[0]) ||
      !clip(-dy, a[1] - bottom) || !clip(dy, top - a[1]) || t1 <= t0) return false;
  const mid = (t0 + t1) / 2;
  const x = a[0] + dx * mid, y = a[1] + dy * mid;
  return x > left && x < right && y > bottom && y < top;
}

function rasterizePolygon(rings, cells, cellSizeMm, maxCells) {
  const all = rings.flat();
  const minU = Math.min(...all.map(p => p[0]));
  const maxU = Math.max(...all.map(p => p[0]));
  const minV = Math.min(...all.map(p => p[1]));
  const maxV = Math.max(...all.map(p => p[1]));
  const u0 = floorCell(minU, cellSizeMm);
  const u1 = Math.ceil(maxU / cellSizeMm) - 1;
  const v0 = floorCell(minV, cellSizeMm);
  const v1 = Math.ceil(maxV / cellSizeMm) - 1;
  const candidates = (u1 - u0 + 1) * (v1 - v0 + 1);
  if (!Number.isSafeInteger(candidates) || candidates > maxCells) {
    throw new RangeError("Polygon candidate window exceeds maxCells; split or tile the source feature");
  }

  for (let v = v0; v <= v1; v++) {
    for (let u = u0; u <= u1; u++) {
      const left = u * cellSizeMm, bottom = v * cellSizeMm;
      const right = left + cellSizeMm, top = bottom + cellSizeMm;
      const center = [left + cellSizeMm / 2, bottom + cellSizeMm / 2];
      let hit = pointInPolygon(center, rings);
      if (!hit) {
        const corners = [[left,bottom],[right,bottom],[right,top],[left,top]];
        hit = corners.some(point => pointInPolygon(point, rings));
      }
      if (!hit) {
        for (const ring of rings) {
          for (let i = 0; i < ring.length; i++) {
            const a = ring[i], b = ring[(i + 1) % ring.length];
            if (segmentIntersectsCell(a, b, left, bottom, right, top)) { hit = true; break; }
          }
          if (hit) break;
        }
      }
      if (!hit) {
        outer: for (const point of rings[0]) {
          if (point[0] > left && point[0] < right && point[1] > bottom && point[1] < top) {
            hit = true; break outer;
          }
        }
      }
      if (hit) {
        addCell(cells, u, v);
        if (cells.size > maxCells) throw new RangeError("Rasterized feature exceeds maxCells");
      }
    }
  }
}

export function rasterizeGeometry(geometry, {
  featureId,
  featureClass,
  layer = "ground",
  levelMm = 0,
  cellSizeMm = 1000,
  maxCells = 250000
} = {}) {
  if (!geometry || !SUPPORTED.has(geometry.type)) {
    throw new RangeError("Unsupported geometry type: " + (geometry?.type ?? "missing"));
  }
  if (typeof featureId !== "string" || !featureId.trim()) throw new TypeError("featureId is required");
  if (typeof featureClass !== "string" || !featureClass.trim()) throw new TypeError("featureClass is required");
  if (typeof layer !== "string" || !layer.trim()) throw new TypeError("layer is required");
  safeInteger(levelMm, "levelMm");
  safeInteger(cellSizeMm, "cellSizeMm");
  if (cellSizeMm <= 0) throw new RangeError("cellSizeMm must be positive");
  if (!Number.isSafeInteger(maxCells) || maxCells < 1) throw new RangeError("maxCells must be a positive safe integer");

  const cells = new Map();
  const addLine = (raw, label) => {
    const line = validateLine(raw, label);
    for (let i = 1; i < line.length; i++) rasterizeSegment(line[i - 1], line[i], cells, cellSizeMm);
    if (cells.size > maxCells) throw new RangeError("Rasterized feature exceeds maxCells");
  };
  const addPolygon = (raw, label) => {
    if (!Array.isArray(raw) || raw.length < 1) throw new TypeError(label + " must contain an outer ring");
    const rings = raw.map((ring, i) => {
      const points = validateLine(ring, label + "[" + i + "]");
      if (points.length < 4 || points[0][0] !== points.at(-1)[0] || points[0][1] !== points.at(-1)[1]) {
        throw new TypeError(label + "[" + i + "] must be a closed ring with at least four positions");
      }
      return points;
    });
    rasterizePolygon(rings, cells, cellSizeMm, maxCells);
  };

  switch (geometry.type) {
    case "LineString": addLine(geometry.coordinates, "coordinates"); break;
    case "MultiLineString":
      if (!Array.isArray(geometry.coordinates) || !geometry.coordinates.length) throw new TypeError("MultiLineString is empty");
      geometry.coordinates.forEach((line, i) => addLine(line, "coordinates[" + i + "]"));
      break;
    case "Polygon": addPolygon(geometry.coordinates, "coordinates"); break;
    case "MultiPolygon":
      if (!Array.isArray(geometry.coordinates) || !geometry.coordinates.length) throw new TypeError("MultiPolygon is empty");
      geometry.coordinates.forEach((polygon, i) => addPolygon(polygon, "coordinates[" + i + "]"));
      break;
  }

  const role = geometry.type.includes("Polygon") ? "surface" : "centerline";
  const outputCells = [...cells.values()]
    .sort((a, b) => a.cellV - b.cellV || a.cellU - b.cellU)
    .map(cell => Object.freeze({ ...cell, levelMm, role }));
  return Object.freeze({
    schemaVersion: 1,
    featureId: featureId.trim(),
    featureClass: featureClass.trim(),
    layer: layer.trim(),
    coordinateSpace: "approved-local-metric-grid-plane",
    cellSizeMm,
    levelMm,
    role,
    cellCount: outputCells.length,
    cells: Object.freeze(outputCells)
  });
}
