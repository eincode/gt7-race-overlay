import { AnimatePresence, motion } from "motion/react";
import type { StandingRow } from "../../../hooks/useStandings";
import type { DriverState, OverlayData, SectorStatus } from "../../../types";
import { formatLap } from "../stencil/qualifying/result";
import { useCurrentSector } from "../stencil/STCurrentSector/useCurrentSector";
import {
  lapBoxWipe,
  leaderboardDuration,
  shortHeaderExitDelay,
  type Side,
  type SideCustom,
} from "./animations";
import { carName } from "./car";
import { DriverBody } from "./sector-compare/DriverBody";
import { DriverHeader } from "./sector-compare/DriverHeader";
import { sectorStyles as X } from "./styles";

/** Bodies wipe back into the centre first, then the headers and centre column leave like a short header. */
const HEADER_EXIT_DELAY = shortHeaderExitDelay(leaderboardDuration(1));
const sideCustom = (side: Side): SideCustom => ({ side, exitDelay: HEADER_EXIT_DELAY });

interface Props {
  state: OverlayData;
  /** The leaderboard's 1 Hz snapshot, so positions match it. */
  standings: StandingRow[];
  /** Session-best lap (ms) per driver, as kept by the leaderboard. */
  bestLaps: Map<number, number>;
}

/** The driver's sector colours for this lap, one per sector. */
function sectorStatuses(driver: DriverState | undefined, sectorCount: number): SectorStatus[] {
  return Array.from({ length: sectorCount }, (_, i) => driver?.derived.sectorStatus[i] ?? "neutral");
}

/**
 * Live sector comparison for the two drivers picked in the control panel
 * (overlayState.sector). Timing — which sector, the 5 s freeze after the
 * trailing driver crosses, the delta — comes from the stencil's useCurrentSector.
 */
export function SectorCompare({ state, standings, bestLaps }: Props) {
  const data = useCurrentSector(state);
  const { drivers, overlayState } = state;
  // Keyed on the chosen pair, not on who is ahead, so an overtake between them doesn't replay the entrance.
  const pairKey = [...overlayState.sector.driverIds].sort((a, b) => a - b).join("-");
  const fastestLap = Math.min(...bestLaps.values());

  const sideInfo = (id: number) => {
    const driver = drivers[id];
    const best = bestLaps.get(id);
    return {
      position: standings.find((s) => s.id === id)?.rank ?? 0,
      category: driver?.telemetry?.carCategory || undefined,
      carName: carName(driver?.telemetry?.carCode),
      sectorStatus: sectorStatuses(driver, data?.sectorCount ?? 0),
      bestLap: best != null ? formatLap(best / 1000) : null,
      holdsFastestLap: best != null && best === fastestLap,
    };
  };
  const a = data && sideInfo(data.aId);
  const b = data && sideInfo(data.bId);

  return (
    // mode="wait": picking a new pair plays the old panel out before the new one comes in.
    <AnimatePresence mode="wait">
      {overlayState.sector.visible && data && a && b && (
        <motion.div key={pairKey} initial="hidden" animate="visible" exit="exit" style={X.panel}>
          <DriverHeader custom={sideCustom("left")} position={a.position} name={data.dA.name} category={a.category} />
          <motion.div custom={HEADER_EXIT_DELAY} variants={lapBoxWipe} style={X.centre}>
            <div style={X.centreLabel}>SECTOR</div>
            <div style={X.centreBody}>
              <span style={X.sectorNumber}>{data.displaySectorIdx + 1}</span>
              <span style={X.sectorOf}>of {data.sectorCount}</span>
            </div>
          </motion.div>
          <DriverHeader custom={sideCustom("right")} position={b.position} name={data.dB.name} category={b.category} />

          <DriverBody
            custom={sideCustom("left")}
            carName={a.carName}
            sectorStatus={a.sectorStatus}
            comparedSector={data.displaySectorIdx}
            bestLap={a.bestLap}
            holdsFastestLap={a.holdsFastestLap}
            timeMs={data.aDisplayMs}
            live={data.aColor === "dim"}
          />
          <DriverBody
            custom={sideCustom("right")}
            carName={b.carName}
            sectorStatus={b.sectorStatus}
            comparedSector={data.displaySectorIdx}
            bestLap={b.bestLap}
            holdsFastestLap={b.holdsFastestLap}
            timeMs={data.bDisplayMs}
            live={data.bColor === "dim"}
            deltaMs={data.deltaMs}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
