import type { Transition, Variants } from "motion/react";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const COLLAPSED_TO_TOP_EDGE = "inset(0% 0% 100% 0%)";
const COLLAPSED_TO_LEFT_EDGE = "inset(0% 100% 0% 0%)";
const COLLAPSED_TO_RIGHT_EDGE = "inset(0% 0% 0% 100%)";
const COLLAPSED_TO_BOTTOM_EDGE = "inset(100% 0% 0% 0%)";
const UNCLIPPED = "inset(0% 0% 0% 0%)";
const TUCKED_BEHIND_PREVIOUS_BOX = "-100%";
const TUCKED_BEHIND_NEXT_BOX = "100%";

const LAP_BOX_WIPE_DURATION = 0.5;
const ROW_WIPE_DURATION = 0.7;
const ROW_STAGGER = 0.05;

interface Timing {
  duration: number;
  ease: readonly [number, number, number, number];
  delay: number;
}

const lapBoxTiming: Timing = { duration: LAP_BOX_WIPE_DURATION, ease: EASE_OUT_EXPO, delay: 0 };
const lapCounterTiming: Timing = { duration: 0.55, ease: EASE_OUT_EXPO, delay: 0.4 };
const raceNameTiming: Timing = { duration: 0.65, ease: EASE_OUT_EXPO, delay: 0.7 };

const headerDuration = Math.max(
  ...[lapBoxTiming, lapCounterTiming, raceNameTiming].map((timing) => timing.delay + timing.duration),
);

function playedBackwards(timing: Timing): Timing {
  return { ...timing, delay: headerDuration - (timing.delay + timing.duration) };
}

export interface RowPosition {
  fromTop: number;
  fromBottom: number;
}

function leaderboardRowTiming(staggerSlot: number): Timing {
  return { duration: ROW_WIPE_DURATION, ease: EASE_OUT_EXPO, delay: staggerSlot * ROW_STAGGER };
}

function delayedBy(timing: Timing, seconds: number): Transition {
  return { ...timing, delay: timing.delay + seconds };
}

export function leaderboardDuration(rowCount: number) {
  if (rowCount === 0) return 0;
  return (rowCount - 1) * ROW_STAGGER + ROW_WIPE_DURATION;
}

export const lapBoxWipe: Variants = {
  hidden: { clipPath: COLLAPSED_TO_TOP_EDGE },
  visible: { clipPath: UNCLIPPED, transition: lapBoxTiming },
  exit: (leaderboardExitDuration: number) => ({
    clipPath: COLLAPSED_TO_TOP_EDGE,
    transition: delayedBy(playedBackwards(lapBoxTiming), leaderboardExitDuration),
  }),
};

export const lapCounterSlideFromBehindLapBox: Variants = {
  hidden: { x: TUCKED_BEHIND_PREVIOUS_BOX },
  visible: { x: 0, transition: lapCounterTiming },
  exit: (leaderboardExitDuration: number) => ({
    x: TUCKED_BEHIND_PREVIOUS_BOX,
    transition: delayedBy(playedBackwards(lapCounterTiming), leaderboardExitDuration),
  }),
};

export const raceNameSlideFromBehindLapCounter: Variants = {
  hidden: { x: TUCKED_BEHIND_PREVIOUS_BOX },
  visible: { x: 0, transition: raceNameTiming },
  exit: (leaderboardExitDuration: number) => ({
    x: TUCKED_BEHIND_PREVIOUS_BOX,
    transition: delayedBy(playedBackwards(raceNameTiming), leaderboardExitDuration),
  }),
};

export const leaderboardRowWipe: Variants = {
  hidden: { clipPath: COLLAPSED_TO_LEFT_EDGE },
  visible: ({ fromTop }: RowPosition) => ({
    clipPath: UNCLIPPED,
    transition: delayedBy(leaderboardRowTiming(fromTop), LAP_BOX_WIPE_DURATION),
  }),
  exit: ({ fromBottom }: RowPosition) => ({
    clipPath: COLLAPSED_TO_LEFT_EDGE,
    transition: leaderboardRowTiming(fromBottom),
  }),
};

