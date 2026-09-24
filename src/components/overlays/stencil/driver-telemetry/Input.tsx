import { SteeringWheel } from "../../../ui/SteeringWheel";
import { FONT, ST } from "../tokens";

function Brake({ pct }: { pct: number }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        height: "100%",
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
        BRK
      </span>
      <div
        style={{
          flex: 1,
          width: 22,
          background: "rgba(255,255,255,0.06)",
          borderRadius: 2,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: `${pct}%`,
            background: ST.loss,
            transition: "height 80ms linear",
          }}
        />
      </div>
      <span
        style={{
          fontSize: 11,
          fontFamily: FONT.mono,
          fontWeight: 600,
          color: ST.ink,
        }}
      >
        {pct}
      </span>
    </div>
  );
}

function Steering({ pct }: { pct: number }) {
  const rotateDeg = (pct - 50) * 1.8; // 0 = full left (-90°), 100 = full right (+90°)
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        height: "100%",
        justifyContent: "center",
      }}
    >
      <span
        style={{
          fontSize: 11,
          letterSpacing: 2,
          color: ST.inkDim,
          fontWeight: 600,
          marginBottom: 4,
        }}
      >
        STEER
      </span>
      <div
        style={{
          position: "relative",
          width: 64,
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <SteeringWheel
          size={64}
          style={{
            transform: `rotate(${rotateDeg}deg)`,
            transition: "transform 80ms linear",
          }}
        />
      </div>
      {/* L / R labels */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: 64,
          marginTop: 2,
        }}
      >
        <span
          style={{
            fontSize: 9,
            fontFamily: FONT.mono,
            color: ST.inkVeryDim,
          }}
        >
          L
        </span>
        <span
          style={{
            fontSize: 9,
            fontFamily: FONT.mono,
            color: ST.inkVeryDim,
          }}
        >
          R
        </span>
      </div>
    </div>
  );
}

function Throttle({ pct }: { pct: number }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        height: "100%",
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
        THR
      </span>
      <div
        style={{
          flex: 1,
          width: 22,
          background: "rgba(255,255,255,0.06)",
          borderRadius: 2,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: `${pct}%`,
            background: ST.gain,
            transition: "height 80ms linear",
          }}
        />
      </div>
      <span
        style={{
          fontSize: 11,
          fontFamily: FONT.mono,
          fontWeight: 600,
          color: ST.ink,
        }}
      >
        {pct}
      </span>
    </div>
  );
}

interface Props {
  brakePct: number;
  steerPct: number;
  throttlePct: number;
}

export function Input({ brakePct, steerPct, throttlePct }: Props) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        gap: 14,
        height: 170,
        marginBottom: 12,
      }}
    >
      <Steering pct={steerPct} />
      <Brake pct={brakePct} />
      <Throttle pct={throttlePct} />
    </div>
  );
}
