import { motion } from "motion/react";
import { memo } from "react";
import { leaderboardRowWipe, rowReorder, type RowPosition } from "./animations";
import { leaderboardStyles as L, positionCellStyle, positionSlashStyle } from "./styles";

export interface LeaderboardEntry {
  id: number;
  name: string;
  /** Gap box text: gap to the leader in a race ("GAP" for the leader), best lap otherwise. */
  detail: string;
}

function sameEntries(a: { entries: LeaderboardEntry[] }, b: { entries: LeaderboardEntry[] }) {
  return (
    a.entries.length === b.entries.length &&
    a.entries.every((x, i) => {
      const y = b.entries[i];
      return x.id === y.id && x.name === y.name && x.detail === y.detail;
    })
  );
}

// Memoised so the 60 Hz state frames don't re-measure the layout animation every tick.
export const Leaderboard = memo(function Leaderboard({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <div style={L.list}>
      {entries.map((entry, index) => {
        const isLeader = index === 0;
        const position: RowPosition = { fromTop: index, fromBottom: entries.length - 1 - index };

        return (
          <motion.div
            key={entry.id}
            layout="position"
            transition={rowReorder}
            custom={position}
            variants={leaderboardRowWipe}
            style={L.row}
          >
            <div style={L.driver}>
              <div style={positionCellStyle(isLeader)}>{index + 1}</div>
              <div style={positionSlashStyle(isLeader)} />
              <div style={L.nameCell}>
                <span style={L.name}>{entry.name}</span>
              </div>
            </div>
            <div style={L.gap}>{entry.detail}</div>
          </motion.div>
        );
      })}
    </div>
  );
}, sameEntries);
