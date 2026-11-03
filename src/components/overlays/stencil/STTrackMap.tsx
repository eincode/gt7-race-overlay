/**
 * STTrackMap — live track map with every driver's position. Geometry and tag
 * placement live in lib/trackMap (shared with the modern overlay).
 */
import { useMemo, useRef } from "react";
import { useTrackMap } from "../../../hooks/useTrackMap";
import {
  buildTrackPaths,
  carPosition,
  computeFit,
  placeTags,
  px,
  py,
  shortName,
} from "../../../lib/trackMap";
import { createRosterLookup, fmtTrackName } from "../../../lib/utils";
import type { OverlayData } from "../../../types";
import { STPanelHeader } from "./STPanelHeader";
import { FONT, panelMotion, ST } from "./tokens";

const MAP_W = 460;
const MAP_H = 360;
/** Room around the road for the tags, in px. */
const PADDING = 58;
/** Upper bound on zoom, in px per metre (same cap as friz-telemetry). */
const MAX_SCALE = 1;

const ROAD_FILL = "#3a3a42";
const ROAD_EDGE = "#8a8a94";
const MIN_ROAD_PX = 3;

const DOT_R = 6.5;
const TAG_H = 20;
const TAG_PAD_X = 7;
const TAG_CHAR_W = 7.6; // JetBrains Mono bold at 12px

interface Props {
  state: OverlayData;
  isVisible: boolean;
}

export function STTrackMap({ state, isVisible }: Props) {
  const { roster, raceState, drivers } = state;
  const map = useTrackMap(raceState.trackId);

  const fit = useMemo(
    () => (map ? computeFit([...map.leftEdge, ...map.rightEdge], MAP_W, MAP_H, PADDING, MAX_SCALE) : null),
    [map],
  );

  const paths = useMemo(() => (map && fit ? buildTrackPaths(map, fit) : null), [map, fit]);

  const rosterById = createRosterLookup(roster);
  // Last chosen [length, turn] per driver; reused first so tags hold still.
  const lastSpot = useRef(new Map<number, [number, number]>());

  // Cars in race order, leader first, so the leader's tag is placed first and never moved.
  const ids = raceState.order.length
    ? [
        ...raceState.order,
        ...Object.keys(drivers)
          .map(Number)
          .filter((id) => !raceState.order.includes(id)),
      ]
    : Object.keys(drivers).map(Number);

  const cars = fit
    ? ids.flatMap((id, i) => {
        const d = drivers[id];
        const pos = carPosition(d?.telemetry?.position);
        if (!pos) return [];
        return [
          {
            id,
            rank: i + 1,
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
      tagWidth: (label) => TAG_PAD_X * 2 + label.length * TAG_CHAR_W + 14,
    },
    lastSpot.current,
  );

  return (
    <div
      style={{
        position: "absolute",
        right: 28,
        top: "50%",
        marginTop: -(MAP_H + 40) / 2,
        width: MAP_W,
        fontFamily: FONT.body,
        color: ST.ink,
        ...panelMotion(isVisible, "right"),
      }}
    >
      <STPanelHeader
        title="TRACK MAP"
        status={fmtTrackName(raceState.trackId)}
        statusColor={ST.inkDim}
        marginBottom={4}
      />
      <div
        style={{
          position: "relative",
          width: MAP_W,
          height: MAP_H,
          background: ST.surface,
          border: `1px solid ${ST.border}`,
        }}
      >
        {paths ? (
          <svg width={MAP_W} height={MAP_H} style={{ display: "block" }}>
            <path d={paths.road} fill={ROAD_FILL} stroke={ROAD_FILL} strokeWidth={0.75} strokeLinejoin="round" />
            <path d={paths.center} fill="none" stroke={ROAD_FILL} strokeWidth={MIN_ROAD_PX} strokeLinejoin="round" />
            <path d={paths.left} fill="none" stroke={ROAD_EDGE} strokeWidth={1} strokeLinejoin="round" />
            <path d={paths.right} fill="none" stroke={ROAD_EDGE} strokeWidth={1} strokeLinejoin="round" />
            <path d={paths.sectors} stroke={ST.leader} strokeWidth={2} strokeLinecap="round" />
            <path d={paths.start} stroke={ST.ink} strokeWidth={2.5} strokeLinecap="round" />

            {/* Lines and tags first, dots last, so no tag ever hides a car. */}
            {tags.map((t) => (
              <g key={`tag-${t.id}`} opacity={t.connected ? 1 : 0.4}>
                <line x1={t.x} y1={t.y} x2={t.ex} y2={t.ey} stroke={ST.inkDim} strokeWidth={1.5} />
                <rect x={t.box.x} y={t.box.y} width={t.box.w} height={t.box.h} fill={ST.surfaceSolid} />
                <rect
                  x={t.box.x}
                  y={t.box.y}
                  width={3}
                  height={t.box.h}
                  fill={t.rank === 1 ? ST.leader : ST.accent}
                />
                <text
                  x={t.box.x + 3 + TAG_PAD_X}
                  y={t.box.y + t.box.h / 2}
                  dominantBaseline="central"
                  fontFamily={FONT.mono}
                  fontSize={10}
                  fontWeight={700}
                  fill={ST.inkVeryDim}
                >
                  {t.rank}
                </text>
                <text
                  x={t.box.x + 3 + TAG_PAD_X + 13}
                  y={t.box.y + t.box.h / 2}
                  dominantBaseline="central"
                  fontFamily={FONT.mono}
                  fontSize={12}
                  fontWeight={700}
                  letterSpacing={0.5}
                  fill={ST.ink}
                >
                  {t.label}
                </text>
              </g>
            ))}
            {tags.map((t) => (
              <circle
                key={`dot-${t.id}`}
                cx={t.x}
                cy={t.y}
                r={DOT_R}
                fill={t.rank === 1 ? ST.leader : ST.accent}
                stroke={ST.ink}
                strokeWidth={1.5}
                opacity={t.connected ? 1 : 0.4}
              />
            ))}
          </svg>
        ) : (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT.mono,
              fontSize: 11,
              letterSpacing: 2,
              color: ST.inkVeryDim,
            }}
          >
            {raceState.trackId ? "NO MAP FOR THIS TRACK" : "NO TRACK LOADED"}
          </div>
        )}
      </div>
    </div>
  );
}
