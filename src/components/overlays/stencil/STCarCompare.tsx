import type { OverlayData, DriverTelemetry, RosterEntry } from "../../../types";
import {
  msToKmh,
  bytePct,
  tireTempColor,
  categoryInfo,
} from "../../../lib/utils";
import { ST, clip } from "./tokens";

interface Props {
  state: OverlayData;
}

interface SideProps {
  d: RosterEntry;
  tel: DriverTelemetry;
  mirror: boolean;
}

const TYRE_POSITIONS = ["FL", "FR", "RL", "RR"] as const;

function TireTemp({ value, pos }: { value: number; pos: string }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${ST.border}`,
        padding: "6px 8px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      <div
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: 1.4,
          color: ST.inkVeryDim,
        }}
      >
        {pos}
      </div>
      <div
        style={{
          fontFamily: "Oswald, sans-serif",
          fontSize: 18,
          fontWeight: 700,
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1,
          color: tireTempColor(value),
        }}
      >
        {Math.round(value)}
        <span
          style={{
            fontSize: 9,
            color: ST.inkVeryDim,
            fontWeight: 500,
            marginLeft: 2,
          }}
        >
          °
        </span>
      </div>
    </div>
  );
}

function InputBar({
  label,
  val,
  color,
  mirror,
}: {
  label: string;
  val: number;
  color: string;
  mirror: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexDirection: mirror ? "row-reverse" : "row",
      }}
    >
      <span
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 1.6,
          color: ST.inkVeryDim,
          width: 26,
          textAlign: mirror ? "right" : "left",
        }}
      >
        {label}
      </span>
      <div
        style={{
          flex: 1,
          position: "relative",
          height: 12,
          background: "rgba(255,255,255,0.04)",
          clipPath: mirror
            ? "polygon(6px 0, 100% 0, 100% 100%, 0 100%)"
            : "polygon(0 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            [mirror ? "right" : "left"]: 0,
            width: `${val}%`,
            background: color,
            transition: "width 0.12s linear",
          }}
        />
      </div>
      <span
        style={{
          fontFamily: "Oswald, sans-serif",
          fontSize: 14,
          fontWeight: 700,
          fontVariantNumeric: "tabular-nums",
          color: ST.ink,
          width: 36,
          textAlign: mirror ? "left" : "right",
        }}
      >
        {val}%
      </span>
    </div>
  );
}

function Side({ d, tel, mirror }: SideProps) {
  const cat = categoryInfo(tel.carCategory);
  const speedKmh = Math.round(msToKmh(tel.speed));
  const curG = tel.currentGear;
  const sugG = tel.suggestedGear;
  const shouldShift = sugG > curG && tel.EngineRPM > tel.minAlertRPM;
  const throttlePct = bytePct(tel.throttle);
  const brakePct = bytePct(tel.brake);
  const rpmPct = Math.min(100, (tel.EngineRPM / tel.maxAlertRPM) * 100);
  const minAlertPct = (tel.minAlertRPM / tel.maxAlertRPM) * 100;
  const inAlert = tel.EngineRPM >= tel.minAlertRPM;

  return (
    <div
      style={{
        flex: 1,
        background: ST.surface,
        padding: "14px 18px",
        textAlign: mirror ? "right" : "left",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {/* Name + car */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 10,
            justifyContent: mirror ? "flex-end" : "flex-start",
          }}
        >
          <span
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1.5,
              color: ST.accent,
            }}
          >
            {d.country}
          </span>
          <span
            style={{
              fontFamily: "Oswald, sans-serif",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 1,
              lineHeight: 1,
            }}
          >
            {d.name}
          </span>
          <span
            style={{
              background: cat.color,
              color: cat.text,
              padding: "2px 8px",
              fontFamily: "Oswald, sans-serif",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1.4,
              clipPath: clip.smallSlash,
            }}
          >
            {tel.carCategory}
          </span>
        </div>
        <div
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 10,
            color: ST.inkVeryDim,
            letterSpacing: 1.4,
            marginTop: 4,
            fontWeight: 500,
          }}
        >
          CODE #{tel.carCode}
        </div>
      </div>

      {/* Gear slab + Speed */}
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          gap: 12,
          flexDirection: mirror ? "row-reverse" : "row",
        }}
      >
        <div
          style={{
            position: "relative",
            background: shouldShift ? ST.leader : "#000",
            color: shouldShift ? "#0a0a0d" : ST.ink,
            clipPath: clip.gearSlash,
            padding: "4px 22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: 92,
          }}
        >
          <span
            style={{
              fontFamily: "Oswald, sans-serif",
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
              letterSpacing: 0,
            }}
          >
            {curG === 0 ? "N" : curG}
          </span>
          {shouldShift && (
            <span
              style={{
                position: "absolute",
                top: 4,
                [mirror ? "left" : "right"]: 6,
                fontFamily: "Oswald, sans-serif",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1.4,
                animation: "stShiftPulse 0.6s ease-in-out infinite",
              }}
            >
              ▲{sugG}
            </span>
          )}
        </div>

        <div
          style={{
            flex: 1,
            padding: "4px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: mirror ? "flex-end" : "flex-start",
          }}
        >
          <div
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: 1.8,
              color: ST.inkVeryDim,
            }}
          >
            SPEED
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span
              style={{
                fontFamily: "Oswald, sans-serif",
                fontSize: 42,
                fontWeight: 700,
                lineHeight: 0.9,
                fontVariantNumeric: "tabular-nums",
                letterSpacing: 0.6,
              }}
            >
              {speedKmh}
            </span>
            <span
              style={{
                fontSize: 11,
                color: ST.inkDim,
                letterSpacing: 1.4,
                fontWeight: 600,
              }}
            >
              KM/H
            </span>
          </div>
        </div>
      </div>

      {/* RPM strip */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 9.5,
            fontWeight: 700,
            letterSpacing: 1.6,
            color: ST.inkVeryDim,
          }}
        >
          <span>RPM</span>
          <span
            style={{
              fontFamily: "Oswald, sans-serif",
              fontSize: 13,
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
              letterSpacing: 0.4,
              color: inAlert ? ST.accent : ST.ink,
            }}
          >
            {Math.round(tel.EngineRPM)}
          </span>
        </div>
        <div
          style={{
            position: "relative",
            marginTop: 5,
            height: 8,
            background: "rgba(255,255,255,0.06)",
            clipPath: "polygon(0 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              width: `${Math.min(minAlertPct, rpmPct)}%`,
              background: ST.gain,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${minAlertPct}%`,
              width: `${Math.max(0, rpmPct - minAlertPct)}%`,
              background: ST.accent,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: -1,
              bottom: -1,
              left: `calc(${minAlertPct}% - 0.5px)`,
              width: 1.5,
              background: "#fff",
            }}
          />
        </div>
      </div>

      {/* Throttle + Brake */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <InputBar
          label="THR"
          val={throttlePct}
          color={ST.gain}
          mirror={mirror}
        />
        <InputBar label="BRK" val={brakePct} color={ST.loss} mirror={mirror} />
      </div>

      {/* Fuel + Tire temps */}
      <div
        style={{
          display: "flex",
          gap: 12,
          flexDirection: mirror ? "row-reverse" : "row",
        }}
      >
        {/* Fuel */}
        <div style={{ flex: 1.1 }}>
          <div
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: 1.6,
              color: ST.inkVeryDim,
            }}
          >
            FUEL
          </div>
          <div
            style={{
              fontFamily: "Oswald, sans-serif",
              fontSize: 26,
              fontWeight: 700,
              lineHeight: 1,
              marginTop: 2,
              fontVariantNumeric: "tabular-nums",
              color: tel.fuelLevel / tel.fuelCapacity > 0.25 ? ST.ink : ST.loss,
            }}
          >
            {tel.fuelLevel.toFixed(1)}
            <span
              style={{
                fontSize: 13,
                color: ST.inkDim,
                marginLeft: 4,
                fontWeight: 600,
              }}
            >
              / {tel.fuelCapacity}L
            </span>
          </div>
          <div
            style={{
              marginTop: 6,
              height: 5,
              background: "rgba(255,255,255,0.06)",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                [mirror ? "right" : "left"]: 0,
                width: `${Math.min(100, (tel.fuelLevel / tel.fuelCapacity) * 100)}%`,
                background:
                  tel.fuelLevel / tel.fuelCapacity > 0.25 ? ST.gain : ST.loss,
                clipPath: mirror
                  ? "polygon(4px 0, 100% 0, 100% 100%, 0 100%)"
                  : "polygon(0 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
              }}
            />
          </div>
        </div>

        {/* Tire temps */}
        <div style={{ flex: 1.4 }}>
          <div
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: 1.6,
              color: ST.inkVeryDim,
              textAlign: mirror ? "right" : "left",
              marginBottom: 4,
            }}
          >
            TIRE TEMP °C
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}
          >
            {TYRE_POSITIONS.map((pos, i) => (
              <TireTemp key={pos} value={tel.tyreTemp[i]} pos={pos} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function STCarCompare({ state }: Props) {
  const { roster, drivers, raceState } = state;
  const { driverIds } = state.overlayState.carTelemetry;

  if (driverIds.length < 2) return null;
  const [aId, bId] = driverIds;

  const rosterById = Object.fromEntries(roster.map((d) => [d.id, d]));
  const aTel = drivers[aId]?.telemetry;
  const bTel = drivers[bId]?.telemetry;
  const dA = rosterById[aId];
  const dB = rosterById[bId];

  if (!aTel || !bTel || !dA || !dB) return null;

  const aPos = raceState.order.indexOf(aId) + 1;
  const bPos = raceState.order.indexOf(bId) + 1;

  return (
    <div
      style={{
        position: "absolute",
        right: 28,
        bottom: 28,
        width: 700,
        fontFamily: '"Barlow Condensed", sans-serif',
        color: ST.ink,
      }}
    >
      {/* Header */}
      <div
        style={{
          background: ST.surfaceSolid,
          padding: "8px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          clipPath: clip.slashRight,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 4, height: 18, background: ST.accent }} />
          <span
            style={{
              fontFamily: "Oswald, sans-serif",
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: 3,
            }}
          >
            BATTLE · LIVE TELEMETRY
          </span>
        </div>
        <span
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 10,
            color: ST.inkDim,
            letterSpacing: 1.6,
          }}
        >
          P{aPos} VS P{bPos}
        </span>
      </div>

      {/* Two-column layout */}
      <div style={{ display: "flex", position: "relative", marginTop: 2 }}>
        <Side d={dA} tel={aTel} mirror={false} />
        <div style={{ width: 2, background: ST.accent }} />
        <Side d={dB} tel={bTel} mirror={false} />
      </div>
    </div>
  );
}
