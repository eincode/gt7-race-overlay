import React, { useMemo } from "react";
import { useOverlayWS } from "../../../../hooks/useOverlayWS";
import { CAR_LIST, CAR_MAKERS } from "../../../../lib/carList";
import { fmtTrackName } from "../../../../lib/utils";

export type QualifyingResult = {
  name: string;
  country: string;
  car: string;
  /** best lap in seconds, e.g. 122.418 */
  lap: number;
};

const GRID = "62px 1fr 148px 116px";
/** header sequence runs first; rows follow */
const ROWS_START = 520;
const MONO = "'JetBrains Mono', monospace";
const DISPLAY = "Oswald, sans-serif";
const BODY = "Barlow, system-ui, sans-serif";

export function formatLap(seconds: number): string {
  if (seconds < 0) {
    return "OUTLAP";
  }
  const m = Math.floor(seconds / 60);
  const rest = seconds - m * 60;
  return `${m}:${rest < 10 ? "0" : ""}${rest.toFixed(3)}`;
}

const KEYFRAMES = `
@keyframes qso-pulseDot { 0%,100%{opacity:1} 50%{opacity:.2} }
@keyframes qso-rowIn { from { opacity:0; transform: translateX(56px) } to { opacity:1; transform: translateX(0) } }
@keyframes qso-wipeIn { from { opacity:0; transform: scaleY(0); transform-origin: top } to { opacity:1; transform: scaleY(1) } }
@keyframes qso-riseIn { from { opacity:0; transform: translateY(22px) } to { opacity:1; transform: translateY(0) } }
@keyframes qso-fadeIn { from { opacity:0 } to { opacity:1 } }
`;

const S = {
  stage: {
    width: 1920,
    height: 1080,
    overflow: "hidden",
    background: "#0b0b0c",
    fontFamily: BODY,
    color: "#e4e4e7",
    display: "flex",
    flexDirection: "column",
    padding: "40px 72px",
    gap: 20,
  },
  header: {
    display: "flex",
    alignItems: "flex-end",
    gap: 26,
    borderBottom: "2px solid rgba(255,255,255,.1)",
    paddingBottom: 16,
    flexShrink: 0,
  },
  accentBar: {
    width: 7,
    height: 62,
    borderRadius: 3,
    background: "#dc2626",
    flexShrink: 0,
    opacity: 0,
    animation: "qso-wipeIn .45s cubic-bezier(.2,.8,.25,1) forwards",
  },
  kicker: {
    fontFamily: MONO,
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: ".34em",
    color: "#dc2626",
    opacity: 0,
    animation: "qso-riseIn .5s cubic-bezier(.2,.8,.25,1) .12s forwards",
  },
  title: {
    margin: 0,
    fontFamily: DISPLAY,
    fontSize: 52,
    fontWeight: 600,
    letterSpacing: ".06em",
    lineHeight: 1.1,
    color: "#fafafa",
    opacity: 0,
    animation: "qso-riseIn .55s cubic-bezier(.2,.8,.25,1) .2s forwards",
  },
  trackBlock: {
    display: "flex",
    alignItems: "center",
    gap: 22,
    flexShrink: 0,
    opacity: 0,
    animation: "qso-riseIn .55s cubic-bezier(.2,.8,.25,1) .3s forwards",
  },
  track: {
    fontFamily: DISPLAY,
    fontSize: 30,
    fontWeight: 600,
    letterSpacing: ".06em",
    lineHeight: 1.25,
    color: "#f4f4f5",
  },
  trackMeta: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    fontFamily: MONO,
    fontSize: 16,
    letterSpacing: ".16em",
    color: "#8b8b93",
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 99,
    background: "#dc2626",
    animation: "qso-pulseDot 2s infinite",
  },
  board: {
    flex: 1,
    minHeight: 0,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 32,
  },
  column: { minWidth: 0, display: "flex", flexDirection: "column", gap: 10 },
  columnLabels: {
    flexShrink: 0,
    display: "grid",
    gridTemplateColumns: GRID,
    gap: 18,
    padding: "0 20px",
    fontFamily: MONO,
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: ".22em",
    color: "#6b6b73",
    opacity: 0,
    animation: "qso-fadeIn .4s ease-out .42s forwards",
  },
  pos: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: DISPLAY,
    fontSize: 36,
    fontWeight: 700,
    letterSpacing: ".02em",
    lineHeight: 1.25,
  },
  driver: { minWidth: 0, display: "flex", flexDirection: "column", gap: 3 },
  driverTop: { display: "flex", alignItems: "baseline", gap: 12, minWidth: 0 },
  name: {
    fontFamily: DISPLAY,
    fontSize: 30,
    fontWeight: 600,
    letterSpacing: ".04em",
    lineHeight: 1.4,
    color: "#fafafa",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  country: {
    fontFamily: MONO,
    fontSize: 13,
    letterSpacing: ".2em",
    color: "#8b8b93",
    flexShrink: 0,
  },
  car: {
    fontFamily: BODY,
    fontSize: 17,
    fontWeight: 600,
    letterSpacing: ".03em",
    lineHeight: 1.45,
    color: "#9b9ba3",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  lap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    fontFamily: MONO,
    fontSize: 26,
    fontWeight: 700,
    letterSpacing: ".01em",
    lineHeight: 1.35,
  },
  gap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    fontFamily: MONO,
    fontSize: 20,
    fontWeight: 600,
    letterSpacing: ".03em",
    lineHeight: 1.35,
  },
  footer: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    gap: 26,
    borderTop: "2px solid rgba(255,255,255,.1)",
    paddingTop: 14,
    opacity: 0,
    animation: "qso-riseIn .5s cubic-bezier(.2,.8,.25,1) forwards",
  },
  footerBrand: {
    fontFamily: DISPLAY,
    fontSize: 21,
    fontWeight: 600,
    letterSpacing: ".14em",
    lineHeight: 1.3,
    color: "#f4f4f5",
  },
  footerNote: {
    fontFamily: MONO,
    fontSize: 16,
    letterSpacing: ".18em",
    color: "#6b6b73",
  },
} satisfies Record<string, React.CSSProperties>;

