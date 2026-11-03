import type { CSSProperties } from "react";
import type { SectorStatus } from "../../../types";

export const ACCENT_RED = "#E24A42";
export const SKY_BLUE = "#5CC8F5";

const LAP_BOX_OPACITY = 1;
const RADIUS = 4;
const BOX_HEIGHT = 32;
const GAP_BEFORE_RACE_NAME = 8;
const GAP_BETWEEN_HEADER_AND_LEADERBOARD = 8;

const DARK_FILL = "rgba(0,0,0,0.6)";
const POSITION_CELL_FILL = "rgba(0,0,0,0.85)";

const LEADERBOARD_WIDTH = 360;
const LEADERBOARD_ROW_GAP = 2;
const LEADERBOARD_GAP_WIDTH = 96;
const POSITION_CELL_WIDTH = 48;
const SLANT = 8;
const SLASH_THICKNESS = 5;

export function withOpacity(hex: string, opacity: number) {
  const alphaHex = Math.round(opacity * 255).toString(16).padStart(2, "0");
  return `${hex}${alphaHex}`;
}

const accentFill = withOpacity(ACCENT_RED, LAP_BOX_OPACITY);

const box: CSSProperties = {
  display: "flex",
  alignItems: "center",
  height: BOX_HEIGHT,
  padding: "4px 16px",
  color: "#fff",
};

const largeNumber: CSSProperties = {
  fontSize: "1.125rem",
  lineHeight: 1.75 / 1.125,
  fontWeight: 700,
};

export const S = {
  root: {
    width: "100%",
    height: "100%",
    boxSizing: "border-box",
    padding: 40,
    position: "relative",
    background: "transparent",
    fontFamily: "Montserrat, system-ui, sans-serif",
    fontWeight: 600,
  },
  panel: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: GAP_BETWEEN_HEADER_AND_LEADERBOARD,
  },
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  hiddenUntilPastPreviousBoxEdge: {
    overflow: "hidden",
  },
  lap: {
    ...box,
    background: accentFill,
    borderRadius: `${RADIUS}px 0 0 ${RADIUS}px`,
  },
  lapAlone: {
    ...box,
    background: accentFill,
    borderRadius: RADIUS,
  },
  counter: {
    ...box,
    gap: 8,
    background: DARK_FILL,
    borderRadius: `0 ${RADIUS}px ${RADIUS}px 0`,
  },
  counterNum: largeNumber,
  raceNameWithLeadingGap: {
    paddingLeft: GAP_BEFORE_RACE_NAME,
  },
  raceName: {
    ...box,
    background: DARK_FILL,
    borderRadius: RADIUS,
  },
} satisfies Record<string, CSSProperties>;

export const leaderboardStyles = {
  list: {
    display: "flex",
    flexDirection: "column",
    gap: LEADERBOARD_ROW_GAP,
    width: LEADERBOARD_WIDTH,
  },
  row: {
    display: "flex",
    gap: LEADERBOARD_ROW_GAP,
    height: BOX_HEIGHT,
    color: "#fff",
  },
  /** Position cell, slash and name joined into one box; the gap sits in its own box beside it. */
  driver: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    borderRadius: RADIUS,
    overflow: "hidden",
  },
  nameCell: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    marginLeft: -SLANT,
    paddingLeft: SLANT + 10,
    paddingRight: 14,
    background: DARK_FILL,
    clipPath: `polygon(${SLANT}px 0, 100% 0, 100% 100%, 0 100%)`,
  },
  name: {
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.02em",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  gap: {
    flexShrink: 0,
    width: LEADERBOARD_GAP_WIDTH,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingRight: 12,
    background: DARK_FILL,
    borderRadius: RADIUS,
    fontVariantNumeric: "tabular-nums",
  },
} satisfies Record<string, CSSProperties>;

