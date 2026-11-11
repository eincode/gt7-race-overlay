import { useEffect, useRef, useState } from "react";
import type { DriverState, StandingsRow, StandingsSource } from "../types";

/**
 * Order and gap numbers refresh together at most this often, so gaps stay
 * readable and a battle for position doesn't replay the swap every frame.
 */
const STANDINGS_REFRESH_MS = 1000;

/** Name and gap label for a position the game reported no driver for. */
export const UNKNOWN_DRIVER_NAME = "Unknown driver";
export const UNKNOWN_GAP_TEXT = "---";

/** One standings row: rank, and seconds behind the leader / the car ahead (null when there is no gap). */
export interface StandingRow {
  /** Driver ID; negative (-rank) for an unknown-driver row, so it never matches a real driver. */
  id: number;
  rank: number;
  toLeader: number | null;
  toAhead: number | null;
  /** The server's own gap label from standingsV2 ("+2.986", "Leader"…); null when it sends none for this driver. */
  gapText: string | null;
  /** A position missing from the game's standings, filled so the ranks after it stay right. */
  unknown: boolean;
}

/** A slot in the base order: a driver ID, or null for a position no driver reported. */
type Slot = number | null;

/**
 * The ordered slots (leader first) for the chosen source: the game's
 * reported standingsV2 positions, or the server-inferred raceState.order.
 * In game order, a position no driver claims (e.g. 1 and 3 but no 2) becomes
 * a null slot. Falls back to raceState.order while standingsV2 is empty.
 */
function baseOrder(
  source: StandingsSource,
  order: readonly number[],
  standingsV2: readonly StandingsRow[],
): readonly Slot[] {
  if (source === "inferred" || standingsV2.length === 0) return order;
  const slots: Slot[] = [];
  let expected = 1;
  for (const row of [...standingsV2].sort((a, b) => a.position - b.position)) {
    for (; expected < row.position; expected++) slots.push(null);
    slots.push(Number(row.driverId));
    // Two drivers on the same position (mid-overtake) both keep their slot.
    expected = Math.max(expected, row.position + 1);
  }
  return slots;
}

/** Base order (leader first), then every driver it leaves out. Rank = index + 1. */
function rankedIds(
  order: readonly Slot[],
  drivers: Record<number, DriverState>,
): Slot[] {
  return [
    ...order,
    ...Object.keys(drivers)
      .map(Number)
      .filter((id) => !order.includes(id)),
  ];
}

/** The server sends 0 where it has no gap; only a positive one is real. */
const gapOrNull = (ranked: boolean, gap: number | undefined) =>
  ranked && gap && gap > 0 ? gap : null;

/**
 * Same as the phone app's toStandings: base order, then everyone it leaves
 * out; rank is the place in that list, drivers with no state entry are
 * skipped, and only drivers behind the leader and in the base order get a gap.
 * An empty game-order slot becomes an unknown-driver row.
 */
function computeStandings(
  raceOrder: readonly number[],
  drivers: Record<number, DriverState>,
  standingsV2: readonly StandingsRow[],
  source: StandingsSource,
): StandingRow[] {
  const order = baseOrder(source, raceOrder, standingsV2);
  const gapTexts = new Map(standingsV2.map((s) => [Number(s.driverId), s.gapText]));
  return rankedIds(order, drivers).flatMap((id, i): StandingRow[] => {
    if (id === null) {
      return [
        {
          id: -(i + 1),
          rank: i + 1,
          toLeader: null,
          toAhead: null,
          gapText: UNKNOWN_GAP_TEXT,
          unknown: true,
        },
      ];
    }
    const d = drivers[id];
    if (!d) return [];
    const ranked = i > 0 && i < order.length;
    return [
      {
        id,
        rank: i + 1,
        toLeader: gapOrNull(ranked, d.derived?.gapToLeader),
        toAhead: gapOrNull(ranked, d.derived?.gapToAhead),
        gapText: gapTexts.get(id) ?? null,
        unknown: false,
      },
    ];
  });
}

function sameStandings(a: StandingRow[], b: StandingRow[]): boolean {
  return (
    a.length === b.length &&
    a.every((x, i) => {
      const y = b[i];
      return (
        x.id === y.id &&
        x.rank === y.rank &&
        x.toLeader === y.toLeader &&
        x.toAhead === y.toAhead &&
        x.gapText === y.gapText
      );
    })
  );
}

/**
 * Standings snapshot (order + gaps, taken together) refreshed once a second
 * from the latest state frame. Drivers who join, and a change of `source`,
 * show up at the next snapshot.
 */
export function useStandingsSnapshot(
  order: readonly number[],
  drivers: Record<number, DriverState>,
  standingsV2: readonly StandingsRow[],
  source: StandingsSource,
): StandingRow[] {
  const [standings, setStandings] = useState(() =>
    computeStandings(order, drivers, standingsV2, source),
  );
  const latestRef = useRef({ order, drivers, standingsV2, source });

  useEffect(() => {
    latestRef.current = { order, drivers, standingsV2, source };
  }, [order, drivers, standingsV2, source]);

  useEffect(() => {
    const timer = setInterval(() => {
      const { order, drivers, standingsV2, source } = latestRef.current;
      const next = computeStandings(order, drivers, standingsV2, source);
      // Keep the old array when nothing changed so the panel doesn't re-render.
      setStandings((prev) => (sameStandings(prev, next) ? prev : next));
    }, STANDINGS_REFRESH_MS);
    return () => clearInterval(timer);
  }, []);

  return standings;
}

/**
 * Each driver's fastest valid lap (ms) this session. GT7 resets bestLaptime
 * to -1 on a new outlap, so once a driver has set a lap we keep their fastest
 * instead of dropping back to "OUTLAP". Forgotten when the session or mode
 * changes.
 */
export function useSessionBestLaps(
  drivers: Record<number, DriverState>,
  resetKey: string,
): Map<number, number> {
  const ref = useRef({ resetKey, laps: new Map<number, number>() });
  if (ref.current.resetKey !== resetKey) {
    ref.current = { resetKey, laps: new Map() };
  }
  // Idempotent per frame, so updating the ref during render is safe.
  const { laps } = ref.current;
  for (const [id, d] of Object.entries(drivers)) {
    const best = d.telemetry?.bestLaptime ?? 0;
    const kept = laps.get(Number(id));
    if (best > 0 && (kept === undefined || best < kept)) {
      laps.set(Number(id), best);
    }
  }
  return laps;
}

/** "+0.412" under a minute, "+1:02.345" above; "--" when there is no gap. */
export function formatGap(s: number | null | undefined): string {
  if (s == null) return "--";
  const m = Math.floor(s / 60);
  const rest = (s - m * 60).toFixed(3);
  return m > 0 ? `+${m}:${rest.padStart(6, "0")}` : `+${rest}`;
}