/** Rows slide to their new slot when the order changes (an overtake). */
export const rowReorder: Transition = {
  layout: { duration: 0.65, ease: [0.65, 0, 0.35, 1] },
};

/**
 * Exit delay for a header that ends at the counter box (no race-name box):
 * subtracts the race name's slot from the backwards timings, so the counter
 * starts leaving as soon as `afterSeconds` is up instead of idling first.
 */
export function shortHeaderExitDelay(afterSeconds: number) {
  const raceNameSlot = headerDuration - (lapCounterTiming.delay + lapCounterTiming.duration);
  return afterSeconds - raceNameSlot;
}

// ── Mirrored pieces either side of a centre box (sector compare) ────────────

export type Side = "left" | "right";

/** `custom` for the mirrored variants: which side of the centre box, and the exit delay. */
export interface SideCustom {
  side: Side;
  exitDelay: number;
}

const tuckedBehindCentre = (side: Side) =>
  side === "left" ? TUCKED_BEHIND_NEXT_BOX : TUCKED_BEHIND_PREVIOUS_BOX;
const collapsedTowardCentre = (side: Side) =>
  side === "left" ? COLLAPSED_TO_RIGHT_EDGE : COLLAPSED_TO_LEFT_EDGE;

/** Like the lap counter, but slides out either way from behind a centre box. */
export const sideSlideFromBehindCentre: Variants = {
  hidden: ({ side }: SideCustom) => ({ x: tuckedBehindCentre(side) }),
  visible: { x: 0, transition: lapCounterTiming },
  exit: ({ side, exitDelay }: SideCustom) => ({
    x: tuckedBehindCentre(side),
    transition: delayedBy(playedBackwards(lapCounterTiming), exitDelay),
  }),
};

/** Like a leaderboard row, but wipes outward from the centre box on either side. */
export const sideWipeFromCentre: Variants = {
  hidden: ({ side }: SideCustom) => ({ clipPath: collapsedTowardCentre(side) }),
  visible: {
    clipPath: UNCLIPPED,
    transition: delayedBy(leaderboardRowTiming(0), LAP_BOX_WIPE_DURATION),
  },
  exit: ({ side }: SideCustom) => ({
    clipPath: collapsedTowardCentre(side),
    transition: leaderboardRowTiming(0),
  }),
};

// ── Driver showcase ─────────────────────────────────────────────────────────

/** Rises out of the name bar below it, in the race name's slot of the header timings. */
export const photoRiseFromNameBar: Variants = {
  hidden: { clipPath: COLLAPSED_TO_BOTTOM_EDGE },
  visible: { clipPath: UNCLIPPED, transition: raceNameTiming },
  exit: (exitDelay: number) => ({
    clipPath: COLLAPSED_TO_BOTTOM_EDGE,
    transition: delayedBy(playedBackwards(raceNameTiming), exitDelay),
  }),
};

// ── Track map ───────────────────────────────────────────────────────────────

/** A lone box wiping down from its top edge on the lap box's timing, and back up once `exitDelay` is up. */
export const boxWipeDown: Variants = {
  hidden: { clipPath: COLLAPSED_TO_TOP_EDGE },
  visible: { clipPath: UNCLIPPED, transition: lapBoxTiming },
  exit: (exitDelay: number) => ({
    clipPath: COLLAPSED_TO_TOP_EDGE,
    transition: { ...lapBoxTiming, delay: exitDelay },
  }),
};

// ── Battle ──────────────────────────────────────────────────────────────────

/** A bar under the header dropping down from its top edge, in the race name's slot of the header timings. */
export const barDropFromAbove: Variants = {
  hidden: { clipPath: COLLAPSED_TO_TOP_EDGE },
  visible: { clipPath: UNCLIPPED, transition: raceNameTiming },
  exit: (exitDelay: number) => ({
    clipPath: COLLAPSED_TO_TOP_EDGE,
    transition: delayedBy(playedBackwards(raceNameTiming), exitDelay),
  }),
};