export function positionCellStyle(isLeader: boolean): CSSProperties {
  return {
    ...largeNumber,
    flexShrink: 0,
    width: POSITION_CELL_WIDTH,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingRight: SLANT,
    background: isLeader ? accentFill : POSITION_CELL_FILL,
    clipPath: `polygon(0 0, 100% 0, calc(100% - ${SLANT}px) 100%, 0 100%)`,
  };
}

export function positionSlashStyle(isLeader: boolean): CSSProperties {
  return {
    flexShrink: 0,
    width: SLASH_THICKNESS + SLANT,
    marginLeft: -SLANT,
    background: isLeader ? POSITION_CELL_FILL : ACCENT_RED,
    clipPath: `polygon(${SLANT}px 0, 100% 0, calc(100% - ${SLANT}px) 100%, 0 100%)`,
  };
}

const TELEMETRY_WIDTH = 380;
const PEDAL_SEGMENT_HEIGHT = 6;
const PEDAL_SEGMENT_GAP = 2;
export const GEAR_CELL_WIDTH = 24;

export const telemetryStyles = {
  panel: {
    position: "absolute",
    bottom: 40,
    right: 40,
    width: TELEMETRY_WIDTH,
    display: "flex",
    flexDirection: "column",
    gap: GAP_BETWEEN_HEADER_AND_LEADERBOARD,
  },
  position: {
    ...box,
    ...largeNumber,
    minWidth: POSITION_CELL_WIDTH,
    justifyContent: "center",
    background: accentFill,
    borderRadius: `${RADIUS}px 0 0 ${RADIUS}px`,
  },
  nameSlot: {
    flex: 1,
    overflow: "hidden",
  },
  nameBox: {
    ...box,
    gap: 10,
    background: DARK_FILL,
    borderRadius: `0 ${RADIUS}px ${RADIUS}px 0`,
  },
  flag: {
    width: 24,
    height: 16,
    borderRadius: 2,
    objectFit: "cover",
  },
  name: {
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.02em",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  body: {
    display: "flex",
    alignItems: "center",
    padding: "16px 20px",
    background: DARK_FILL,
    borderRadius: RADIUS,
    color: "#fff",
  },
  inputs: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  divider: {
    alignSelf: "stretch",
    width: 1,
    margin: "0 20px",
    background: "rgba(255,255,255,0.3)",
  },
  dash: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  pedal: {
    display: "flex",
    flexDirection: "column-reverse",
    gap: PEDAL_SEGMENT_GAP,
    width: 14,
  },
  pedalSegment: {
    height: PEDAL_SEGMENT_HEIGHT,
    borderRadius: 1,
  },
  wheel: {
    width: 96,
    height: 96,
    display: "block",
  },
  rpmRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  rpmTrack: {
    flex: 1,
    height: 8,
    borderRadius: RADIUS,
    background: "rgba(255,255,255,0.15)",
    overflow: "hidden",
  },
  rpmFill: {
    height: "100%",
    background: "#fff",
    borderRadius: RADIUS,
  },
  shiftLight: {
    width: 14,
    height: 8,
    borderRadius: 2,
  },
  gearWindow: {
    overflow: "hidden",
    // Gears below the current one fade out to the left, as on the GT7 dash.
    maskImage: "linear-gradient(to right, transparent 0, #000 45%, #000 85%, transparent 100%)",
    WebkitMaskImage: "linear-gradient(to right, transparent 0, #000 45%, #000 85%, transparent 100%)",
  },
  gearStrip: {
    display: "flex",
    alignItems: "center",
    height: 36,
    transition: "transform 180ms ease-out",
  },
  gear: {
    flexShrink: 0,
    width: GEAR_CELL_WIDTH,
    textAlign: "center",
    fontSize: 18,
    fontWeight: 600,
    color: "rgba(255,255,255,0.55)",
  },
  speed: {
    fontSize: 56,
    fontWeight: 700,
    lineHeight: 1,
    textAlign: "center",
    fontVariantNumeric: "tabular-nums",
  },
  speedUnit: {
    fontSize: 13,
    textAlign: "center",
    color: "rgba(255,255,255,0.8)",
  },
} satisfies Record<string, CSSProperties>;

