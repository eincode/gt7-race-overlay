# AGENTS.md — GT7 Race Overlay

## Quick start

```bash
cp .env.example .env.local   # set VITE_SERVER_URL to your relay server
npm run dev                  # Vite dev server on port 5173
npm run build                # tsc -b && vite build — type errors block build
```

No lint, test, or formatter scripts. No README.

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server on port 5173 |
| `npm run build` | `tsc -b && vite build` — type-check first, fail on any error |
| `npm run preview` | Preview production build |

## Architecture

Two-page React 18 SPA — Vite 6, TypeScript 5.6 (strict), React Router v7:

```
main.tsx → App.tsx (BrowserRouter)
  /               → redirects to /control
  /control        → ControlPage (race director dashboard, Tailwind)
  /overlay/stencil → OverlayPage (OBS browser source, 1920×1080 transparent)
```

Both pages share `useOverlayWS()` — a single WebSocket connection to the telemetry relay server.

## Styling split — critical

- **Control panel** (`/control`): **Tailwind v4** classes via `@tailwindcss/vite` plugin.
- **Overlay** (`/overlay/stencil`): **Inline `style` props only**, using tokens from `src/components/overlays/stencil/tokens.ts`. Tailwind styles must NOT be added to overlay components — they bleed into OBS.

Google Fonts: Barlow Condensed, Oswald, JetBrains Mono (loaded via `<link>` in `index.html`).

## External dependency

This repo is **frontend only**. An external GT7 telemetry relay server provides:
- REST API at `VITE_SERVER_URL` (default `http://localhost:3000`)
- WebSocket at same host on path `/overlay` (URL derived by replacing `http://` → `ws://`)

Set `VITE_SERVER_URL` in `.env.local`. Copy `.env.example` as base.

## Data flow

1. Relay server aggregates telemetry from GT7 game clients.
2. **ControlPage** uses REST for mutations + WebSocket for state sync.
3. **OverlayPage** is read-only, WebSocket only.
4. Driver photos stored in `localStorage` under `gt7:driver_photos` (never sent to server).

### WebSocket messages

| Type | Frequency | Payload |
|------|-----------|---------|
| `roster` | Once at connect | `session` (id, status, mode, createdAt), `roster` (RosterEntry[]) |
| `state` | ~60 Hz | `raceState`, `drivers` (Record<id, DriverState>), `overlayState` |

Auto-reconnects with 3s delay. Uses `unmountedRef` to guard state updates after unmount.

### REST API (`src/lib/api.ts`)

Base URL from `VITE_SERVER_URL`, fallback `http://localhost:3000`.

| Function | Endpoint | Purpose |
|----------|----------|---------|
| `health()` | `GET /health` | Health check (polled every 5s by HealthCard) |
| `getSession()` | `GET /session` | Current session |
| `createSession(roster, mode, trackId)` | `POST /session` | Create session (driver IDs assigned 1..n) |
| `deleteSession()` | `DELETE /session` | Delete session, clears localStorage photos |
| `getDrivers()` | `GET /drivers` | Driver list (polled every 3s by DriversTable) |
| `setMode(mode)` | `POST /session/mode` | Change mode (Race/Qualifying/Practice) |
| `setStandings({visible?})` | `POST /overlay/standings` | Toggle standings (no driver selection) |
| `setSector({visible?, driverIds?})` | `POST /overlay/sector` | Toggle sector compare (0–2 drivers) |
| `setCarTelemetry({visible?, driverIds?})` | `POST /overlay/car-telemetry` | Toggle car telemetry (0–2 drivers) |
| `setDriverShowcase({visible?, driverId?})` | `POST /overlay/driver-showcase` | Toggle showcase (0–1 driver) |
| `setDriverTelemetry({visible?, driverId?})` | `POST /overlay/driver-telemetry` | Toggle driver telemetry (0–1 driver) |
| `wsUrl()` | — | WebSocket URL = base + `/overlay` |

## Key code patterns

- **WebSocket hook**: `useOverlayWS()` in `src/hooks/useOverlayWS.ts` — shared hook, auto-reconnects 3s, `unmountedRef` pattern.
- **localStorage**: Driver photos at `gt7:driver_photos`. Use `loadDriverPhotos()` / `saveDriverPhotos()` / `clearDriverPhotos()` from `lib/utils.ts`. `STShowcase` re-reads on every mount (re-mounts when visibility toggles). Cleared on session delete.
- **Optimistic UI**: `OverlayControls` applies local state immediately; server-sent WS state overrides on next tick.
- **TypeScript strict**: `noUnusedLocals` and `noUnusedParameters` in `tsconfig.app.json` — unused variables/imports block `npm run build`.
- **`tsconfig.json`**: project references pattern — root `tsconfig.json` uses `"references"` to `tsconfig.app.json` and `tsconfig.node.json`. Run `tsc -b` (build mode), not `tsc --project tsconfig.app.json`.

