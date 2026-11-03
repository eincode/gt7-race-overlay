import { pedalSegmentStyle, telemetryStyles as T } from "../styles";

const SEGMENTS = 12;

/** Vertical segmented bar lit from the bottom; `pct` is 0–100. */
export function PedalBar({ pct, color }: { pct: number; color: string }) {
  const lit = Math.round((pct / 100) * SEGMENTS);

  return (
    <div style={T.pedal}>
      {Array.from({ length: SEGMENTS }, (_, i) => (
        <div key={i} style={pedalSegmentStyle(i < lit, color)} />
      ))}
    </div>
  );
}
