/**
 * Track map geometry and tag placement, shared by the stencil and modern maps.
 *
 * Road drawing follows friz-telemetry's MapBox: the surface is one quad per
 * step between the recorded left and right edges (filled nonzero so
 * crossovers like Suzuka's bridge stay solid), outlined by the edge lines,
 * with start/finish and sector boundaries drawn as marks across the road.
 *
 * Each car is a dot with a leader line out to a short-name tag. Each tag
 * tries directions fanning out from "away from the map centre" at a few
 * lengths, and takes the first spot that stays inside the map without
 * covering an earlier tag or any car, so close packs stay readable. A tag
 * keeps last tick's spot while it is still clear, so tags don't flicker.
 */
import type { TrackMapData } from "../types";

const MARK_OVERHANG_PX = 3;
const MIN_MARK_HALF_PX = 7;
/** Leader-line lengths tried for each tag, shortest first, in px. */
const LEADER_LENGTHS = [24, 44, 66];
/** Turns off the outward direction tried for each tag, in degrees. */
const LEADER_TURNS = [0, 35, -35, 70, -70, 110, -110, 180];

export type Pt = [number, number];

export interface Fit {
  minX: number;
  minZ: number;
  scale: number;
  offsetX: number;
  offsetY: number;
}

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Scale and offset that fit `points` into a w×h box, leaving `padding` px
 * around the road for the tags, zoomed in no further than `maxScale` px/m.
 */
export function computeFit(points: Pt[], w: number, h: number, padding: number, maxScale: number): Fit | null {
  if (points.length < 2) return null;
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  for (const [x, z] of points) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  }
  const spanX = Math.max(maxX - minX, 1e-3);
  const spanZ = Math.max(maxZ - minZ, 1e-3);
  const scale = Math.min((w - padding * 2) / spanX, (h - padding * 2) / spanZ, maxScale);
  return {
    minX,
    minZ,
    scale,
    offsetX: (w - spanX * scale) / 2,
    offsetY: (h - spanZ * scale) / 2,
  };
}

// World +X is screen right and world +Z is screen down, matching the in-game map.
export const px = (f: Fit, x: number) => f.offsetX + (x - f.minX) * f.scale;
export const py = (f: Fit, z: number) => f.offsetY + (z - f.minZ) * f.scale;
const pt = (f: Fit, [x, z]: Pt) => `${px(f, x).toFixed(1)} ${py(f, z).toFixed(1)}`;

function buildPath(points: Pt[], f: Fit): string {
  return points.map((p, i) => `${i === 0 ? "M" : "L"}${pt(f, p)}`).join("") + "Z";
}

function buildRoad(l: Pt[], r: Pt[], f: Fit): string {
  const n = Math.min(l.length, r.length);
  let d = "";
  // No wrap-around quad: the recorded edges already end back on their first point.
  for (let i = 0; i + 1 < n; i++) {
    d += `M${pt(f, l[i])}L${pt(f, l[i + 1])}L${pt(f, r[i + 1])}L${pt(f, r[i])}Z`;
  }
  return d;
}

function buildMark(f: Fit, [lx, lz]: Pt, [rx, rz]: Pt): string {
  const ax = px(f, lx);
  const ay = py(f, lz);
  const bx = px(f, rx);
  const by = py(f, rz);
  const len = Math.hypot(bx - ax, by - ay);
  if (len === 0) return "";
  const half = Math.max(len / 2 + MARK_OVERHANG_PX, MIN_MARK_HALF_PX);
  const mx = (ax + bx) / 2;
  const my = (ay + by) / 2;
  const ux = ((bx - ax) / len) * half;
  const uy = ((by - ay) / len) * half;
  return `M${(mx - ux).toFixed(1)} ${(my - uy).toFixed(1)}L${(mx + ux).toFixed(1)} ${(my + uy).toFixed(1)}`;
}

export interface TrackPaths {
  road: string;
  center: string;
  left: string;
  right: string;
  start: string;
  sectors: string;
}

/** SVG path data for the road surface, its edges, and the start/finish and sector marks. */
export function buildTrackPaths(map: TrackMapData, fit: Fit): TrackPaths {
  const l = map.leftEdge;
  const r = map.rightEdge;
  return {
    road: buildRoad(l, r, fit),
    center: buildPath(map.centerline, fit),
    left: buildPath(l, fit),
    right: buildPath(r, fit),
    start: buildMark(fit, l[0], r[0]),
    sectors: map.sectors.map((s) => buildMark(fit, s.left, s.right)).join(""),
  };
}