## Type system (`src/types/index.ts`)

| Type | Fields |
|------|--------|
| `SessionStatus` | `'waiting' \| 'racing' \| 'finished'` |
| `SessionMode` | `'race' \| 'qualifying' \| 'practice'` |
| `SectorStatus` | `'purple' \| 'green' \| 'red' \| 'neutral'` |
| `RosterEntry` | `id: number`, `name: string`, `country: string` (ISO alpha-2) |
| `Session` | `id`, `roster`, `status`, `mode`, `createdAt` |
| `DriverTelemetry` | Raw GT7 data: `lapCount`, `speed` (m/s), `EngineRPM`, `minAlertRPM`, `maxAlertRPM`, `gears`, `currentGear`, `suggestedGear`, `throttle` (0–255), `brake` (0–255), `fuelLevel` (L), `fuelCapacity` (L), `tyreTemp` [FL,FR,RL,RR] (°C), `carCategory`, `carCode`, `bestLaptime` (ms), `lastLaptime` (ms), `currentLap` (ms), `RaceStartPosition`, `steeringAngle?` (optional, degrees) |
| `DerivedData` | Server-computed: `rank`, `gapToLeader`, `gapToAhead`, `arcFraction`, `pitted`, `currentSector` (0-indexed), `sectors[]` (ms, 0 = incomplete), `sectorStatus[]`, `bestLapSectors[]` |
| `DriverState` | `id`, `connected`, `lastSeen`, `telemetry: DriverTelemetry`, `derived: DerivedData` |
| `RaceState` | `mode`, `trackId`, `sectorCount`, `lap`, `totalLaps`, `dayProgression`, `order: number[]` (driver IDs by position) |
| `OverlayState` | Panel visibility: `standings`, `sector`, `carTelemetry`, `driverShowcase`, `driverTelemetry` (each with `visible` + optional driver IDs) |
| `OverlayData` | Aggregated: `session`, `roster`, `raceState`, `drivers: Record<number, DriverState>`, `focusedId` (leader), `overlayState` |

## Utilities (`src/lib/utils.ts`)

| Function | In → Out | Notes |
|----------|----------|-------|
| `fmtLapMs(ms)` | ms → `"M:SS.mmm"` | `"—:—.—"` for invalid |
| `fmtSectorMs(ms)` | ms → `"SS.mmm"` | `"—"` for invalid |
| `msToKmh(mps)` | m/s → km/h | × 3.6 |
| `bytePct(v)` | 0–255 → 0–100 | Throttle/brake |
| `tireTempColor(c)` | °C → OKLCH | 5-threshold: blue <65, cyan 65–84, green 85–104, amber 105–119, red ≥120 |
| `fmtTrackName(slug)` | `"trial-mountain"` → `"TRIAL MOUNTAIN"` | |
| `fmtTimestamp(ms)` | Unix ms → locale time string | |
| `fmtTimeOfDay(fraction)` | 0.0–1.0 → `"HH:MM"` | Day progression |
| `categoryInfo(cat)` | category → `{color, text}` | GR1–GR4, GRX, N-class |
| `createRosterLookup(roster)` | RosterEntry[] → `Record<id, RosterEntry>` | O(1) lookup by ID |
| `getDriverPosition(order, id)` | order + id → 1-indexed position | centralizes `+1` offset |
| `loadDriverPhotos()` | — → `Record<number, string>` | Parses localStorage |
| `saveDriverPhotos(photos)` | void | Writes localStorage |
| `clearDriverPhotos()` | void | Removes localStorage key |

### Car category colors

| Category | Color |
|----------|-------|
| GR1 | `#f6c945` (gold) |
| GR2 | `#ff7a00` (orange) |
| GR3 | `#ff3344` (red) |
| GR4 | `#e9e9e9` (white) |
| GRX | `#a45dff` (purple) |
| N100–N600 | `#3da9ff` (blue) |

## Data libraries

- **`countryList.ts`**: 173 ISO 3166-1 countries, sorted alphabetically. `countryFlag(code)` → flag emoji, `getCountryByCode(code)` → case-insensitive lookup.
- **`carList.ts`**: 565 GT7 cars embedded as CSV (`ID,Name,MakerID`), parsed at import.

## Design tokens (`src/components/overlays/stencil/tokens.ts`)

### Fonts (`FONT` object)

| Token | Value | Usage |
|-------|-------|-------|
| `title` | `'Oswald, sans-serif'` | Headings, numbers, badges |
| `mono` | `'"JetBrains Mono", monospace'` | Labels, codes, metadata |
| `body` | `'"Barlow Condensed", system-ui, sans-serif'` | Panel root containers |

### Colors (`ST` object)

