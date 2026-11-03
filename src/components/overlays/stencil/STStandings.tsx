import { useEffect, useRef, useState } from "react";
import {
  formatGap,
  useSessionBestLaps,
  useStandingsSnapshot,
} from "../../../hooks/useStandings";
import { createRosterLookup, fmtTrackName } from "../../../lib/utils";
import type { OverlayData } from "../../../types";
import { Badge } from "./Badge";
import { formatLap } from "./qualifying/result";
import { chequered, clip, FONT, panelMotion, ST, stripes } from "./tokens";

const ROW_HEIGHT = 38;
const ROW_GAP = 2;
const ROW_SLOT = ROW_HEIGHT + ROW_GAP;
const SWAP_MS = 650;

type Move = "gain" | "loss";

interface Props {
  state: OverlayData;
  isVisible: boolean;
}

export function STStandings({ state, isVisible }: Props) {
  const { roster, raceState, drivers } = state;
  const { mode, lap, totalLaps, trackId, phase, order } = raceState;

  const rosterById = createRosterLookup(roster);
  const trackName = fmtTrackName(trackId);
  const isRace = mode === "race";
  const isFinalLap = isRace && phase === "finalLap";
  const isChequered = isRace && phase === "finished";

  // Order and gaps come from one snapshot that changes at most once a second,
  // so they always agree and a position battle slides at most once a second.
  // Per-frame data that isn't order (best lap, finished marker, names) stays
  // live, looked up by id.
  const standings = useStandingsSnapshot(order, drivers, state.standingsV2);
  const bestLaps = useSessionBestLaps(drivers,`${state.session?.id}:${mode}`);
  // Chequered-flag marker per driver, still taken from the server's standings.
  const finishedIds = new Set(
    state.standingsV2.filter((s) => s.finished).map((s) => Number(s.driverId)),
  );

  // ── Overtake detection ────────────────────────────────────────────────
  // Compare each driver's slot against the previous order; flag gainers/losers
  // so the gainer's row is layered above the one it passes while sliding.
  const orderKey = standings.map((s) => s.id).join(",");
  const prevIndexRef = useRef(new Map<number, number>());
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [moves, setMoves] = useState<Record<number, Move>>({});

  useEffect(() => {
    const prev = prevIndexRef.current;
    const next = new Map<number, number>();
    const changed = new Map<number, Move>();
    const ids = orderKey ? orderKey.split(",").map(Number) : [];
    ids.forEach((id, i) => {
      next.set(id, i);
      const p = prev.get(id);
      if (p !== undefined && p !== i) changed.set(id, i < p ? "gain" : "loss");
    });
    prevIndexRef.current = next;
    if (changed.size === 0) return;

    setMoves((m) => ({ ...m, ...Object.fromEntries(changed) }));
    const timer = setTimeout(() => {
      setMoves((m) => {
        const copy = { ...m };
        changed.forEach((move, id) => {
          if (copy[id] === move) delete copy[id];
        });
        return copy;
      });
    }, SWAP_MS);
    timersRef.current.push(timer);
  }, [orderKey]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach(clearTimeout);
  }, []);

  // Render rows in a stable DOM order (by driver ID) and position them with
  // translateY — React re-ordering DOM nodes would cancel the CSS transition.
  const rows = standings
    .map((d, idx) => ({ d, idx }))
    .sort((a, b) => a.d.id - b.d.id);
  // const modeLabel = mode.toUpperCase();

  return (
    <div
      style={{
        position: "absolute",
        left: 28,
        top: 28,
        width: 400,
        fontFamily: FONT.body,
        color: ST.ink,
        ...panelMotion(isVisible, "left"),
      }}
    >
      {/* Header */}
      <div
        style={{
          position: "relative",
          background: ST.surfaceSolid,
          backgroundImage: stripes,
          clipPath: clip.slashRight,
          padding: "14px 18px 14px 22px",
          marginBottom: 4,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 6,
            background: ST.accent,
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: FONT.title,
                fontSize: 36,
                fontWeight: 700,
                letterSpacing: 1.4,
                lineHeight: 0.9,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {!isRace
                ? mode.toLocaleUpperCase()
                : isChequered
                  ? "FINISH"
                  : isFinalLap
                    ? "FINAL LAP"
                    : `LAP ${String(lap).padStart(2, "0")}`}
              {isRace && !isChequered && !isFinalLap && totalLaps > 0 && (
                <span
                  style={{
                    color: ST.inkVeryDim,
                    fontWeight: 500,
                    fontSize: 22,
                    letterSpacing: 0.6,
                    marginLeft: 6,
                  }}
                >
                  /{totalLaps}
                </span>
              )}
            </div>
            <div
              style={{
                fontSize: 11,
                letterSpacing: 3,
                color: ST.inkDim,
                marginTop: 4,
                fontWeight: 600,
              }}
            >
              {trackName}
            </div>
          </div>
          {isChequered ? (
            <div
              title="Chequered flag"
              style={{
                width: 56,
                height: 24,
                background: chequered(6),
                clipPath: clip.gearSlash,
              }}
            />
          ) : (
            <Badge letterSpacing={2}>LIVE</Badge>
          )}
        </div>
      </div>

      {/* Driver rows */}
      <div
        style={{
          position: "relative",
          height: Math.max(0, standings.length * ROW_SLOT - ROW_GAP),
          transition: `height ${SWAP_MS}ms ease`,
        }}
      >
        {rows.map(({ d, idx }) => {
          const id = d.id;
          const move = moves[id];
          const isLeader = d.rank === 1;
          const isFocused = false;
          const entry = rosterById[id];
          const country = entry?.country ?? "";
          const name = entry?.name ?? `#${id}`;

          const rightColor = isRace
            ? isLeader
              ? ST.leader
              : ST.inkDim
            : ST.inkDim;

          const bestLap = formatLap(
            (bestLaps.get(id) ?? drivers[id]?.telemetry?.bestLaptime ?? 0) /
              1000,
          );
          // Race: interval to the car ahead (1 Hz snapshot); the leader keeps "Leader".
          const rightText = isRace
            ? isLeader
              ? "Leader"
              : formatGap(d.toAhead)
            : bestLap;
          return (
            <div
              key={id}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                transform: `translateY(${idx * ROW_SLOT}px)`,
                transition: `transform ${SWAP_MS}ms cubic-bezier(0.65, 0, 0.35, 1)`,
                // Gainer slides over the driver they passed
                zIndex: move === "gain" ? 2 : move === "loss" ? 0 : 1,
                background: ST.surface,
                clipPath: clip.slashRight,
                display: "grid",
                gridTemplateColumns: "52px 28px 1fr 88px",
                alignItems: "center",
                gap: 10,
                padding: "5px 24px 5px 0",
                height: ROW_HEIGHT,
              }}
            >
              {/* Position number */}
              <div
                style={{
                  background: isLeader
                    ? ST.leader
                    : isFocused
                      ? ST.accent
                      : "#000",
                  color: isLeader || isFocused ? "#0a0a0d" : ST.ink,
                  fontFamily: FONT.title,
                  fontSize: 26,
                  fontWeight: 700,
                  letterSpacing: 0,
                  fontVariantNumeric: "tabular-nums",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {String(idx + 1).padStart(2, "0")}
              </div>

              {/* Country code */}
              <div
                style={{
                  fontSize: 11,
                  fontFamily: FONT.mono,
                  fontWeight: 700,
                  letterSpacing: 1,
                  color: ST.inkDim,
                  textAlign: "center",
                }}
              >
                {country}
              </div>

              {/* Name */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    fontFamily: FONT.title,
                    fontSize: 16,
                    fontWeight: 600,
                    letterSpacing: 0.6,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    lineHeight: 1,
                  }}
                >
                  {name}
                </div>
                {finishedIds.has(id) && (
                  <div
                    title="Finished"
                    style={{
                      width: 16,
                      height: 12,
                      flexShrink: 0,
                      background: chequered(3),
                      clipPath: clip.smallSlash,
                    }}
                  />
                )}
              </div>

              {/* Right column */}
              <div
                style={{
                  textAlign: "right",
                  fontFamily: FONT.title,
                  fontVariantNumeric: "tabular-nums",
                  fontSize: 16,
                  fontWeight: 600,
                  color: rightColor,
                  letterSpacing: 0.5,
                }}
              >
                {rightText}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
