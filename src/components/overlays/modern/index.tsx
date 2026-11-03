import { AnimatePresence, motion } from "motion/react";
import { useSessionBestLaps, useStandingsSnapshot } from "../../../hooks/useStandings";
import { createRosterLookup } from "../../../lib/utils";
import type { OverlayData } from "../../../types";
import { formatLap } from "../stencil/qualifying/result";
import {
  lapBoxWipe,
  lapCounterSlideFromBehindLapBox,
  leaderboardDuration,
  raceNameSlideFromBehindLapCounter,
} from "./animations";
import { Battle } from "./Battle";
import { DriverShowcase } from "./DriverShowcase";
import { DriverTelemetry } from "./DriverTelemetry";
import { Leaderboard, type LeaderboardEntry } from "./Leaderboard";
import { SectorCompare } from "./SectorCompare";
import { TrackMap } from "./TrackMap";
import { S } from "./styles";

/** Lap box label, and whether the "N of M" counter follows it. */
function headerLabel({ mode, phase }: OverlayData["raceState"]) {
  if (mode !== "race") return { label: mode.toUpperCase(), showCounter: false };
  if (phase === "finished") return { label: "FINISH", showCounter: false };
  if (phase === "finalLap") return { label: "FINAL LAP", showCounter: false };
  return { label: "LAP", showCounter: true };
}

export function Modern({ state }: { state: OverlayData }) {
  const { roster, raceState, drivers, overlayState } = state;
  const { mode, lap, totalLaps, order } = raceState;
  const isRace = mode === "race";

  // Order and gaps refresh together once a second, same as the stencil standings.
  // Shared with the telemetry panel so its position changes with the leaderboard.
  const standings = useStandingsSnapshot(order, drivers, state.standingsV2);
  const bestLaps = useSessionBestLaps(drivers, `${state.session?.id}:${mode}`);
  const rosterById = createRosterLookup(roster);

  const entries: LeaderboardEntry[] = standings.map(({ id, rank, gapText }) => {
    const bestLapMs = bestLaps.get(id) ?? drivers[id]?.telemetry?.bestLaptime ?? 0;
    return {
      id,
      name: rosterById[id]?.name ?? `#${id}`,
      // Race: the server's gap text, with the leader's box labelling the column; otherwise each driver's best lap.
      detail: isRace ? (rank === 1 ? "GAP" : (gapText ?? "--")) : formatLap(bestLapMs / 1000),
    };
  });

  const { label, showCounter } = headerLabel(raceState);
  const leaderboardExitDuration = leaderboardDuration(entries.length);

  return (
    <div style={S.root}>
      <AnimatePresence>
        {overlayState.standings.visible && (
          <motion.div key="panel" initial="hidden" animate="visible" exit="exit" style={S.panel}>
            <div style={S.row}>
              <motion.div
                custom={leaderboardExitDuration}
                variants={lapBoxWipe}
                style={showCounter ? S.lap : S.lapAlone}
              >
                {label}
              </motion.div>

              {showCounter && (
                <div style={S.hiddenUntilPastPreviousBoxEdge}>
                  <motion.div
                    custom={leaderboardExitDuration}
                    variants={lapCounterSlideFromBehindLapBox}
                    style={S.counter}
                  >
                    <span style={S.counterNum}>{lap}</span>
                    {totalLaps > 0 && (
                      <>
                        <span>of</span>
                        <span style={S.counterNum}>{totalLaps}</span>
                      </>
                    )}
                  </motion.div>
                </div>
              )}

              <div style={S.hiddenUntilPastPreviousBoxEdge}>
                <motion.div
                  custom={leaderboardExitDuration}
                  variants={raceNameSlideFromBehindLapCounter}
                  style={S.raceNameWithLeadingGap}
                >
                  <div style={S.raceName}>Pagurismo BRZx86 Series Race 2</div>
                </motion.div>
              </div>
            </div>

            <Leaderboard entries={entries} />
          </motion.div>
        )}
      </AnimatePresence>

      <SectorCompare state={state} standings={standings} bestLaps={bestLaps} />
      <DriverTelemetry state={state} standings={standings} />
      <DriverShowcase state={state} standings={standings} />
      <TrackMap state={state} standings={standings} />
      <Battle state={state} standings={standings} />
    </div>
  );
}
