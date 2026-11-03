import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { TrackMapData } from "../types";

/** Geometry for the current track; null until loaded, or when the server has none for it. */
export function useTrackMap(trackId: string | null): TrackMapData | null {
  const [map, setMap] = useState<TrackMapData | null>(null);
  useEffect(() => {
    setMap(null);
    if (!trackId) return;
    let cancelled = false;
    api
      .getTrackMap(trackId)
      .then((m) => {
        if (!cancelled) setMap(m);
      })
      .catch(() => {
        // No geometry for this track (e.g. the mock's synthetic one): callers show nothing or a hint.
      });
    return () => {
      cancelled = true;
    };
  }, [trackId]);
  return map;
}
