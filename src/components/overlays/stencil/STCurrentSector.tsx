/**
 * STCurrentSector — Live sector-by-sector comparison between two drivers.
 *
 * A = whichever configured driver has the lower index in raceState.order
 *     (higher in standings). B = the other. Resolved every render.
 *
 * Driver A's reference time:
 *   qualifying → bestLapSectors[i]   (best-lap sector time, always fixed)
 *   race       → sectors[i]          (recorded sector time from current lap)
 *   fallback   → live timer          (shown in dim colour when recorded = 0)
 *
 * Phase machine:
 *   live   → B showing live timer; A showing recorded or live fallback.
 *   frozen → B crossed: freeze both times immediately, hold 10 s, back to live.
 *            No waiting for A — A's reference is always available (recorded or live).
 *
 * Sector crossing: derived.currentSector change.
 * Sector time:     prefer sectors[] (server); fallback currentLap − sectorStartLapMs.
 */
import { useEffect, useRef, useState } from 'react';
import type { OverlayData } from '../../../types';
import { fmtSectorMs } from '../../../lib/utils';
import { ST, clip } from './tokens';

interface Props {
  state: OverlayData;
}

interface DriverTracking {
  prevCurrentSector: number;
  /** telemetry.currentLap when the driver entered their current sector. */
  sectorStartLapMs: number;
}

type Phase =
  | { kind: 'live' }
  | { kind: 'frozen'; bTimeMs: number; aTimeMs: number; deltaMs: number; sectorIdx: number };

const HOLD_MS = 10_000;

function fmtDelta(ms: number): string {
  return `${ms >= 0 ? '+' : '-'}${(Math.abs(ms) / 1000).toFixed(3)}`;
}

/** Prefer the server-provided value; fall back to the elapsed-timer difference. */
function bestSectorTime(fromServer: number, lapNow: number, lapEntry: number): number {
  if (fromServer > 0) return fromServer;
  const elapsed = lapNow - lapEntry;
  return elapsed > 0 ? elapsed : 0;
}