function rowStyle(
  lead: boolean,
  index: number,
  stagger: number,
): React.CSSProperties {
  return {
    display: "grid",
    gridTemplateColumns: GRID,
    gap: 18,
    alignItems: "center",
    padding: "8px 20px",
    borderRadius: 13,
    flexShrink: 0,
    opacity: 0,
    animation: "qso-rowIn .45s cubic-bezier(.2,.8,.25,1) forwards",
    animationDelay: `${ROWS_START + index * stagger}ms`,
    background: lead
      ? "linear-gradient(90deg,rgba(220,38,38,.28),rgba(220,38,38,.06))"
      : "#17171a",
    border: lead
      ? "1px solid rgba(220,38,38,.55)"
      : "1px solid rgba(255,255,255,.07)",
  };
}

function ColumnLabels() {
  return (
    <div style={S.columnLabels}>
      <span>POS</span>
      <span>DRIVER · CAR</span>
      <span style={{ textAlign: "right" }}>BEST LAP</span>
      <span style={{ textAlign: "right" }}>GAP</span>
    </div>
  );
}

const STAGGER = 220;
const BRAND = "GT7 · RACE OVERLAY";

export default function QualifyingStandingsOverlay() {
  const { state } = useOverlayWS();
  const { session, roster, drivers, raceState } = state;

  const rows = useMemo(() => {
    const rosterById = new Map(roster.map((d) => [d.id, d]));
    const results: QualifyingResult[] = [];
    for (const [id, d] of Object.entries(drivers)) {
      const entry = rosterById.get(Number(id));
      const bestMs = d.telemetry?.bestLaptime ?? 0;
      if (!entry || bestMs <= 0) continue;
      const car = CAR_LIST.find((car) => car.id === d.telemetry?.carCode);
      results.push({
        name: entry.name,
        country: entry.country,
        car: `${car?.makerId ? (CAR_MAKERS as Record<number, string>)[car.makerId] : "—"} ${car?.name ?? "—"}`,
        lap: bestMs / 1000,
      });
    }
    const sorted = [...results].sort((a, b) => a.lap - b.lap);
    const best = sorted.length ? sorted[0].lap : 0;
    return sorted.map((d, i) => ({
      ...d,
      pos: i + 1,
      lapLabel: formatLap(d.lap),
      gapLabel: i === 0 ? "POLE" : `+${(d.lap - best).toFixed(3)}`,
      lead: i === 0,
      index: i,
    }));
  }, [drivers, roster]);

  const half = Math.ceil(rows.length / 2);
  const columns = [rows.slice(0, half), rows.slice(half)];
  const pole = rows.length ? rows[0].lapLabel : "—";

  const trackName = fmtTrackName(raceState.trackId);
  const trackMeta = `${raceState.sectorCount} SECTORS`;
  const kicker = session
    ? `QUALIFYING · ${session.status.toUpperCase()}`
    : "QUALIFYING";

  return (
    <div style={S.stage}>
      <style>{KEYFRAMES}</style>

      <header style={S.header}>
        <span style={S.accentBar} />
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <span style={S.kicker}>{kicker}</span>
          <h1 style={S.title}>QUALIFYING RESULTS</h1>
        </div>
        <div style={S.trackBlock}>
          <span style={S.track}>{trackName}</span>
          <span style={S.trackMeta}>
            <span style={S.liveDot} />
            {trackMeta}
          </span>
        </div>
      </header>

      <div style={S.board}>
        {columns.map((col, ci) => (
          <div key={ci} style={S.column}>
            <ColumnLabels />
            {col.map((r) => (
              <div
                key={`${r.name}-${r.pos}`}
                style={rowStyle(r.lead, r.index, STAGGER)}
              >
                <span style={{ ...S.pos, color: r.lead ? "#fff" : "#8b8b93" }}>
                  {r.pos}
                </span>
                <span style={S.driver}>
                  <span style={S.driverTop}>
                    <span style={S.name}>{r.name}</span>
                    <span style={S.country}>{r.country}</span>
                  </span>
                  <span style={S.car}>{r.car}</span>
                </span>
                <span style={{ ...S.lap, color: r.lead ? "#fff" : "#e4e4e7" }}>
                  {r.lapLabel}
                </span>
                <span
                  style={{ ...S.gap, color: r.lead ? "#f87171" : "#8b8b93" }}
                >
                  {r.gapLabel}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <footer
        style={{
          ...S.footer,
          animationDelay: `${ROWS_START + rows.length * STAGGER}ms`,
        }}
      >
        <span style={S.footerBrand}>{BRAND}</span>
        <span style={{ flex: 1 }} />
        <span
          style={S.footerNote}
        >{`${rows.length} DRIVERS CLASSIFIED · POLE ${pole}`}</span>
      </footer>
    </div>
  );
}
