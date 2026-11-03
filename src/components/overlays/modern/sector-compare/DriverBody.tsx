import { motion } from "motion/react";
import { fmtSectorMs } from "../../../../lib/utils";
import type { SectorStatus } from "../../../../types";
import { sideWipeFromCentre, type SideCustom } from "../animations";
import {
  bestLapStyle,
  sectorChipStyle,
  sectorDeltaStyle,
  sectorStyles as X,
  sectorTimeStyle,
} from "../styles";

interface Props {
  custom: SideCustom;
  carName: string | null;
  /** One per sector of the lap, chips in sector order. */
  sectorStatus: SectorStatus[];
  comparedSector: number;
  bestLap: string | null;
  holdsFastestLap: boolean;
  timeMs: number | null;
  /** Time still running (dimmed) rather than a completed sector. */
  live: boolean;
  /** Only the trailing driver's side shows a delta: their time minus the leader's. */
  deltaMs?: number | null;
}

/** "-00.268" / "+01.204", as on the GT7 broadcast graphic. */
function formatDelta(ms: number) {
  return `${ms < 0 ? "-" : "+"}${(Math.abs(ms) / 1000).toFixed(3).padStart(6, "0")}`;
}

/** Car and lap details towards the outer edge, the sector time next to the centre column. */
export function DriverBody({
  custom,
  carName,
  sectorStatus,
  comparedSector,
  bestLap,
  holdsFastestLap,
  timeMs,
  live,
  deltaMs,
}: Props) {
  const isLeft = custom.side === "left";
  const outerEdge = isLeft ? "flex-start" : "flex-end";

  return (
    <motion.div
      custom={custom}
      variants={sideWipeFromCentre}
      style={{
        ...X.body,
        gridColumn: isLeft ? 1 : 3,
        gridRow: 2,
        flexDirection: isLeft ? "row" : "row-reverse",
      }}
    >
      <div style={{ ...X.info, alignItems: outerEdge }}>
        {carName && <span style={X.carName}>{carName}</span>}
        <div style={X.chips}>
          {sectorStatus.map((status, i) => (
            <span key={i} style={sectorChipStyle(status, i === comparedSector)}>
              S{i + 1}
            </span>
          ))}
        </div>
        {bestLap && <span style={bestLapStyle(holdsFastestLap)}>BEST {bestLap}</span>}
      </div>

      <div style={{ ...X.times, alignItems: isLeft ? "flex-end" : "flex-start" }}>
        <span style={sectorTimeStyle(live)}>{timeMs != null ? fmtSectorMs(timeMs) : "—"}</span>
        {deltaMs != null && <span style={sectorDeltaStyle(deltaMs < 0)}>{formatDelta(deltaMs)}</span>}
      </div>
    </motion.div>
  );
}