export function pedalSegmentStyle(lit: boolean, color: string): CSSProperties {
  return {
    ...telemetryStyles.pedalSegment,
    background: lit ? color : withOpacity(color, 0.18),
  };
}

export function currentGearStyle(): CSSProperties {
  return { ...telemetryStyles.gear, fontSize: 30, fontWeight: 700, color: SKY_BLUE };
}

export function shiftLightStyle(lit: boolean): CSSProperties {
  return {
    ...telemetryStyles.shiftLight,
    background: lit ? ACCENT_RED : withOpacity(ACCENT_RED, 0.3),
    boxShadow: lit ? `0 0 8px ${ACCENT_RED}` : "none",
  };
}

// ── Sector compare ──────────────────────────────────────────────────────────

const SECTOR_PANEL_WIDTH = 880;
const SECTOR_CENTRE_WIDTH = 120;
const SECTOR_BODY_HEIGHT = 96;
const SECTOR_GAP = 2;

export const FASTEST_PURPLE = "#A970FF";
const PERSONAL_BEST_GREEN = "#4CD964";

const SECTOR_STATUS_FILL: Record<SectorStatus, string> = {
  purple: FASTEST_PURPLE,
  green: PERSONAL_BEST_GREEN,
  red: ACCENT_RED,
  neutral: "rgba(255,255,255,0.15)",
};

const DIM_TEXT = "rgba(255,255,255,0.55)";

export const sectorStyles = {
  panel: {
    position: "absolute",
    bottom: 40,
    // Centred with auto margins: motion owns `transform` on its elements.
    left: 0,
    right: 0,
    margin: "0 auto",
    width: SECTOR_PANEL_WIDTH,
    display: "grid",
    gridTemplateColumns: `1fr ${SECTOR_CENTRE_WIDTH}px 1fr`,
    gridTemplateRows: `${BOX_HEIGHT}px ${SECTOR_BODY_HEIGHT}px`,
    columnGap: SECTOR_GAP,
    rowGap: SECTOR_GAP,
    color: "#fff",
  },
  centre: {
    gridColumn: 2,
    gridRow: "1 / 3",
    display: "flex",
    flexDirection: "column",
    borderRadius: RADIUS,
    overflow: "hidden",
  },
  centreLabel: {
    ...box,
    justifyContent: "center",
    flexShrink: 0,
    background: accentFill,
    fontSize: 13,
    letterSpacing: "0.12em",
  },
  centreBody: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginTop: SECTOR_GAP,
    background: DARK_FILL,
  },
  sectorNumber: {
    fontSize: 48,
    fontWeight: 700,
    lineHeight: 1,
  },
  sectorOf: {
    fontSize: 12,
    color: DIM_TEXT,
    marginTop: 2,
  },
  headerSlot: {
    overflow: "hidden",
  },
  header: {
    ...box,
    gap: 10,
    background: DARK_FILL,
    borderRadius: RADIUS,
  },
  headerPosition: {
    ...largeNumber,
    minWidth: 20,
    textAlign: "center",
  },
  headerDivider: {
    width: 1,
    height: 18,
    flexShrink: 0,
    background: "rgba(255,255,255,0.3)",
  },
  category: {
    flexShrink: 0,
    padding: "1px 6px",
    borderRadius: 2,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.04em",
  },
  name: {
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.02em",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  body: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "12px 20px",
    background: DARK_FILL,
    borderRadius: RADIUS,
  },
  info: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  carName: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  chips: {
    display: "flex",
    gap: 3,
  },
  chip: {
    width: 34,
    padding: "2px 0",
    borderRadius: 2,
    fontSize: 10,
    fontWeight: 700,
    textAlign: "center",
  },
  best: {
    fontSize: 12,
    color: DIM_TEXT,
    fontVariantNumeric: "tabular-nums",
  },
  times: {
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  time: {
    fontSize: 38,
    fontWeight: 700,
    lineHeight: 1,
    fontVariantNumeric: "tabular-nums",
  },
  delta: {
    fontSize: 20,
    fontWeight: 700,
    lineHeight: 1,
    fontVariantNumeric: "tabular-nums",
  },
} satisfies Record<string, CSSProperties>;

