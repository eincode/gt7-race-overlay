import { useEffect, useRef, useState } from "react";
import type { OverlayData } from "../../../types";
import { fmtLapMs, fmtTrackName } from "../../../lib/utils";
import { ST, stripes, clip } from "./tokens";

interface Props {
  state: OverlayData;
}

const MODE_LABELS: Record<string, string> = {
  race: "RACE",
  qualifying: "QUALIFYING",
  practice: "PRACTICE",
};

const GAP_THROTTLE_MS = 1000;

export function STStandings({ state }: Props) {
  const { roster, raceState, drivers, focusedId } = state;
  const { mode, lap, totalLaps, order, trackId } = raceState;

  const rosterById = Object.fromEntries(roster.map((d) => [d.id, d]));
  const trackName = fmtTrackName(trackId);
  const isRace = mode === "race";
  const modeLabel = MODE_LABELS[mode] ?? mode.toUpperCase();

  // ── Throttled gap snapshot (race mode only) ─────────────────────────────
  const lastGapUpdateRef = useRef(0);
  const [gapSnapshot, setGapSnapshot] = useState<Record<number, number>>({});

  useEffect(() => {
    if (!isRace) {
      // Reset so switching back to race shows fresh values immediately
      lastGapUpdateRef.current = 0;
      return;
    }
    const now = Date.now();
    if (now - lastGapUpdateRef.current < GAP_THROTTLE_MS) return;
    lastGapUpdateRef.current = now;
    setGapSnapshot(
      Object.fromEntries(
        order.map((id) => [id, drivers[id]?.derived?.gapToAhead ?? 0]),
      ),
    );
  }, [isRace, drivers, order]);

  return (
    <div
      style={{
        position: "absolute",
        left: 28,
        top: 28,
        width: 400,
        fontFamily: '"Barlow Condensed", system-ui, sans-serif',
        color: ST.ink,
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
                fontFamily: "Oswald, sans-serif",
                fontSize: 36,
                fontWeight: 700,
                letterSpacing: 1.4,
                lineHeight: 0.9,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              LAP {String(lap).padStart(2, "0")}
              {totalLaps > 0 && (
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
              {modeLabel} · {trackName}
            </div>
          </div>
          <div
            style={{
              background: ST.accent,
              color: "#fff",
              fontFamily: "Oswald, sans-serif",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 2,
              padding: "4px 10px",
              clipPath: clip.gearSlash,
            }}
          >
            LIVE
          </div>
        </div>
      </div>

      {/* Driver rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {order.map((id, idx) => {
          const d = rosterById[id];
          if (!d) return null;

          const dv = drivers[id]?.derived;
          const tel = drivers[id]?.telemetry;
          const isLeader = idx === 0;
          const isFocused = id === focusedId;

          // Gap: use 1-second throttled snapshot; fall back to live value before first snapshot
          const gap = gapSnapshot[id] ?? dv?.gapToAhead ?? 0;

          // Right column — race: gap/PIT/P1; qualifying/practice: best lap time
          const rightText = isRace
            ? isLeader
              ? "P1"
              : dv?.pitted
                ? "PIT"
                : `+${gap.toFixed(3)}`
            : tel?.bestLaptime
              ? fmtLapMs(tel.bestLaptime)
              : "—";

          const rightColor = isRace
            ? isLeader
              ? ST.leader
              : dv?.pitted
                ? ST.fastest
                : ST.inkDim
            : isLeader
              ? ST.leader
              : ST.inkDim;

          return (
            <div
              key={id}
              style={{
                position: "relative",
                background: ST.surface,
                clipPath: clip.slashRight,
                display: "grid",
                gridTemplateColumns: "52px 28px 1fr 88px",
                alignItems: "center",
                gap: 10,
                padding: "5px 24px 5px 0",
                height: 38,
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
                  fontFamily: "Oswald, sans-serif",
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
                  fontFamily: '"JetBrains Mono", monospace',
                  fontWeight: 700,
                  letterSpacing: 1,
                  color: ST.inkDim,
                  textAlign: "center",
                }}
              >
                {d.country}
              </div>

              {/* Name */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  minWidth: 0,
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: "Oswald, sans-serif",
                    fontSize: 16,
                    fontWeight: 600,
                    letterSpacing: 0.6,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    lineHeight: 1,
                  }}
                >
                  {d.name}
                </div>
              </div>

              {/* Right column */}
              <div
                style={{
                  textAlign: "right",
                  fontFamily: "Oswald, sans-serif",
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