| Token | Value |
|-------|-------|
| `surface` | `rgba(8,8,11,0.78)` |
| `surfaceSolid` | `#0a0a0d` |
| `ink` | `#f4f4f6` |
| `inkDim` | `rgba(244,244,246,0.55)` |
| `inkVeryDim` | `rgba(244,244,246,0.28)` |
| `accent` | `#ff3344` |
| `accentDark` | `#a31a26` |
| `leader` | `#f6c945` (gold) |
| `gain` | `oklch(0.78 0.18 145)` (green) |
| `loss` | `oklch(0.65 0.22 25)` (red) |
| `fastest` | `oklch(0.65 0.22 305)` (purple) |

### Clip-path presets (`clip` object)

`slashRight`, `slashLeft`, `slashBoth`, `gearSlash`, `smallSlash` — geometric corner cuts.

### Helpers

- `stripes`: repeating diagonal gradient for panel headers.
- `sectorColor(status)`: `'purple'` → fastest, `'green'` → gain, `'red'` → loss, default → `#1a1a20`.

## Key behaviors & edge cases

- **Gap throttling**: `STStandings` snapshots `gapToAhead` once per second in race mode. Resets timer on mode switch.
- **Gap hiding**: Non-leader with `gapToLeader === 0` AND live `gapToAhead === 0` → `"—"` (not `+0.000`).
- **Sector freeze**: `STCurrentSector` freezes times for 10s after driver B crosses a sector line. A = higher-standing driver, B = lower. Delta = B − A, green if B faster, red if slower.
- **Gear shift indicator**: Gold up-arrow pulses when `suggestedGear > currentGear` AND RPM > `minAlertRPM`. Gear `0` displays as `"N"`.
- **Steering angle**: Optional `steeringAngle` field. When absent, `STDriverTelemetry` shows centred neutral. Raw ±90° normalized to 0–100% L/R track.
- **Country picker**: Filters 173 countries by name/code via `onMouseDown` (prevents blur races), caps results at 40.
- **Car picker**: Same pattern as country picker, 565 cars.
- **keyboard shortcuts enabled**: on the control page, when not in an input/select/textarea. `Alt+1`–`5` toggle overlay panels.
- **Speed**: Raw `speed` is m/s — convert with `msToKmh()` (× 3.6) for display.
- **Throttle/brake**: Raw values 0–255 — convert with `bytePct()` for 0–100% display.

## Directory map

```
src/
  main.tsx               → entry point
  App.tsx                → BrowserRouter with 3 routes
  index.css              → Tailwind import, font config, overlay keyframes
  pages/ControlPage.tsx  → race director dashboard (Tailwind)
  pages/OverlayPage.tsx  → OBS overlay (inline styles)
  hooks/useOverlayWS.ts  → shared WebSocket hook
  components/control/
    SearchablePicker.tsx → generic searchable dropdown (used by CountryPicker, CarPicker)
    CountryPicker.tsx    → country selector (wraps SearchablePicker<Country>)
    CarPicker.tsx        → car selector (wraps SearchablePicker<Car>)
  components/overlays/stencil/
    index.tsx            → STStencil shell (SWITCH-based panel visibility)
    STStandings.tsx      → top-left, 400px, lap counter + driver order
    STCurrentSector.tsx  → bottom-left, 620px, live sector timing comparison
    STCurrentSector/
      index.tsx            → main STCurrentSector export (UI only)
      useCurrentSector.ts  → data processing hook (phase machine, sector crossing)
      DriverSide.tsx       → single-driver side column (name + time + delta)
    STCarCompare.tsx     → bottom-right, 700px, telemetry side-by-side
    STCarCompare/
      index.tsx          → main STCarCompare export
      Side.tsx           → one driver's telemetry column
      InputBar.tsx       → throttle/brake progress bar
      TireTemp.tsx       → tire temperature cell
    STDriverTelemetry.tsx → top-right, 300px, single-driver throttle/brake/RPM
    STShowcase.tsx       → bottom-center, 560px, driver spotlight
    STSectorCompare.tsx  → sector time display (used by STCurrentSector)
    STPanelHeader.tsx    → shared panel header (accent bar + title + status)
    Badge.tsx            → shared clip-pathed pill badge
    tokens.ts            → ST colors, FONT, clips, stripes, sectorColor()
  hooks/
    useOverlayWS.ts     → shared WebSocket hook
    useClickOutside.ts  → click-outside-to-close helper
    useGearInfo.ts      → gear shift indicator logic
    useRPMInfo.ts       → RPM calculations (pct of max + alert range)
  lib/
    api.ts               → REST client + wsUrl()
    utils.ts             → formatters, converters, roster/position/photos helpers
    carList.ts           → 565 cars static data
    countryList.ts       → 173 countries static data
  types/index.ts         → all TypeScript types
assets/car_thumbnails/   → 565 PNGs named car{ID}.png (not yet referenced)
```
