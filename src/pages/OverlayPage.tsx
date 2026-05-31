/**
 * OverlayPage — transparent 1920×1080 overlay intended as an OBS browser source.
 *
 * OBS setup:
 *   URL:    http://<host>:<port>/overlay/stencil
 *   Width:  1920  Height: 1080
 *   Custom CSS: body { background-color: rgba(0,0,0,0); }
 *
 * Panel visibility is controlled server-side via the control panel
 * (POST /overlay/standings, /overlay/sector, /overlay/car-telemetry,
 * /overlay/driver-showcase) and broadcast through the WebSocket.
 */
import { useOverlayWS } from '../hooks/useOverlayWS';
import { OverlayStencil } from '../components/overlays/stencil';

export function OverlayPage() {
  const { state, connected } = useOverlayWS();

  return (
    <div
      className="overlay-root"
      style={{ width: 1920, height: 1080, position: 'relative', overflow: 'hidden' }}
    >
      {/* Minimal connection indicator — barely visible in OBS, useful for debugging */}
      {!connected && (
        <div style={{
          position: 'absolute', bottom: 12, left: 12,
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 10, fontWeight: 700, letterSpacing: 2,
          color: 'rgba(255,255,255,0.25)',
          pointerEvents: 'none',
        }}>
          ● CONNECTING
        </div>
      )}

      <OverlayStencil state={state} />
    </div>
  );
}
