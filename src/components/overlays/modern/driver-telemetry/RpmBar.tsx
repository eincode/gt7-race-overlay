import { shiftLightStyle, telemetryStyles as T } from "../styles";

interface Props {
  rpm: number;
  minAlertRpm: number;
  maxAlertRpm: number;
}

/** Revs as a share of the rev limiter, plus a shift light that comes on in the alert range. */
export function RpmBar({ rpm, minAlertRpm, maxAlertRpm }: Props) {
  const pct = maxAlertRpm > 0 ? Math.min(100, (rpm / maxAlertRpm) * 100) : 0;
  const inAlert = minAlertRpm > 0 && rpm >= minAlertRpm;

  return (
    <div style={T.rpmRow}>
      <div style={T.rpmTrack}>
        <div style={{ ...T.rpmFill, width: `${pct}%` }} />
      </div>
      <div style={shiftLightStyle(inAlert)} />
    </div>
  );
}
