import { AnimatePresence, motion } from "motion/react";
import type { StandingRow } from "../../../hooks/useStandings";
import { bytePct, msToKmh } from "../../../lib/utils";
import type { DriverTelemetry as Telemetry, OverlayData } from "../../../types";
import {
  lapBoxWipe,
  lapCounterSlideFromBehindLapBox,
  leaderboardDuration,
  leaderboardRowWipe,
  shortHeaderExitDelay,
  type RowPosition,
} from "./animations";
import { GearStrip } from "./driver-telemetry/GearStrip";
import { Flag } from "./Flag";
import { PedalBar } from "./driver-telemetry/PedalBar";
import { RpmBar } from "./driver-telemetry/RpmBar";
import { SteeringWheel } from "./driver-telemetry/SteeringWheel";
import { ACCENT_RED, SKY_BLUE, telemetryStyles as T } from "./styles";

/** The body is a single row wiping in after the header, like the leaderboard's first row. */
const BODY_POSITION: RowPosition = { fromTop: 0, fromBottom: 0 };
const HEADER_EXIT_DELAY = shortHeaderExitDelay(leaderboardDuration(1));

interface Props {
  state: OverlayData;
  /** The leaderboard's 1 Hz snapshot, so the position matches it and doesn't flicker in a close battle. */
  standings: StandingRow[];
}

/** Live telemetry for the driver picked in the control panel (overlayState.driverTelemetry). */
export function DriverTelemetry({ state, standings }: Props) {
  const { drivers, roster, overlayState } = state;
  const { visible, driverId } = overlayState.driverTelemetry;
  const driver = driverId != null ? drivers[driverId] : undefined;
  const entry = roster.find((r) => r.id === driverId);

  return (
    // mode="wait": switching drivers plays the old panel out before the new one comes in.
    <AnimatePresence mode="wait">
      {visible && driverId != null && driver && (
        <motion.div key={driverId} initial="hidden" animate="visible" exit="exit" style={T.panel}>
          <Header
            position={standings.find((s) => s.id === driverId)?.rank ?? 0}
            name={entry?.name ?? `#${driverId}`}
            country={entry?.country ?? ""}
          />
          <motion.div custom={BODY_POSITION} variants={leaderboardRowWipe} style={T.body}>
            <Body telemetry={driver.telemetry} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Header({ position, name, country }: { position: number; name: string; country: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <motion.div custom={HEADER_EXIT_DELAY} variants={lapBoxWipe} style={T.position}>
        {position > 0 ? position : "–"}
      </motion.div>
      <div style={T.nameSlot}>
        <motion.div custom={HEADER_EXIT_DELAY} variants={lapCounterSlideFromBehindLapBox} style={T.nameBox}>
          <Flag country={country} style={T.flag} />
          <span style={T.name}>{name}</span>
        </motion.div>
      </div>
    </div>
  );
}

/** Missing telemetry (driver not sending yet) reads as a stationary car in neutral. */
function Body({ telemetry: tel }: { telemetry: Telemetry | null }) {
  // wheelRotation is radians; negated so the wheel turns the way the driver steers.
  const steeringWheelAngle = (tel?.wheelRotation ?? 0) * (180 / Math.PI) * -1;

  return (
    <>
      <div style={T.inputs}>
        <PedalBar pct={bytePct(tel?.brake ?? 0)} color={ACCENT_RED} />
        <SteeringWheel rotationDeg={steeringWheelAngle} />
        <PedalBar pct={bytePct(tel?.throttle ?? 0)} color={SKY_BLUE} />
      </div>

      <div style={T.divider} />

      <div style={T.dash}>
        <RpmBar
          rpm={tel?.EngineRPM ?? 0}
          minAlertRpm={tel?.minAlertRPM ?? 0}
          maxAlertRpm={tel?.maxAlertRPM ?? 0}
        />
        <GearStrip current={tel?.currentGear ?? 0} gears={tel?.gears ?? 0} />
        <div style={T.speed}>{Math.round(msToKmh(tel?.speed ?? 0))}</div>
        <div style={T.speedUnit}>km/h</div>
      </div>
    </>
  );
}
