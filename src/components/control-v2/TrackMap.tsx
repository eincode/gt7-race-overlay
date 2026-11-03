import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import type { TrackMapData } from "../../types";

// Maps are static per layout, so fetch each one at most once per page load.
const cache = new Map<string, Promise<TrackMapData>>();

function loadMap(trackId: string): Promise<TrackMapData> {
  let p = cache.get(trackId);
  if (!p) {
    p = api.getTrackMap(trackId);
    p.catch(() => cache.delete(trackId));
    cache.set(trackId, p);
  }
  return p;
}

const PAD = 0.06;

/** Top-down outline of a layout drawn from its recorded centerline. */
export function TrackMap({
  trackId,
  className,
}: {
  trackId: string;
  className?: string;
}) {
  const [map, setMap] = useState<TrackMapData | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setMap(null);
    setFailed(false);
    loadMap(trackId)
      .then((m) => {
        if (!cancelled) setMap(m);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [trackId]);

  if (!map || map.centerline.length < 2) {
    return (
      <span
        className={`flex items-center justify-center font-jetbrains text-[9px] tracking-[0.12em] text-[#5c5c64] ${className ?? ""}`}
      >
        {failed ? "NO MAP" : "TRACK MAP"}
      </span>
    );
  }

  const xs = map.centerline.map((p) => p[0]);
  const zs = map.centerline.map((p) => p[1]);
  const minX = Math.min(...xs);
  const minZ = Math.min(...zs);
  const w = Math.max(...xs) - minX;
  const h = Math.max(...zs) - minZ;
  const pad = Math.max(w, h) * PAD;
  const viewBox = `${minX - pad} ${minZ - pad} ${w + pad * 2} ${h + pad * 2}`;

  const d =
    map.centerline
      .map((p, i) => `${i === 0 ? "M" : "L"}${p[0]} ${p[1]}`)
      .join(" ") + " Z";
  const [sx, sz] = map.centerline[0];
  const dot = Math.max(w, h) * 0.022;

  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      role="img"
      aria-label="Track map"
    >
      <path
        d={d}
        fill="none"
        stroke="#3f3f46"
        strokeWidth={9}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={d}
        fill="none"
        stroke="#e4e4e7"
        strokeWidth={3}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {map.sectorBoundaries.map(([x, z], i) => (
        <circle key={i} cx={x} cy={z} r={dot * 0.7} fill="#a1a1aa" />
      ))}
      <circle cx={sx} cy={sz} r={dot} fill="#dc2626" stroke="#1c1c1f" strokeWidth={dot * 0.35} />
    </svg>
  );
}
