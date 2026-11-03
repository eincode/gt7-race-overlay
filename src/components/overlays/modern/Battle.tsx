import { AnimatePresence, motion } from "motion/react";
import { formatGap, type StandingRow } from "../../../hooks/useStandings";
import type { OverlayData } from "../../../types";
import {
  barDropFromAbove,
  lapBoxWipe,
  leaderboardDuration,
  sideSlideFromBehindCentre,
  sideWipeFromCentre,
  type Side,
  type SideCustom,
} from "./animations";
import { Flag } from "./Flag";
import { battlePositionStyle, battleStyles as B } from "./styles";

/** Header pieces (gap, names, label) leave once the position boxes have wiped back in. */
const HEADER_EXIT_DELAY = leaderboardDuration(1);
const sideCustom = (side: Side): SideCustom => ({ side, exitDelay: HEADER_EXIT_DELAY });

function ordinalSuffix(n: number) {
  const lastTwo = n % 100;
  if (lastTwo >= 11 && lastTwo <= 13) return "th";
  return ["th", "st", "nd", "rd"][n % 10] ?? "th";
}

/** Seconds between the two cars, from their gaps to the leader; null when either is unknown. */
function gapBetween(ahead: StandingRow, behind: StandingRow) {
  const aheadToLeader = ahead.rank === 1 ? 0 : ahead.toLeader;
  if (aheadToLeader == null || behind.toLeader == null) return null;
  return behind.toLeader - aheadToLeader;
}

interface Props {
  state: OverlayData;
  /** The leaderboard's 1 Hz snapshot: positions and gap match it and don't flicker. */
  standings: StandingRow[];
}

/**
 * Head-to-head bar for the two drivers picked for the car telemetry panel
 * (overlayState.carTelemetry): positions at the ends, names either side of
 * the gap between them, and "Battle for Nth" underneath.
 */
export function Battle({ state, standings }: Props) {
  const { roster, overlayState } = state;
  const { visible, driverIds } = overlayState.carTelemetry;
  // Whoever is ahead on the left; they swap sides on an overtake.
  const [ahead, behind] = standings
    .filter((s) => driverIds.includes(s.id))
    .sort((a, b) => a.rank - b.rank);
  // Keyed on the chosen pair, not on who is ahead, so an overtake between them doesn't replay the entrance.
  const pairKey = [...driverIds].sort((a, b) => a - b).join("-");
  const gap = ahead && behind ? gapBetween(ahead, behind) : null;

  return (
    // mode="wait": picking a new pair plays the old bar out before the new one comes in.
    <AnimatePresence mode="wait">
      {visible && ahead && behind && (
        <motion.div key={pairKey} initial="hidden" animate="visible" exit="exit" style={B.panel}>
          <Position side="left" rank={ahead.rank} />
          <Name side="left" entry={roster.find((r) => r.id === ahead.id)} id={ahead.id} />

          <motion.div custom={HEADER_EXIT_DELAY} variants={lapBoxWipe} style={B.gap}>
            {gap != null ? formatGap(gap) : "—"}
          </motion.div>

          <Name side="right" entry={roster.find((r) => r.id === behind.id)} id={behind.id} />
          <Position side="right" rank={behind.rank} />

          <motion.div custom={HEADER_EXIT_DELAY} variants={barDropFromAbove} style={B.label}>
            Battle for {ahead.rank}
            <span style={{ textTransform: "none" }}>{ordinalSuffix(ahead.rank)}</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Position({ side, rank }: { side: Side; rank: number }) {
  return (
    <motion.div
      custom={sideCustom(side)}
      variants={sideWipeFromCentre}
      style={battlePositionStyle(side === "left" ? 1 : 5, rank === 1)}
    >
      <span style={B.positionText}>
        <span style={B.positionNumber}>{rank}</span>
        <span style={B.positionSuffix}>{ordinalSuffix(rank)}</span>
      </span>
    </motion.div>
  );
}

/** Flag and name, grouped towards the gap in the middle. */
function Name({ side, entry, id }: { side: Side; entry: { name: string; country: string } | undefined; id: number }) {
  return (
    <div style={{ ...B.nameSlot, gridColumn: side === "left" ? 2 : 4 }}>
      <motion.div
        custom={sideCustom(side)}
        variants={sideSlideFromBehindCentre}
        style={{ ...B.nameBox, justifyContent: side === "left" ? "flex-end" : "flex-start" }}
      >
        <Flag country={entry?.country ?? ""} style={B.flag} />
        <span style={B.name}>{entry?.name ?? `#${id}`}</span>
      </motion.div>
    </div>
  );
}
