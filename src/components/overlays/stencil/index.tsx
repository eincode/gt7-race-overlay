/**
 * OverlayStencil — Direction 2 (STENCIL).
 * Esports-bold aesthetic: hard corners, clip-path slashes, heavy Oswald, racing stripes.
 *
 * To add another overlay direction, create a sibling folder and export a
 * component with the same `OverlayProps` signature.
 */
import type { OverlayData } from "../../../types";
import { STCarCompare } from "./STCarCompare";
import { STCurrentSector } from "./STCurrentSector";
import { STDriverTelemetry } from "./STDriverTelemetry";
import { STShowcase } from "./STShowcase";
import { STStandings } from "./STStandings";

export interface OverlayProps {
  state: OverlayData;
}

export function OverlayStencil({ state }: OverlayProps) {
  const { overlayState } = state;
  return (
    <>
      <STStandings state={state} isVisible={overlayState.standings.visible} />
      {/* {overlayState.sector.visible         && <STSectorCompare state={state} />} */}
      <STCurrentSector state={state} isVisible={overlayState.sector.visible} />
      <STCarCompare
        state={state}
        isVisible={overlayState.carTelemetry.visible}
      />
      <STShowcase
        state={state}
        isVisible={overlayState.driverShowcase.visible}
      />
      <STDriverTelemetry
        state={state}
        isVisible={overlayState.driverTelemetry.visible}
      />
    </>
  );
}