/** Coloured like the sector's status; the sector being compared gets a white outline. */
export function sectorChipStyle(status: SectorStatus, compared: boolean): CSSProperties {
  return {
    ...sectorStyles.chip,
    background: SECTOR_STATUS_FILL[status],
    color: status === "neutral" ? DIM_TEXT : "#fff",
    boxShadow: compared ? "inset 0 0 0 1.5px #fff" : "none",
  };
}

export function sectorTimeStyle(live: boolean): CSSProperties {
  return { ...sectorStyles.time, color: live ? DIM_TEXT : "#fff" };
}

export function sectorDeltaStyle(gained: boolean): CSSProperties {
  return { ...sectorStyles.delta, color: gained ? SKY_BLUE : ACCENT_RED };
}

export function bestLapStyle(fastest: boolean): CSSProperties {
  return { ...sectorStyles.best, color: fastest ? FASTEST_PURPLE : DIM_TEXT };
}

// ── Driver showcase ─────────────────────────────────────────────────────────

const SHOWCASE_WIDTH = 460;
const SHOWCASE_NAME_HEIGHT = 44;
const SHOWCASE_SUBTITLE_HEIGHT = 28;
const SHOWCASE_POSITION_WIDTH = 56;
const SHOWCASE_PHOTO_SIZE = 220;
const SHOWCASE_HEIGHT =
  SHOWCASE_PHOTO_SIZE + SHOWCASE_NAME_HEIGHT + SHOWCASE_SUBTITLE_HEIGHT + 2 * LEADERBOARD_ROW_GAP;

export const showcaseStyles = {
  panel: {
    position: "absolute",
    right: 40,
    // Vertically centred with auto margins (motion owns `transform`), which needs a fixed height.
    top: 0,
    bottom: 0,
    margin: "auto 0",
    height: SHOWCASE_HEIGHT,
    width: SHOWCASE_WIDTH,
    display: "flex",
    flexDirection: "column",
    gap: LEADERBOARD_ROW_GAP,
    color: "#fff",
  },
  photo: {
    alignSelf: "flex-end",
    width: SHOWCASE_PHOTO_SIZE,
    height: SHOWCASE_PHOTO_SIZE,
    objectFit: "cover",
    objectPosition: "center top",
    display: "block",
    borderRadius: RADIUS,
  },
  nameRow: {
    display: "flex",
    height: SHOWCASE_NAME_HEIGHT,
  },
  position: {
    width: SHOWCASE_POSITION_WIDTH,
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: accentFill,
    borderRadius: `${RADIUS}px 0 0 ${RADIUS}px`,
    fontSize: 28,
    fontWeight: 700,
  },
  nameSlot: {
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
  },
  nameBox: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "0 14px 0 18px",
    background: DARK_FILL,
    borderRadius: `0 ${RADIUS}px ${RADIUS}px 0`,
  },
  name: {
    flex: 1,
    fontSize: 22,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.02em",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  flag: {
    width: 36,
    height: 24,
    flexShrink: 0,
    borderRadius: 2,
    objectFit: "cover",
  },
  subtitleRow: {
    display: "flex",
    height: SHOWCASE_SUBTITLE_HEIGHT,
    borderRadius: RADIUS,
    overflow: "hidden",
    fontSize: 13,
  },
  psnId: {
    ...box,
    height: "100%",
    flexShrink: 0,
    minWidth: SHOWCASE_POSITION_WIDTH,
    justifyContent: "center",
    paddingRight: 16 + SLANT,
    background: POSITION_CELL_FILL,
    clipPath: `polygon(0 0, 100% 0, calc(100% - ${SLANT}px) 100%, 0 100%)`,
  },
  carName: {
    ...box,
    height: "100%",
    flex: 1,
    minWidth: 0,
    marginLeft: -SLANT,
    paddingLeft: SLANT + 12,
    background: DARK_FILL,
    clipPath: `polygon(${SLANT}px 0, 100% 0, 100% 100%, 0 100%)`,
  },
  subtitleText: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
} satisfies Record<string, CSSProperties>;

