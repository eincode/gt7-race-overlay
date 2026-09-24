import { createRosterLookup, fmtTrackName } from "../../../lib/utils";
import type { OverlayData } from "../../../types";
import { Badge } from "./Badge";
import { formatLap } from "./qualifying/result";
import { clip, FONT, panelMotion, ST, stripes } from "./tokens";

interface Props {
  state: OverlayData;
  isVisible: boolean;
}

export function STStandings({ state, isVisible }: Props) {
  const { roster, raceState } = state;
  const { mode, lap, totalLaps, trackId } = raceState;

  const rosterById = createRosterLookup(roster);
  const trackName = fmtTrackName(trackId);
  const isRace = mode === "race";
  // const modeLabel = mode.toUpperCase();

  // // ── Throttled gap snapshot (race mode only) ─────────────────────────────
  // const lastGapUpdateRef = useRef(0);
  // const [gapSnapshot, setGapSnapshot] = useState<Record<number, number>>({});

  // useEffect(() => {
  //   if (!isRace) {
  //     // Reset so switching back to race shows fresh values immediately
  //     lastGapUpdateRef.current = 0;
  //     return;
  //   }
  //   const now = Date.now();
  //   if (now - lastGapUpdateRef.current < GAP_THROTTLE_MS) return;
  //   lastGapUpdateRef.current = now;
  //   setGapSnapshot(
  //     Object.fromEntries(
  //       order.map((id) => [id, drivers[id]?.derived?.gapToAhead ?? 0]),
  //     ),
  //   );
  // }, [isRace, drivers, order]);

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
              {mode === "race"
                ? `LAP ${String(lap).padStart(2, "0")}`
                : mode.toLocaleUpperCase()}
              {mode === "race" && totalLaps > 0 && (
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
          <Badge letterSpacing={2}>LIVE</Badge>
        </div>
      </div>

      {/* Driver rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {state.standingsV2.map((d, idx) => {
          const id = d.driverId;
          const isLeader = d.position === 1;
          const isFocused = false;
          const { country, name } = rosterById[Number(id)];

          const rightColor = isRace
            ? isLeader
              ? ST.leader
              : ST.inkDim
            : ST.inkDim;

          const bestLap = formatLap(
            (state.drivers[Number(id)].telemetry?.bestLaptime ?? 0) / 1000,
          );
          const rightText = mode === "race" ? d.gapText : bestLap;
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
                  flexDirection: "column",
                  minWidth: 0,
                  justifyContent: "center",
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
