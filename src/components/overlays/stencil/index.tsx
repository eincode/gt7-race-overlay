/**
 * OverlayStencil — Direction 2 (STENCIL).
 * Esports-bold aesthetic: hard corners, clip-path slashes, heavy Oswald, racing stripes.
 *
 * To add another overlay direction, create a sibling folder and export a
 * component with the same `OverlayProps` signature.
 */
import type { OverlayData } from '../../../types';
import { STStandings } from './STStandings';
import { STSectorCompare } from './STSectorCompare';
import { STCurrentSector } from './STCurrentSector';
import { STCarCompare } from './STCarCompare';
import { STShowcase } from './STShowcase';

export interface OverlayProps {
  state: OverlayData;
}

export function OverlayStencil({ state }: OverlayProps) {
  const { overlayState } = state;
  return (
    <>
      {overlayState.standings.visible      && <STStandings state={state} />}
      {/* {overlayState.sector.visible         && <STSectorCompare state={state} />} */}
      {overlayState.sector.visible         && <STCurrentSector state={state} />}
      {overlayState.carTelemetry.visible   && <STCarCompare state={state} />}
      {overlayState.driverShowcase.visible && <STShowcase state={state} />}
    </>
  );
}
