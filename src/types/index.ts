export type SessionStatus = 'waiting' | 'racing' | 'finished';
export type SessionMode   = 'race' | 'qualifying' | 'practice';
export type SectorStatus  = 'purple' | 'green' | 'red' | 'neutral';

export interface RosterEntry {
  id:      number;
  name:    string;
  country: string;
}

export interface Session {
  id: string;
  roster: RosterEntry[];
  status: SessionStatus;
  mode: SessionMode;
  createdAt: number;
}

// ── Overlay panel visibility (server-driven) ────────────────────────────────

export interface OverlayState {
  standings:      { visible: boolean };
  sector:         { visible: boolean; driverIds: number[] };  // 0–2 IDs
  carTelemetry:   { visible: boolean; driverIds: number[] };  // 0–2 IDs
  driverShowcase: { visible: boolean; driverId: number | null };
}

export interface DriverTelemetry {
  lapCount: number;
  totalLaps: number;
  dayProgression: number;
  speed: number;
  EngineRPM: number;
  minAlertRPM: number;
  maxAlertRPM: number;
  gears: number;
  currentGear: number;
  suggestedGear: number;
  throttle: number;
  brake: number;
  fuelLevel: number;
  fuelCapacity: number;
  tyreTemp: [number, number, number, number];
  carCategory: string;
  carCode: number;
  bestLaptime: number;
  lastLaptime: number;
  currentLap: number;
  RaceStartPosition: number;
  position: [number, number, number];
}

export interface DerivedData {
  rank: number;
  gapToLeader: number;
  gapToAhead: number;
  arcFraction: number;
  pitted: boolean;
  /** 0-indexed sector the driver is currently in; resets to 0 at each new lap. */
  currentSector: number;
  /** ms times from the last completed lap; 0 = not yet completed this lap. Length = sectorCount. */
  sectors: number[];
  sectorStatus: SectorStatus[];
  /** ms times from the driver's fastest lap in the current mode; [] until a lap completes. */
  bestLapSectors: number[];
}

export interface DriverState {
  id: number;
  connected: boolean;
  lastSeen: number;
  telemetry: DriverTelemetry | null;
  derived: DerivedData;
}

export interface RaceState {
  mode: SessionMode;
  trackId: string | null;
  sectorCount: number;
  lap: number;
  totalLaps: number;
  dayProgression: number;
  order: number[];
}

// ── WebSocket message shapes ────────────────────────────────────────────────

export interface RosterBroadcast {
  type: 'roster';
  session: Pick<Session, 'id' | 'status' | 'mode' | 'createdAt'>;
  roster: RosterEntry[];
}

export interface StateBroadcast {
  type: 'state';
  raceState: RaceState;
  drivers: Record<number, DriverState>;
  overlayState: OverlayState;
}

export type WSMessage = RosterBroadcast | StateBroadcast;

// ── Shared overlay prop types ───────────────────────────────────────────────

/** Aggregated live data passed to all overlay components. */
export interface OverlayData {
  session: Pick<Session, 'id' | 'status' | 'mode' | 'createdAt'> | null;
  roster: RosterEntry[];
  raceState: RaceState;
  drivers: Record<number, DriverState>;
  focusedId: number | null;
  overlayState: OverlayState;
}

// ── REST response shapes ────────────────────────────────────────────────────

export interface HealthResponse {
  ok: boolean;
  session: boolean;
  drivers: { total: number; connected: number };
  overlayClients: number;
}

export interface SessionResponse {
  session: Session;
}

export interface DriversListResponse {
  drivers: Array<{
    id: number;
    name: string;
    carCode: number;
    connected: boolean;
    lastSeen: number;
  }>;
}

export interface ApiError {
  error: string;
}
