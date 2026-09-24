import { useGearInfo } from "../../../hooks/useGearInfo";
import { useRPMInfo } from "../../../hooks/useRPMInfo";
import {
  bytePct,
  createRosterLookup,
  getDriverPosition,
  msToKmh,
} from "../../../lib/utils";
import type { OverlayData } from "../../../types";
import { Fuel } from "./driver-telemetry/Fuel";
import { Gear } from "./driver-telemetry/Gear";
import { Header } from "./driver-telemetry/Header";
import { Input } from "./driver-telemetry/Input";
import { Rpm } from "./driver-telemetry/Rpm";
import { clip, FONT, panelMotion, ST } from "./tokens";

interface Props {
  state: OverlayData;
  isVisible: boolean;
}

export function STDriverTelemetry({ state, isVisible }: Props) {
  const { drivers, roster, raceState, overlayState } = state;
  const { driverId } = overlayState.driverTelemetry;
  if (driverId == null) return null;

  const driverState = drivers[driverId];
  const tel = driverState?.telemetry;
  if (!driverState || !tel) return null;

  const rosterById = createRosterLookup(roster);
  const rosterEntry = rosterById[driverId];
  const name = rosterEntry?.name ?? `Driver #${driverId}`;
  const position = getDriverPosition(raceState.order, driverId);

  // ── Derived values ──────────────────────────────────────────────────────

  const speedKmh = msToKmh(tel.speed);
  const throttlePct = bytePct(tel.throttle);
  const brakePct = bytePct(tel.brake);
  useRPMInfo(tel);
  const { curGear, shouldShift } = useGearInfo(tel);

  // Steering angle: -1 = full left, 0 = centre, +1 = full right.
  // Clamp raw angle to ±90° and normalise.
  const rawSteer = tel.steeringAngle ?? 0;
  const steerNorm = Math.max(-1, Math.min(1, (rawSteer * -1) / 90));
  const steerPct = ((steerNorm + 1) / 2) * 100; // 0–100, 50 = centre

  return (
    <div
      style={{
        position: "absolute",
        right: 28,
        top: 28,
        width: 300,
        fontFamily: FONT.body,
        color: ST.ink,
        ...panelMotion(isVisible, "right"),
      }}
    >
      {/* Header */}
      <Header name={name} position={position} speedKmh={speedKmh} />

      {/* Body */}
      <div
        style={{
          background: ST.surface,
          clipPath: clip.slashRight,
          padding: "12px 16px 14px",
        }}
      >
        {/* ── Throttle / Steering / Brake row ─────────────────────────────── */}
        <Input
          brakePct={brakePct}
          steerPct={steerPct}
          throttlePct={throttlePct}
        />

        {/* ── Gear ─────────────────────────────────────────────────────────── */}
        <Gear curGear={curGear} shouldShift={shouldShift} />

        {/* ── RPM bar ──────────────────────────────────────────────────────── */}
        <Rpm
          engineRpm={tel.EngineRPM}
          minAlertRpm={tel.minAlertRPM}
          maxAlertRpm={tel.maxAlertRPM}
        />
        <Fuel fuelPct={tel.fuelLevel} />
      </div>
    </div>
  );
}
