import { FONT, ST } from "../tokens";

interface Props {
  engineRpm: number;
  minAlertRpm: number;
  maxAlertRpm: number;
}

export function Rpm({ engineRpm, minAlertRpm, maxAlertRpm }: Props) {
  const rpmInAlert = engineRpm >= minAlertRpm && engineRpm <= maxAlertRpm;
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 4,
        }}
      >
        <span
          style={{
            fontSize: 11,
            letterSpacing: 2,
            color: ST.inkDim,
            fontWeight: 600,
          }}
        >
          RPM
        </span>
        <span
          style={{
            fontFamily: FONT.mono,
            fontSize: 12,
            fontWeight: 600,
            fontVariantNumeric: "tabular-nums",
            color: rpmInAlert ? ST.accent : ST.ink,
          }}
        >
          {engineRpm.toFixed(0).toLocaleString()}
        </span>
      </div>
      <div
        style={{
          position: "relative",
          height: 8,
          background: "rgba(255,255,255,0.06)",
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        {/* Green zone (below alert) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: `${(engineRpm / maxAlertRpm) * 100}%`,
            background: ST.gain,
          }}
        />
        {/* Red zone (alert range) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: `${(minAlertRpm / maxAlertRpm) * 100}%`,
            height: "100%",
            width: `${engineRpm < minAlertRpm ? 0 : ((engineRpm - minAlertRpm) / maxAlertRpm) * 100}%`,
            background: ST.accent,
          }}
        />
        {/* Alert threshold line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: `${(minAlertRpm / maxAlertRpm) * 100}%`,
            width: 2,
            height: "100%",
            background: ST.ink,
          }}
        />
      </div>
    </div>
  );
}