// ── Track map ───────────────────────────────────────────────────────────────

export const TRACK_MAP_WIDTH = 460;
export const TRACK_MAP_HEIGHT = 320;

/** Map colours: no panel behind it, so the road carries its own dark fill to read over the game. */
export const trackMapColors = {
  road: "#111114",
  /** Applied to the road group as a whole, so overlapping road quads don't stack up darker. */
  roadOpacity: 0.7,
  edge: "#ffffff",
  sector: ACCENT_RED,
  start: "#ffffff",
  leaderLine: "rgba(255,255,255,0.7)",
  tagFill: POSITION_CELL_FILL,
  leaderFill: accentFill,
  dot: "#ffffff",
  dotStroke: "#000000",
};

export const trackMapStyles = {
  map: {
    position: "absolute",
    top: 40,
    right: 40,
    width: TRACK_MAP_WIDTH,
    height: TRACK_MAP_HEIGHT,
  },
  layer: {
    position: "absolute",
    inset: 0,
  },
  svg: {
    display: "block",
    overflow: "visible",
  },
} satisfies Record<string, CSSProperties>;

// ── Battle (car telemetry toggle) ───────────────────────────────────────────

const BATTLE_WIDTH = 760;
const BATTLE_ROW_HEIGHT = 40;
const BATTLE_LABEL_HEIGHT = 26;
const BATTLE_POSITION_WIDTH = 72;
const BATTLE_GAP_WIDTH = 128;

export const battleStyles = {
  panel: {
    position: "absolute",
    bottom: 40,
    // Centred with auto margins: motion owns `transform` on its elements.
    left: 0,
    right: 0,
    margin: "0 auto",
    width: BATTLE_WIDTH,
    display: "grid",
    gridTemplateColumns: `${BATTLE_POSITION_WIDTH}px 1fr ${BATTLE_GAP_WIDTH}px 1fr ${BATTLE_POSITION_WIDTH}px`,
    gridTemplateRows: `${BATTLE_ROW_HEIGHT}px ${BATTLE_LABEL_HEIGHT}px`,
    columnGap: LEADERBOARD_ROW_GAP,
    rowGap: LEADERBOARD_ROW_GAP,
    color: "#fff",
  },
  position: {
    gridRow: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RADIUS,
  },
  positionText: {
    display: "flex",
    alignItems: "baseline",
  },
  positionNumber: {
    fontSize: 24,
    fontWeight: 700,
    lineHeight: 1,
  },
  positionSuffix: {
    fontSize: 13,
    fontWeight: 700,
    marginLeft: 1,
  },
  nameSlot: {
    gridRow: 1,
    overflow: "hidden",
  },
  nameBox: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "0 18px",
    background: DARK_FILL,
    borderRadius: RADIUS,
  },
  flag: {
    width: 27,
    height: 18,
    flexShrink: 0,
    borderRadius: 2,
    objectFit: "cover",
  },
  name: {
    fontSize: 18,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.02em",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  gap: {
    gridColumn: 3,
    gridRow: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: POSITION_CELL_FILL,
    borderRadius: RADIUS,
    color: ACCENT_RED,
    fontSize: 24,
    fontWeight: 700,
    fontVariantNumeric: "tabular-nums",
  },
  label: {
    gridColumn: "2 / 5",
    gridRow: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.9)",
    borderRadius: RADIUS,
    color: "#111",
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
} satisfies Record<string, CSSProperties>;

export function battlePositionStyle(column: 1 | 5, isLeader: boolean): CSSProperties {
  return {
    ...battleStyles.position,
    gridColumn: column,
    background: isLeader ? accentFill : POSITION_CELL_FILL,
  };
}
