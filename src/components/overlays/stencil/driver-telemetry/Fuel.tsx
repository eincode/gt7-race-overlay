import { FONT, ST } from "../tokens";

interface Props {
  fuelPct: number;
}

export function Fuel({ fuelPct }: Props) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 4,
          marginTop: 12,
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
          FUEL
        </span>
        <span
          style={{
            fontFamily: FONT.mono,
            fontSize: 12,
            fontWeight: 600,
            fontVariantNumeric: "tabular-nums",
            color: ST.ink,
          }}
        >
          {fuelPct.toFixed(0)} %
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
            width: `${fuelPct}%`,
            background: "#f5c542",
          }}
        />
      </div>
    </div>
  );
}