/** "M. VERSTAPPEN" → "VER"; falls back to the driver id when there is no name. */
export function shortName(name: string | undefined, id: number): string {
  const words = (name ?? "").trim().split(/\s+/).filter(Boolean);
  const last = words[words.length - 1]?.replace(/[^\p{L}\p{N}]/gu, "");
  return last ? last.slice(0, 3).toUpperCase() : `#${id}`;
}

const overlaps = (a: Box, b: Box) =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

export interface TagLayout {
  /** Map size in px; tags stay inside it. */
  width: number;
  height: number;
  dotRadius: number;
  tagHeight: number;
  /** Tag width in px for a given car, from its label. */
  tagWidth: (label: string) => number;
}

/** A car to tag: its screen position and label. Anything else on it is passed through. */
interface TagCar {
  id: number;
  x: number;
  y: number;
  label: string;
}

/**
 * Places a tag for each car, in the order given (put the leader first so its
 * tag is never moved). `lastSpot` remembers each car's [length, turn] across
 * ticks; keep it in a ref.
 */
export function placeTags<C extends TagCar>(
  cars: C[],
  layout: TagLayout,
  lastSpot: Map<number, [number, number]>,
): (C & { box: Box; ex: number; ey: number })[] {
  const { width, height, dotRadius, tagHeight } = layout;

  /**
   * Tag box at the end of a `len` px leader from (cx, cy) along (dx, dy). Mostly
   * sideways leaders put the tag beside the end point, mostly vertical ones
   * centre it above or below, so the tag always sits clear of its own car.
   */
  const tagBox = (cx: number, cy: number, dx: number, dy: number, len: number, w: number): Box => {
    const ax = cx + dx * len;
    const ay = cy + dy * len;
    if (Math.abs(dx) >= Math.abs(dy)) {
      return { x: dx >= 0 ? ax : ax - w, y: ay - tagHeight / 2, w, h: tagHeight };
    }
    return { x: ax - w / 2, y: dy >= 0 ? ay : ay - tagHeight, w, h: tagHeight };
  };
  const inside = (b: Box) => b.x >= 2 && b.y >= 2 && b.x + b.w <= width - 2 && b.y + b.h <= height - 2;
  const clampBox = (b: Box): Box => ({
    ...b,
    x: Math.min(Math.max(b.x, 2), width - b.w - 2),
    y: Math.min(Math.max(b.y, 2), height - b.h - 2),
  });

  const dots: Box[] = cars.map((c) => ({
    x: c.x - dotRadius,
    y: c.y - dotRadius,
    w: dotRadius * 2,
    h: dotRadius * 2,
  }));
  const placed: Box[] = [];

  return cars.map((c) => {
    const out = Math.atan2(c.y - height / 2, c.x - width / 2);
    const w = layout.tagWidth(c.label);
    const clashes = (b: Box) =>
      placed.filter((p) => overlaps(p, b)).length + dots.filter((d) => overlaps(d, b)).length;

    const prev = lastSpot.get(c.id);
    const spots: [number, number][] = [
      ...(prev ? [prev] : []),
      ...LEADER_LENGTHS.flatMap((len) => LEADER_TURNS.map((turn): [number, number] => [len, turn])),
    ];

    let box: Box | null = null;
    let fallback: { box: Box; clashes: number } | null = null;
    for (const [len, turn] of spots) {
      const a = out + (turn * Math.PI) / 180;
      const b = tagBox(c.x, c.y, Math.cos(a), Math.sin(a), len, w);
      if (!inside(b)) continue;
      const n = clashes(b);
      if (n === 0) {
        box = b;
        lastSpot.set(c.id, [len, turn]);
        break;
      }
      if (!fallback || n < fallback.clashes) fallback = { box: b, clashes: n };
    }
    // Nowhere clear: least-crowded in-bounds spot, else straight out and clamped.
    box ??= fallback?.box ?? clampBox(tagBox(c.x, c.y, Math.cos(out), Math.sin(out), LEADER_LENGTHS[0], w));
    placed.push(box);
    // Leader line ends on the tag edge nearest the car.
    const ex = Math.min(Math.max(c.x, box.x), box.x + box.w);
    const ey = Math.min(Math.max(c.y, box.y), box.y + box.h);
    return { ...c, box, ex, ey };
  });
}

/** A car's world position, or null while it has none (GT7 sends all zeros before the car is on track). */
export function carPosition(position: [number, number, number] | undefined): Pt | null {
  if (!position || (position[0] === 0 && position[1] === 0 && position[2] === 0)) return null;
  return [position[0], position[2]];
}
