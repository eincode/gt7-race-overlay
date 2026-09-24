import type { RosterEntry } from '../types';

/** Format lap time from milliseconds → "M:SS.mmm". Returns "—:—.—" for invalid input. */
export function fmtLapMs(ms: number | null | undefined): string {
  if (ms == null || ms < 0) return '—:—.—';
  const total = Math.max(0, Math.floor(ms));
  const m = Math.floor(total / 60000);
  const s = Math.floor((total % 60000) / 1000);
  const mmm = total % 1000;
  return `${m}:${String(s).padStart(2, '0')}.${String(mmm).padStart(3, '0')}`;
}

/** Format a sector time from milliseconds → "SS.mmm". Returns "—" for invalid input. */
export function fmtSectorMs(ms: number | null | undefined): string {
  if (ms == null || ms < 0) return '—';
  return (ms / 1000).toFixed(3);
}

/** Format a 0.0–1.0 day-progression fraction → "HH:MM". */
export function fmtTimeOfDay(fraction: number | null | undefined): string {
  if (fraction == null || fraction < 0) return '--:--';
  const totalSec = Math.floor(fraction * 24 * 3600);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Convert m/s → km/h. */
export function msToKmh(mps: number): number {
  return mps * 3.6;
}

/** Convert a 0–255 byte value → percentage (0–100). */
export function bytePct(v: number): number {
  return Math.round((v / 255) * 100);
}

/** Map a tire temperature (°C) to a representative color string. */
export function tireTempColor(c: number | null | undefined): string {
  if (c == null) return '#777';
  if (c < 65) return 'oklch(0.65 0.18 250)';  // cold — blue
  if (c < 85) return 'oklch(0.75 0.17 200)';  // cool — cyan
  if (c < 105) return 'oklch(0.78 0.18 145)'; // optimal — green
  if (c < 120) return 'oklch(0.80 0.18 80)';  // hot — amber
  return 'oklch(0.65 0.22 25)';               // overheated — red
}

const CATEGORY_COLORS: Record<string, { color: string; text: string }> = {
  GR1:  { color: '#f6c945', text: '#0a0a0d' },
  GR2:  { color: '#ff7a00', text: '#0a0a0d' },
  GR3:  { color: '#ff3344', text: '#ffffff' },
  GR4:  { color: '#e9e9e9', text: '#0a0a0d' },
  GRX:  { color: '#a45dff', text: '#ffffff' },
  N100: { color: '#3da9ff', text: '#0a0a0d' },
  N200: { color: '#3da9ff', text: '#0a0a0d' },
  N300: { color: '#3da9ff', text: '#0a0a0d' },
  N400: { color: '#3da9ff', text: '#0a0a0d' },
  N500: { color: '#3da9ff', text: '#0a0a0d' },
  N600: { color: '#3da9ff', text: '#0a0a0d' },
};

export function categoryInfo(cat: string): { color: string; text: string } {
  return CATEGORY_COLORS[cat] ?? { color: '#777', text: '#fff' };
}

/** Format a trackId slug ("trial-mountain") to a display label ("TRIAL MOUNTAIN"). */
export function fmtTrackName(trackId: string | null): string {
  if (!trackId) return 'UNKNOWN TRACK';
  return trackId.replace(/-/g, ' ').toUpperCase();
}

/** Format a Unix ms timestamp as a locale time string. */
export function fmtTimestamp(ms: number): string {
  if (!ms) return '—';
  return new Date(ms).toLocaleTimeString();
}

/** localStorage key for the driver photo map ({ [driverId]: base64DataUrl }). */
export const DRIVER_PHOTOS_KEY = 'gt7:driver_photos';

export function loadDriverPhotos(): Record<number, string> {
  try {
    return JSON.parse(localStorage.getItem(DRIVER_PHOTOS_KEY) ?? '{}') as Record<number, string>;
  } catch {
    return {};
  }
}

export function saveDriverPhotos(photos: Record<number, string>): void {
  localStorage.setItem(DRIVER_PHOTOS_KEY, JSON.stringify(photos));
}

export function clearDriverPhotos(): void {
  localStorage.removeItem(DRIVER_PHOTOS_KEY);
}

/** Build a lookup map from roster array keyed by driver ID. */
export function createRosterLookup(roster: readonly RosterEntry[]): Record<number, RosterEntry> {
  return Object.fromEntries(roster.map((d) => [d.id, d]));
}

/** Get 1-indexed position of a driver in the current race order. */
export function getDriverPosition(order: readonly number[], driverId: number): number {
  return order.indexOf(driverId) + 1;
}