export function STCurrentSector({ state }: Props) {
  const { roster, raceState, drivers } = state;
  const { mode, sectorCount, order } = raceState;
  const { driverIds } = state.overlayState.sector;

  const rawId0 = driverIds[0];
  const rawId1 = driverIds[1];

  // Auto A/B: lower order index = higher in standings = A
  const pos0   = rawId0 !== undefined ? order.indexOf(rawId0) : Infinity;
  const pos1   = rawId1 !== undefined ? order.indexOf(rawId1) : Infinity;
  const aIsId0 = pos0 <= pos1;

  // Pin effect deps to the two specific driver states, not the whole map
  const drv0State = rawId0 !== undefined ? drivers[rawId0] : undefined;
  const drv1State = rawId1 !== undefined ? drivers[rawId1] : undefined;

  // ── Refs ────────────────────────────────────────────────────────────────
  const track0Ref     = useRef<DriverTracking | null>(null);
  const track1Ref     = useRef<DriverTracking | null>(null);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseRef      = useRef<Phase>({ kind: 'live' });

  // ── State ────────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<Phase>({ kind: 'live' });
  phaseRef.current = phase;

  // ── Reset on driver pair change ──────────────────────────────────────────
  useEffect(() => {
    track0Ref.current = null;
    track1Ref.current = null;
    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    setPhase({ kind: 'live' });
  }, [rawId0, rawId1]);

  // ── Sector crossing detection (~60 Hz) ───────────────────────────────────
  useEffect(() => {
    if (rawId0 === undefined || rawId1 === undefined || sectorCount === 0) return;
    if (!drv0State || !drv1State) return;

    // Resolve A / B for this tick
    const drvA   = aIsId0 ? drv0State : drv1State;
    const drvB   = aIsId0 ? drv1State : drv0State;
    const trackA = aIsId0 ? track0Ref : track1Ref;
    const trackB = aIsId0 ? track1Ref : track0Ref;

    const curSectorA = drvA.derived.currentSector;
    const curSectorB = drvB.derived.currentSector;
    const curLapA    = drvA.telemetry?.currentLap ?? 0;
    const curLapB    = drvB.telemetry?.currentLap ?? 0;

    // Initialise tracking
    if (!trackA.current) {
      trackA.current = { prevCurrentSector: curSectorA, sectorStartLapMs: curLapA };
    }
    if (!trackB.current) {
      trackB.current = { prevCurrentSector: curSectorB, sectorStartLapMs: curLapB };
    }

    // Capture BEFORE updating
    const prevSectorA = trackA.current.prevCurrentSector;
    const prevSectorB = trackB.current.prevCurrentSector;
    const prevLapA    = trackA.current.sectorStartLapMs;
    const prevLapB    = trackB.current.sectorStartLapMs;

    const aCrossed      = curSectorA !== prevSectorA;
    const bCrossed      = curSectorB !== prevSectorB;
    const bCompletedIdx = prevSectorB;

    // Update tracking for next tick
    trackA.current.prevCurrentSector = curSectorA;
    trackB.current.prevCurrentSector = curSectorB;
    if (aCrossed) trackA.current.sectorStartLapMs = curLapA;
    if (bCrossed) trackB.current.sectorStartLapMs = curLapB;

    const cur = phaseRef.current;

    // ── B crossed a sector line → freeze immediately ─────────────────────
    if (cur.kind === 'live' && bCrossed) {
      // B's sector time
      const bTimeMs = bestSectorTime(
        drvB.derived.sectors[bCompletedIdx] ?? 0,
        curLapB, prevLapB,
      );

      if (bTimeMs > 0) {
        // A's recorded sector time (qualifying: best lap; race: current lap)
        const aRecorded = mode === 'qualifying'
          ? (drvA.derived.bestLapSectors[bCompletedIdx] ?? 0)
          : (drvA.derived.sectors[bCompletedIdx]        ?? 0);

        // Fall back to A's elapsed timer if no recorded time yet
        const aTimeMs = aRecorded > 0
          ? aRecorded
          : Math.max(0, curLapA - prevLapA);

        if (aTimeMs > 0) {
          if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
          setPhase({
            kind: 'frozen',
            bTimeMs,
            aTimeMs,
            deltaMs:  bTimeMs - aTimeMs,
            sectorIdx: bCompletedIdx,
          });
          clearTimerRef.current = setTimeout(() => setPhase({ kind: 'live' }), HOLD_MS);
        }
      }
    }

    // frozen: ignore crossings until the timer fires and resets to live

  }, [drv0State, drv1State, sectorCount, mode, order, aIsId0, rawId0, rawId1]);

  // ── Early returns (after all hooks) ─────────────────────────────────────
  if (driverIds.length < 2 || sectorCount === 0) return null;
  if (rawId0 === undefined || rawId1 === undefined) return null;

  const aId = aIsId0 ? rawId0 : rawId1;
  const bId = aIsId0 ? rawId1 : rawId0;
  const drvA = drivers[aId];
  const drvB = drivers[bId];
  if (!drvA || !drvB) return null;

  const rosterById = Object.fromEntries(roster.map(d => [d.id, d]));
  const dA = rosterById[aId];
  const dB = rosterById[bId];
  if (!dA || !dB) return null;

  const posA = order.indexOf(aId) + 1;
  const posB = order.indexOf(bId) + 1;

  const trackACur = (aIsId0 ? track0Ref : track1Ref).current;
  const trackBCur = (aIsId0 ? track1Ref : track0Ref).current;

  // Center column: live → B's current sector; frozen → the compared sector
  const displaySectorIdx =
    phase.kind === 'live' ? drvB.derived.currentSector : phase.sectorIdx;

  // A's recorded sector time (qualifying: best lap; race: current lap)
  const aRecordedMs = mode === 'qualifying'
    ? (drvA.derived.bestLapSectors[displaySectorIdx] ?? 0)
    : (drvA.derived.sectors[displaySectorIdx]        ?? 0);

  // A shows live timer only when no recorded time is available yet
  const aShowLive = aRecordedMs === 0;
  const aLiveMs = aShowLive && trackACur
    ? Math.max(0, (drvA.telemetry?.currentLap ?? 0) - trackACur.sectorStartLapMs)
    : null;

  // B's live timer (always counting in the live phase)
  const bLiveMs = phase.kind === 'live' && trackBCur
    ? Math.max(0, (drvB.telemetry?.currentLap ?? 0) - trackBCur.sectorStartLapMs)
    : null;

  // ── Final display values ─────────────────────────────────────────────────
  const aDisplayMs: number | null =
    phase.kind === 'frozen' ? phase.aTimeMs  :
    aRecordedMs > 0         ? aRecordedMs    : aLiveMs;

  const bDisplayMs: number | null =
    phase.kind === 'live' ? bLiveMs : phase.bTimeMs;

  const deltaMs   = phase.kind === 'frozen' ? phase.deltaMs : null;
  const isBFaster = deltaMs !== null && deltaMs < 0;

  // A: dim when showing live fallback, full white when recorded or frozen
  const aColor = aShowLive && phase.kind !== 'frozen' ? ST.inkDim : ST.ink;
  // B: dim while live, coloured when frozen
  const bColor = phase.kind === 'frozen' ? (isBFaster ? ST.gain : ST.loss) : ST.inkDim;

  return (
    <div style={{
      position: 'absolute',
      left: 28, bottom: 28,
      width: 620,
      fontFamily: '"Barlow Condensed", system-ui, sans-serif',
      color: ST.ink,
    }}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={{
        background: ST.surfaceSolid,
        padding: '8px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        clipPath: clip.slashRight,
        marginBottom: 2,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 4, height: 18, background: ST.accent, flexShrink: 0 }} />
          <span style={{
            fontFamily: 'Oswald, sans-serif',
            fontSize: 15, fontWeight: 700, letterSpacing: 3,
          }}>
            CURRENT SECTOR
          </span>
        </div>
        <span style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 10, color: ST.accent, letterSpacing: 2, fontWeight: 700,
        }}>
          ◆ LIVE
        </span>
      </div>

      {/* ── Main panel ──────────────────────────────────────────────────── */}
      <div style={{
        background: ST.surface,
        display: 'grid',
        gridTemplateColumns: '1fr 72px 1fr',
      }}>

        {/* Left — Driver A */}
        <div style={{
          padding: '14px 0 14px 16px',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              background: posA === 1 ? ST.leader : '#000',
              color: posA === 1 ? '#0a0a0d' : ST.ink,
              fontFamily: 'Oswald, sans-serif',
              fontSize: 13, fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
              padding: '2px 8px',
              clipPath: clip.smallSlash,
              flexShrink: 0,
            }}>
              P{posA}
            </div>
            <div style={{
              fontFamily: 'Oswald, sans-serif',
              fontSize: 18, fontWeight: 700, letterSpacing: 0.8,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {dA.name}
            </div>
          </div>

          {/* Sector time — right-aligned toward center */}
          <div style={{ textAlign: 'right', paddingRight: 10 }}>
            <div style={{
              fontFamily: 'Oswald, sans-serif',
              fontSize: 36, fontWeight: 700, lineHeight: 1,
              fontVariantNumeric: 'tabular-nums', letterSpacing: 0.6,
              color: aColor,
            }}>
              {aDisplayMs != null ? fmtSectorMs(aDisplayMs) : '—'}
            </div>
          </div>
        </div>

        {/* Center — sector label + number */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 2,
          borderLeft:  `1px solid ${ST.border}`,
          borderRight: `1px solid ${ST.border}`,
        }}>
          <div style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 9, fontWeight: 700, letterSpacing: 2.5,
            color: ST.inkVeryDim,
          }}>
            SECTOR
          </div>
          <div style={{
            fontFamily: 'Oswald, sans-serif',
            fontSize: 36, fontWeight: 700, lineHeight: 1,
            color: ST.accent,
          }}>
            {displaySectorIdx + 1}
          </div>
        </div>

        {/* Right — Driver B */}
        <div style={{
          padding: '14px 16px 14px 0',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
            <div style={{
              fontFamily: 'Oswald, sans-serif',
              fontSize: 18, fontWeight: 700, letterSpacing: 0.8,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {dB.name}
            </div>
            <div style={{
              background: '#000', color: ST.ink,
              fontFamily: 'Oswald, sans-serif',
              fontSize: 13, fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
              padding: '2px 8px',
              clipPath: clip.smallSlash,
              flexShrink: 0,
            }}>
              P{posB}
            </div>
          </div>

          {/* Sector time + delta — left-aligned toward center */}
          <div style={{ paddingLeft: 10 }}>
            <div style={{
              fontFamily: 'Oswald, sans-serif',
              fontSize: 36, fontWeight: 700, lineHeight: 1,
              fontVariantNumeric: 'tabular-nums', letterSpacing: 0.6,
              color: bColor,
            }}>
              {bDisplayMs != null ? fmtSectorMs(bDisplayMs) : '—'}
            </div>
            {deltaMs !== null && (
              <div style={{
                fontFamily: 'Oswald, sans-serif',
                fontSize: 20, fontWeight: 700, lineHeight: 1,
                fontVariantNumeric: 'tabular-nums', letterSpacing: 0.6,
                color: isBFaster ? ST.gain : ST.loss,
                marginTop: 4,
              }}>
                {fmtDelta(deltaMs)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
