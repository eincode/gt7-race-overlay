/**
 * OverlayPage — transparent overlay intended as an OBS browser source.
 *
 * OBS setup (set the source size to the overlay's canvas):
 *   /overlay/stencil  Width: 1920  Height: 1080
 *   /overlay/modern   Width: 2560  Height: 1440
 *   Custom CSS: body { background-color: rgba(0,0,0,0); }
 *
 * Panel visibility is controlled server-side via the control panel
 * (POST /overlay/standings, /overlay/sector, /overlay/car-telemetry,
 * /overlay/driver-showcase) and broadcast through the WebSocket.
 */
import type { ComponentType } from "react";
import { OverlayStencil, type OverlayProps } from "../components/overlays/stencil";
import { useOverlayWS } from "../hooks/useOverlayWS";

interface Props {
  /** The visual direction; stencil unless a route says otherwise. */
  Overlay?: ComponentType<OverlayProps>;
  /** Canvas size in px, matching the OBS browser source; 1080p unless the overlay is laid out for another. */
  width?: number;
  height?: number;
}

export function OverlayPage({ Overlay = OverlayStencil, width = 1920, height = 1080 }: Props) {
  const { state, connected } = useOverlayWS();

  return (
    <div
      className="overlay-root"
      style={{
        width,
        height,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Minimal connection indicator — barely visible in OBS, useful for debugging */}
      {!connected && (
        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: 12,
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 2,
            color: "rgba(255,255,255,0.25)",
            pointerEvents: "none",
          }}
        >
          ● CONNECTING
        </div>
      )}

      <Overlay state={state} />
    </div>
  );
}
