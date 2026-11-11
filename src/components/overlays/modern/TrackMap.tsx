import { AnimatePresence, motion } from "motion/react";
import { useMemo, useRef } from "react";
import type { StandingRow } from "../../../hooks/useStandings";
import { useTrackMap } from "../../../hooks/useTrackMap";
import { buildTrackPaths, carPosition, computeFit, placeTags, px, py, shortName } from "../../../lib/trackMap";
import { createRosterLookup } from "../../../lib/utils";
import type { OverlayData } from "../../../types";
import { boxWipeDown, leaderboardDuration, leaderboardRowWipe, type RowPosition } from "./animations";
import {
  ACCENT_RED,
  TRACK_MAP_HEIGHT,
  TRACK_MAP_WIDTH,
  trackMapColors as K,
  trackMapStyles as M,
} from "./styles";

/**
 * Drawing space, in 1080p px. The map is drawn at this size and the SVG scales
 * it up to TRACK_MAP_WIDTH × TRACK_MAP_HEIGHT on the 1440p canvas, because
 * lib/trackMap's leader lengths and mark sizes (shared with stencil) are in 1080p px.
 */
const MAP_W = 460;
const MAP_H = 320;

/** Room around the road for the tags, in px. */
const PADDING = 50;
/** Upper bound on zoom, in px per metre. */
const MAX_SCALE = 1;
const MIN_ROAD_PX = 3;
const VIEW_BOX = `0 0 ${MAP_W} ${MAP_H}`;

const DOT_R = 6;
const TAG_H = 20;
const TAG_POSITION_W = 22;
const TAG_SLANT = 5;
const TAG_PAD_X = 8;
const TAG_CHAR_W = 8; // Montserrat bold at 11px, upper case

/** The cars layer wipes in after the track, like the leaderboard's first row after the lap box. */
const CARS_POSITION: RowPosition = { fromTop: 0, fromBottom: 0 };
/** The track wipes back up once the cars have wiped out. */
const TRACK_EXIT_DELAY = leaderboardDuration(1);

interface Props {
  state: OverlayData;
  /** The leaderboard's 1 Hz snapshot: tag positions match it, leader's tag placed first. */
  standings: StandingRow[];
}

/**
 * Track floating top-right with no panel behind it, a dot per car and a tag
 * with its position and short name. Same geometry and tag placement as the
 * stencil map (lib/trackMap); shown with overlayState.trackMap.
 */
export function TrackMap({ state, standings }: Props) {
  const { roster, raceState, drivers, overlayState } = state;
  const map = useTrackMap(raceState.trackId);

  const fit = useMemo(
    () => (map ? computeFit([...map.leftEdge, ...map.rightEdge], MAP_W, MAP_H, PADDING, MAX_SCALE) : null),
    [map],
  );
  const paths = useMemo(() => (map && fit ? buildTrackPaths(map, fit) : null), [map, fit]);

  const rosterById = createRosterLookup(roster);
  // Last chosen [length, turn] per driver; reused first so tags hold still.
  const lastSpot = useRef(new Map<number, [number, number]>());

  const cars = fit
    ? standings.flatMap(({ id, rank }) => {
        const d = drivers[id];
        const pos = carPosition(d?.telemetry?.position);
        if (!pos) return [];
        return [
          {
            id,
            rank,
            connected: d.connected,
            x: px(fit, pos[0]),
            y: py(fit, pos[1]),
            label: shortName(rosterById[id]?.name, id),
          },
        ];
      })
    : [];

  const tags = placeTags(
    cars,
    {
      width: MAP_W,
      height: MAP_H,
      dotRadius: DOT_R,
      tagHeight: TAG_H,
      tagWidth: (label) => TAG_POSITION_W + TAG_PAD_X * 2 + label.length * TAG_CHAR_W,
    },
    lastSpot.current,
  );

  return (
    <AnimatePresence>
      {overlayState.trackMap.visible && paths && (
        <motion.div key={raceState.trackId} initial="hidden" animate="visible" exit="exit" style={M.map}>
          <motion.div custom={TRACK_EXIT_DELAY} variants={boxWipeDown} style={M.layer}>
            <svg width={TRACK_MAP_WIDTH} height={TRACK_MAP_HEIGHT} viewBox={VIEW_BOX} style={M.svg}>
              <g opacity={K.roadOpacity}>
                <path d={paths.road} fill={K.road} stroke={K.road} strokeWidth={0.75} strokeLinejoin="round" />
                <path d={paths.center} fill="none" stroke={K.road} strokeWidth={MIN_ROAD_PX} strokeLinejoin="round" />
                <path d={paths.left} fill="none" stroke={K.edge} strokeWidth={1} strokeLinejoin="round" />
                <path d={paths.right} fill="none" stroke={K.edge} strokeWidth={1} strokeLinejoin="round" />
              </g>
              <path d={paths.sectors} stroke={K.sector} strokeWidth={2} strokeLinecap="round" />
              <path d={paths.start} stroke={K.start} strokeWidth={2.5} strokeLinecap="round" />
            </svg>
          </motion.div>

          <motion.div custom={CARS_POSITION} variants={leaderboardRowWipe} style={M.layer}>
            <svg width={TRACK_MAP_WIDTH} height={TRACK_MAP_HEIGHT} viewBox={VIEW_BOX} style={M.svg}>
              {/* Lines and tags first, dots last, so no tag ever hides a car. */}
              {tags.map((t) => (
                <Tag key={`tag-${t.id}`} {...t} />
              ))}
              {tags.map((t) => (
                <circle
                  key={`dot-${t.id}`}
                  cx={t.x}
                  cy={t.y}
                  r={DOT_R}
                  fill={t.rank === 1 ? ACCENT_RED : K.dot}
                  stroke={K.dotStroke}
                  strokeWidth={1.5}
                  opacity={t.connected ? 1 : 0.4}
                />
              ))}
            </svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface TagProps {
  x: number;
  y: number;
  ex: number;
  ey: number;
  box: { x: number; y: number; w: number; h: number };
  rank: number;
  label: string;
  connected: boolean;
}

/** A leaderboard row in miniature: slanted position cell (red for the leader, else a red slash), then the name. */
function Tag({ x, y, ex, ey, box, rank, label, connected }: TagProps) {
  const isLeader = rank === 1;
  const right = box.x + TAG_POSITION_W;
  const bottom = box.y + box.h;
  const midY = box.y + box.h / 2;

  return (
    <g opacity={connected ? 1 : 0.4}>
      <line x1={x} y1={y} x2={ex} y2={ey} stroke={K.leaderLine} strokeWidth={1.5} />
      <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={3} fill={K.tagFill} />
      {isLeader ? (
        <polygon
          points={`${box.x},${box.y} ${right},${box.y} ${right - TAG_SLANT},${bottom} ${box.x},${bottom}`}
          fill={K.leaderFill}
        />
      ) : (
        <line x1={right} y1={box.y} x2={right - TAG_SLANT} y2={bottom} stroke={ACCENT_RED} strokeWidth={3} />
      )}
      <text
        x={box.x + (TAG_POSITION_W - TAG_SLANT / 2) / 2}
        y={midY}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={700}
        fill="#fff"
      >
        {rank}
      </text>
      <text x={right + TAG_PAD_X} y={midY} dominantBaseline="central" fontSize={11} fontWeight={700} fill="#fff">
        {label}
      </text>
    </g>
  );
}
