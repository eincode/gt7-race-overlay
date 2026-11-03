import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import placeholderPhoto from "../../../assets/driver-placeholder.png";
import type { StandingRow } from "../../../hooks/useStandings";
import { loadDriverPhotos } from "../../../lib/utils";
import type { OverlayData } from "../../../types";
import {
  lapBoxWipe,
  lapCounterSlideFromBehindLapBox,
  leaderboardDuration,
  leaderboardRowWipe,
  photoRiseFromNameBar,
  type RowPosition,
} from "./animations";
import { carName } from "./car";
import { Flag } from "./Flag";
import { showcaseStyles as C } from "./styles";

/** The subtitle bar wipes in after the name bar, like the leaderboard's first row. */
const SUBTITLE_POSITION: RowPosition = { fromTop: 0, fromBottom: 0 };
/** Header pieces (position, name, photo) leave once the subtitle bar has wiped out. */
const HEADER_EXIT_DELAY = leaderboardDuration(1);

interface Props {
  state: OverlayData;
  /** The leaderboard's 1 Hz snapshot, so the position matches it. */
  standings: StandingRow[];
}

/** Lower-third spotlight for the driver picked in the control panel (overlayState.driverShowcase). */
export function DriverShowcase({ state, standings }: Props) {
  const { roster, drivers, overlayState } = state;
  const { visible, driverId } = overlayState.driverShowcase;
  const entry = roster.find((r) => r.id === driverId);

  return (
    // mode="wait": switching drivers plays the old card out before the new one comes in.
    <AnimatePresence mode="wait">
      {visible && driverId != null && entry && (
        <motion.div key={driverId} initial="hidden" animate="visible" exit="exit" style={C.panel}>
          <Photo driverId={driverId} name={entry.name} />

          <div style={C.nameRow}>
            <motion.div custom={HEADER_EXIT_DELAY} variants={lapBoxWipe} style={C.position}>
              {standings.find((s) => s.id === driverId)?.rank ?? "–"}
            </motion.div>
            <div style={C.nameSlot}>
              <motion.div custom={HEADER_EXIT_DELAY} variants={lapCounterSlideFromBehindLapBox} style={C.nameBox}>
                <span style={C.name}>{entry.name}</span>
                <Flag country={entry.country} style={C.flag} />
              </motion.div>
            </div>
          </div>

          <motion.div custom={SUBTITLE_POSITION} variants={leaderboardRowWipe} style={C.subtitleRow}>
            {entry.psnId && (
              <div style={C.psnId}>
                <span style={C.subtitleText}>{entry.psnId}</span>
              </div>
            )}
            <div style={C.carName}>
              <span style={C.subtitleText}>{carName(drivers[driverId]?.telemetry?.carCode) ?? ""}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * The photo uploaded in the control panel, else the helmet placeholder.
 * Read once per mount — the card remounts each time it is shown.
 */
function Photo({ driverId, name }: { driverId: number; name: string }) {
  const [photo] = useState(() => loadDriverPhotos()[driverId] ?? placeholderPhoto);

  return (
    <motion.img
      custom={HEADER_EXIT_DELAY}
      variants={photoRiseFromNameBar}
      src={photo}
      alt={name}
      style={C.photo}
    />
  );
}
