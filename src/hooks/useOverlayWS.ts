import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import { DEFAULT_STANDINGS_SOURCE, type OverlayData, type OverlayState, type RaceState, type WSMessage } from "../types";

const DEFAULT_RACE_STATE: RaceState = {
  mode: "practice",
  trackId: null,
  sectorCount: 0,
  lap: 0,
  totalLaps: 0,
  phase: "racing",
  dayProgression: 0,
  order: [],
};

const DEFAULT_OVERLAY_STATE: OverlayState = {
  standings: { visible: false, source: DEFAULT_STANDINGS_SOURCE },
  sector: { visible: false, driverIds: [] },
  carTelemetry: { visible: false, driverIds: [] },
  driverShowcase: { visible: false, driverId: null },
  driverTelemetry: { visible: false, driverId: null },
  trackMap: { visible: false },
};

const DEFAULT_STATE: OverlayData = {
  session: null,
  roster: [],
  raceState: DEFAULT_RACE_STATE,
  drivers: {},
  focusedId: null,
  overlayState: DEFAULT_OVERLAY_STATE,
  standingsV2: [],
};

const RECONNECT_DELAY_MS = 3000;

export function useOverlayWS() {
  const [state, setState] = useState<OverlayData>(DEFAULT_STATE);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unmountedRef = useRef(false);

  const connect = useCallback(() => {
    if (unmountedRef.current) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(api.wsUrl());
    wsRef.current = ws;

    ws.onopen = () => {
      if (unmountedRef.current) {
        ws.close();
        return;
      }
      setConnected(true);
    };

    ws.onmessage = (event: MessageEvent<string>) => {
      if (unmountedRef.current) return;
      try {
        const msg = JSON.parse(event.data) as WSMessage;

        if (msg.type === "roster") {
          setState((prev) => ({
            ...prev,
            session: msg.session,
            roster: msg.roster,
          }));
        } else if (msg.type === "state") {
          setState((prev) => {
            const order = msg.raceState.order;
            const focusedId = order[0] ?? prev.focusedId;

            return {
              ...prev,
              raceState: msg.raceState,
              drivers: msg.drivers,
              focusedId,
              overlayState: msg.overlayState ?? prev.overlayState,
              standingsV2: msg.standingsV2,
            };
          });
        }
      } catch {
        // silently ignore malformed frames
      }
    };

    ws.onclose = () => {
      if (unmountedRef.current) return;
      setConnected(false);
      timerRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
    };

    ws.onerror = () => ws.close();
  }, []);

  useEffect(() => {
    unmountedRef.current = false;
    connect();

    return () => {
      unmountedRef.current = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      const ws = wsRef.current;
      if (ws?.readyState === WebSocket.CONNECTING) {
        // Closing mid-handshake logs a browser warning (StrictMode remounts
        // hit this in dev); close as soon as it opens instead.
        ws.onopen = () => ws.close();
        ws.onmessage = null;
        ws.onclose = null;
      } else {
        ws?.close();
      }
    };
  }, [connect]);

  return { state, connected };
}
