import { useEffect, useRef, useState } from 'react';
import type { OverlayData, RosterEntry } from '../../../../types';
import { createRosterLookup, getDriverPosition } from '../../../../lib/utils';

interface DriverTracking {
  prevCurrentSector: number;
  sectorStartLapMs: number;
}

export type Phase =
  | { kind: 'live' }
  | { kind: 'frozen'; bTimeMs: number; aTimeMs: number; deltaMs: number; sectorIdx: number };

const HOLD_MS = 10_000;

/** Prefer server-provided value; fall back to elapsed-timer difference. */
function bestSectorTime(fromServer: number, lapNow: number, lapEntry: number): number {
  if (fromServer > 0) return fromServer;
  const elapsed = lapNow - lapEntry;
  return elapsed > 0 ? elapsed : 0;
}

export interface CurrentSectorData {
  aId: number;
  bId: number;
  dA: RosterEntry;
  dB: RosterEntry;
  posA: number;
  posB: number;
  displaySectorIdx: number;
  aDisplayMs: number | null;
  bDisplayMs: number | null;
  aColor: string;
  bColor: string;
  deltaMs: number | null;
  isBFaster: boolean;
  sectorCount: number;
}

export function useCurrentSector(state: OverlayData): CurrentSectorData | null {
  const { roster, raceState, drivers } = state;
  const { mode, sectorCount, order } = raceState;
  const { driverIds } = state.overlayState.sector;

  const rawId0 = driverIds[0];
  const rawId1 = driverIds[1];

  const pos0 = rawId0 !== undefined ? order.indexOf(rawId0) : Infinity;
  const pos1 = rawId1 !== undefined ? order.indexOf(rawId1) : Infinity;
  const aIsId0 = pos0 <= pos1;

  const drv0State = rawId0 !== undefined ? drivers[rawId0] : undefined;
  const drv1State = rawId1 !== undefined ? drivers[rawId1] : undefined;

  const track0Ref = useRef<DriverTracking | null>(null);
  const track1Ref = useRef<DriverTracking | null>(null);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseRef = useRef<Phase>({ kind: 'live' });

  const [phase, setPhase] = useState<Phase>({ kind: 'live' });
  phaseRef.current = phase;

  // Reset on driver pair change
  useEffect(() => {
    track0Ref.current = null;
    track1Ref.current = null;
    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    setPhase({ kind: 'live' });
  }, [rawId0, rawId1]);

  // Sector crossing detection
  useEffect(() => {
    if (rawId0 === undefined || rawId1 === undefined || sectorCount === 0) return;
    if (!drv0State || !drv1State) return;

    const drvA = aIsId0 ? drv0State : drv1State;
    const drvB = aIsId0 ? drv1State : drv0State;
    const trackA = aIsId0 ? track0Ref : track1Ref;
    const trackB = aIsId0 ? track1Ref : track0Ref;

    const curSectorA = drvA.derived.currentSector;
    const curSectorB = drvB.derived.currentSector;
    const curLapA = drvA.telemetry?.currentLap ?? 0;
    const curLapB = drvB.telemetry?.currentLap ?? 0;

    if (!trackA.current) {
      trackA.current = { prevCurrentSector: curSectorA, sectorStartLapMs: curLapA };
    }
    if (!trackB.current) {
      trackB.current = {
        prevCurrentSector: curSectorB,
        sectorStartLapMs: drvB.derived.sectorStartLapT ?? curLapB,
      };
    }

    const prevSectorA = trackA.current.prevCurrentSector;
    const prevSectorB = trackB.current.prevCurrentSector;
    const prevLapA = trackA.current.sectorStartLapMs;
    const prevLapB = trackB.current.sectorStartLapMs;

    const aCrossed = curSectorA !== prevSectorA;
    const bCrossed = curSectorB !== prevSectorB;
    const bCompletedIdx = prevSectorB;

    trackA.current.prevCurrentSector = curSectorA;
    trackB.current.prevCurrentSector = curSectorB;
    if (aCrossed) trackA.current.sectorStartLapMs = curLapA;
    if (bCrossed) trackB.current.sectorStartLapMs = drvB.derived.sectorStartLapT ?? curLapB;

    const cur = phaseRef.current;

    if (cur.kind === 'live' && bCrossed) {
      const bTimeMs = bestSectorTime(
        drvB.derived.sectors[bCompletedIdx] ?? 0,
        curLapB, prevLapB,
      );

      if (bTimeMs > 0) {
        const aRecorded = mode === 'qualifying'
          ? (drvA.derived.bestLapSectors[bCompletedIdx] ?? 0)
          : (drvA.derived.sectors[bCompletedIdx] ?? 0);

        const aTimeMs = aRecorded > 0
          ? aRecorded
          : Math.max(0, curLapA - prevLapA);

        if (aTimeMs > 0) {
          if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
          setPhase({
            kind: 'frozen',
            bTimeMs,
            aTimeMs,
            deltaMs: bTimeMs - aTimeMs,
            sectorIdx: bCompletedIdx,
          });
          clearTimerRef.current = setTimeout(() => setPhase({ kind: 'live' }), HOLD_MS);
        }
      }
    }
  }, [drv0State, drv1State, sectorCount, mode, order, aIsId0, rawId0, rawId1]);

  // Early returns
  if (driverIds.length < 2 || sectorCount === 0) return null;
  if (rawId0 === undefined || rawId1 === undefined) return null;

  const aId = aIsId0 ? rawId0 : rawId1;
  const bId = aIsId0 ? rawId1 : rawId0;
  const drvA = drivers[aId];
  const drvB = drivers[bId];
  if (!drvA || !drvB) return null;

  const rosterById = createRosterLookup(roster);
  const dA = rosterById[aId];
  const dB = rosterById[bId];
  if (!dA || !dB) return null;

  const posA = getDriverPosition(order, aId);
  const posB = getDriverPosition(order, bId);

  const trackACur = (aIsId0 ? track0Ref : track1Ref).current;
  const trackBCur = (aIsId0 ? track1Ref : track0Ref).current;

  const displaySectorIdx =
    phase.kind === 'live' ? drvB.derived.currentSector : phase.sectorIdx;

  const aRecordedMs = mode === 'qualifying'
    ? (drvA.derived.bestLapSectors[displaySectorIdx] ?? 0)
    : (drvA.derived.sectors[displaySectorIdx] ?? 0);

  const aShowLive = aRecordedMs === 0;
  const aLiveMs = aShowLive && trackACur
    ? Math.max(0, (drvA.telemetry?.currentLap ?? 0) - trackACur.sectorStartLapMs)
    : null;

  const bLiveMs = phase.kind === 'live' && trackBCur
    ? Math.max(0, (drvB.telemetry?.currentLap ?? 0) - trackBCur.sectorStartLapMs)
    : null;

  const aDisplayMs: number | null =
    phase.kind === 'frozen' ? phase.aTimeMs :
    aRecordedMs > 0 ? aRecordedMs : aLiveMs;

  const bDisplayMs: number | null =
    phase.kind === 'live' ? bLiveMs : phase.bTimeMs;

  const deltaMs = phase.kind === 'frozen' ? phase.deltaMs : null;
  const isBFaster = deltaMs !== null && deltaMs < 0;
  const aColor = aShowLive && phase.kind !== 'frozen' ? 'dim' : 'ink';
  const bColor = phase.kind === 'frozen' ? (isBFaster ? 'gain' : 'loss') : 'dim';

  return {
    aId, bId, dA, dB, posA, posB,
    displaySectorIdx,
    aDisplayMs, bDisplayMs,
    aColor, bColor,
    deltaMs, isBFaster,
    sectorCount,
  };
}
