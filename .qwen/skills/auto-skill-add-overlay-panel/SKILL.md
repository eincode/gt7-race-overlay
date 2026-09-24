---
name: add-overlay-panel
description: Recipe for adding a new overlay panel to the GT7 Race Overlay STENCIL direction — types, API, component, control panel toggle, and WebSocket defaults.
source: auto-skill
extracted_at: '2026-06-22T10:36:06.281Z'
---

# Add a new overlay panel

This project follows a consistent 7-step pattern for adding a new overlay panel to the STENCIL direction. Follow these steps in order.

## Step 1 — Types (`src/types/index.ts`)

Add the panel's state shape to `OverlayState`. Patterns:

- **Toggle-only panel** (no driver selection): `panelName: { visible: boolean }`
- **Single-driver panel**: `panelName: { visible: boolean; driverId: number | null }`
- **Multi-driver panel**: `panelName: { visible: boolean; driverIds: number[] }`

If the panel needs a telemetry field not yet in `DriverTelemetry`, add it there as an optional field (`fieldName?: type`) — the server may not send it yet, so make it optional and handle the fallback in the component.

## Step 2 — API client (`src/lib/api.ts`)

Add a method to the `api` object following the existing convention:

```ts
setPanelName(body: { visible?: boolean; driverId?: number | null }): Promise<OkResponse> {
  return fetchJSON<OkResponse>(`${baseUrl()}/overlay/<kebab-case-endpoint>`, {
    method: 'POST', body: JSON.stringify(body),
  });
},
```

The endpoint path follows the pattern `/overlay/<kebab-case-name>`. Use `OkResponse` (`{ ok: boolean }`) as the return type.

## Step 3 — WebSocket defaults (`src/hooks/useOverlayWS.ts`)

Add the new panel to `DEFAULT_OVERLAY_STATE` with all fields set to their falsy defaults (e.g. `visible: false`, `driverId: null`, `driverIds: []`). This ensures the overlay renders correctly before the first server message.

## Step 4 — Create the panel component

Create `src/components/overlays/stencil/ST<PanelName>.tsx`. Follow the STENCIL design language:

- Import `ST`, `stripes`, `clip` from `./tokens`
- Import types from `../../../types` and utilities from `../../../lib/utils`
- Props: `{ state: OverlayData }`
- Read the panel config from `state.overlayState.<panelName>`
- Return `null` early if panel is hidden or required data is missing
- Position with `position: "absolute"` using one of the four corners: top-left (28,28), top-right (right:28, top:28), bottom-left (28, bottom:28), bottom-right (right:28, bottom:28)
- Use existing tokens for colors: `ST.surface` for backgrounds, `ST.accent` for red accents, `ST.leader` for gold/P1, `ST.ink`/`ST.inkDim`/`ST.inkVeryDim` for text hierarchy
- Use `clip.slashRight` or `clip.slashBoth` on containers
- Fonts: Oswald for large numbers/headings (700 weight), Barlow Condensed for body text, JetBrains Mono for data labels
- Use `stripes` as `backgroundImage` on header bars for the racing pattern

## Step 5 — Register in overlay index

In `src/components/overlays/stencil/index.tsx`:
- Import the new component
- Add a conditional render line following the existing pattern:
  ```tsx
  {overlayState.<panelName>.visible && <ST<PanelName> state={state} />}
  ```

## Step 6 — Control panel toggle (`src/pages/ControlPage.tsx`)

Three sub-edits inside the `OverlayControls` component:

**a) Sync check** — add equality checks in the `useEffect` that syncs from server. Match the existing pattern (compare `visible` and `driverId`/`driverIds`).

**b) State functions** — add two functions:
- `toggle<PanelName>()` — toggles `visible`, calls the API method, applies optimistic update
- `set<PanelName>Driver(id)` (for driver-select panels) — updates `driverId`, calls API

**c) UI row** — add a `<PanelRow>` after the last existing panel with:
- `title` prop for the label
- `visible` bound to the panel state
- `busy` bound to a unique busy key
- `onToggle` bound to the toggle function
- For driver-select panels: a `<div className="mt-3">` containing `<DriverSelect>` components

## Step 7 — Verify

Run `npx tsc --noEmit` to ensure no type errors. The TypeScript strict mode and `noUnusedLocals`/`noUnusedParameters` flags will catch missing fields or imports.

## Design token reference

| Token | Value | Use |
|-------|-------|-----|
| `ST.surface` | `rgba(8,8,11,0.78)` | Panel background |
| `ST.surfaceSolid` | `#0a0a0d` | Header background |
| `ST.accent` | `#ff3344` | Red accent, active state |
| `ST.leader` | `#f6c945` | Gold, P1 indicator |
| `ST.gain` | `oklch(0.78 0.18 145)` | Green, throttle/gains |
| `ST.loss` | `oklch(0.65 0.22 25)` | Red, brake/losses |
| `ST.ink` | `#f4f4f6` | Primary text |
| `ST.inkDim` | `rgba(244,244,246,0.55)` | Secondary text |
| `ST.inkVeryDim` | `rgba(244,244,246,0.28)` | Tertiary/hint text |

## Utility functions to use

- `msToKmh(mps)` — m/s → km/h
- `bytePct(0-255)` — raw byte → 0–100 percentage
- `fmtLapMs(ms)` — ms → `"M:SS.mmm"`
- `fmtSectorMs(ms)` — ms → `"SS.mmm"`
- `tireTempColor(°C)` — temperature → OKLCH color string
- `categoryInfo(cat)` — GT7 category string → `{ color, text }`
