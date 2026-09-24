import { useGearInfo } from "../../../../hooks/useGearInfo";
import { useRPMInfo } from "../../../../hooks/useRPMInfo";
import { CAR_LIST } from "../../../../lib/carList";
import { bytePct, categoryInfo, msToKmh } from "../../../../lib/utils";
import type { DriverTelemetry, RosterEntry } from "../../../../types";
import { Badge } from "../Badge";
import { FONT, ST, clip } from "../tokens";
import { InputBar } from "./InputBar";
import { TireTemp } from "./TireTemp";

interface Props {
  d: RosterEntry;
  tel: DriverTelemetry;
  mirror: boolean;
}

const TYRE_POSITIONS = ["FL", "FR", "RL", "RR"] as const;

export function Side({ d, tel, mirror }: Props) {
  const cat = categoryInfo(tel.carCategory);
  const speedKmh = Math.round(msToKmh(tel.speed));
  const { curGear, shouldShift, suggestedGear } = useGearInfo(tel);
  const throttlePct = bytePct(tel.throttle);
  const brakePct = bytePct(tel.brake);
  const { rpmPctOfMax: rpmPct, minAlertPct, inAlert } = useRPMInfo(tel);

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
              fontFamily: FONT.mono,
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
              fontFamily: FONT.title,
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 1,
              lineHeight: 1,
            }}
          >
            {d.name}
          </span>
          <Badge
            background={cat.color}
            color={cat.text}
            fontSize={12}
            letterSpacing={1.4}
            padding="2px 8px"
            clipType={clip.smallSlash}
          >
            {tel.carCategory}
          </Badge>
        </div>
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 10,
            color: ST.inkVeryDim,
            letterSpacing: 1.4,
            marginTop: 4,
            fontWeight: 500,
          }}
        >
          {CAR_LIST.find((car) => car.id === tel.carCode)?.name}
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
              fontFamily: FONT.title,
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
              letterSpacing: 0,
            }}
          >
            {curGear}
          </span>
          {shouldShift && (
            <span
              style={{
                position: "absolute",
                top: 4,
                [mirror ? "left" : "right"]: 6,
                fontFamily: FONT.title,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1.4,
                animation: "stShiftPulse 0.6s ease-in-out infinite",
              }}
            >
              ▲{suggestedGear}
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
              fontFamily: FONT.mono,
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
                fontFamily: FONT.title,
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
            fontFamily: FONT.mono,
            fontSize: 9.5,
            fontWeight: 700,
            letterSpacing: 1.6,
            color: ST.inkVeryDim,
          }}
        >
          <span>RPM</span>
          <span
            style={{
              fontFamily: FONT.title,
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
              fontFamily: FONT.mono,
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
              fontFamily: FONT.title,
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
              fontFamily: FONT.mono,
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
