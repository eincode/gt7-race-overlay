import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import type { OverlayState } from "../../types";
import type { PanelKey } from "./PanelCard";

/**
 * Local overlay-panel state mirroring OverlayControls (control/).
 * Optimistic updates are applied only after the REST call succeeds;
 * server WS state (60Hz) syncs back via the equality-checked effect.
 */
export function useOverlayPanels(serverOverlayState: OverlayState) {
  const [panels, setPanels] = useState<OverlayState>(serverOverlayState);
  const [busy, setBusy] = useState<PanelKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync from server when state changes. Functional updater returns `prev`
  // unchanged when values are identical, so React skips re-renders on the
  // 60Hz WS ticks where nothing changed.
  useEffect(() => {
    setPanels((prev) => {
      const next = serverOverlayState;
      const equal =
        prev.standings.visible === next.standings.visible &&
        prev.sector.visible === next.sector.visible &&
        prev.sector.driverIds.length === next.sector.driverIds.length &&
        prev.sector.driverIds.every((id, i) => id === next.sector.driverIds[i]) &&
        prev.carTelemetry.visible === next.carTelemetry.visible &&
        prev.carTelemetry.driverIds.length === next.carTelemetry.driverIds.length &&
        prev.carTelemetry.driverIds.every(
          (id, i) => id === next.carTelemetry.driverIds[i],
        ) &&
        prev.driverShowcase.visible === next.driverShowcase.visible &&
        prev.driverShowcase.driverId === next.driverShowcase.driverId &&
        prev.driverTelemetry.visible === next.driverTelemetry.visible &&
        prev.driverTelemetry.driverId === next.driverTelemetry.driverId;
      return equal ? prev : next;
    });
  }, [serverOverlayState]);

  async function post(
    key: PanelKey,
    fn: () => Promise<unknown>,
    apply: (prev: OverlayState) => OverlayState,
  ) {
    setBusy(key);
    setError(null);
    try {
      await fn();
      setPanels(apply);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  // ── Standings ────────────────────────────────────────────────────────────

  function toggleStandings() {
    const next = !panels.standings.visible;
    void post(
      "standings",
      () => api.setStandings({ visible: next }),
      (p) => ({ ...p, standings: { visible: next } }),
    );
  }

  // ── Sector Compare ───────────────────────────────────────────────────────

  function toggleSector() {
    const next = !panels.sector.visible;
    void post(
      "sector",
      () => api.setSector({ visible: next, driverIds: panels.sector.driverIds }),
      (p) => ({ ...p, sector: { ...p.sector, visible: next } }),
    );
  }

  function setSectorDriver(slot: 0 | 1, id: number | null) {
    const ids: number[] = [...panels.sector.driverIds];
    if (id === null) ids.splice(slot, 1);
    else ids[slot] = id;
    const driverIds = ids.filter((x): x is number => x != null).slice(0, 2);
    void post(
      "sector",
      () => api.setSector({ driverIds }),
      (p) => ({ ...p, sector: { ...p.sector, driverIds } }),
    );
  }

  // ── Car Telemetry ────────────────────────────────────────────────────────

  function toggleCarTelemetry() {
    const next = !panels.carTelemetry.visible;
    void post(
      "carTelemetry",
      () =>
        api.setCarTelemetry({
          visible: next,
          driverIds: panels.carTelemetry.driverIds,
        }),
      (p) => ({ ...p, carTelemetry: { ...p.carTelemetry, visible: next } }),
    );
  }

  function setCarTelDriver(slot: 0 | 1, id: number | null) {
    const ids: number[] = [...panels.carTelemetry.driverIds];
    if (id === null) ids.splice(slot, 1);
    else ids[slot] = id;
    const driverIds = ids.filter((x): x is number => x != null).slice(0, 2);
    void post(
      "carTelemetry",
      () => api.setCarTelemetry({ driverIds }),
      (p) => ({ ...p, carTelemetry: { ...p.carTelemetry, driverIds } }),
    );
  }

  // ── Driver Showcase ──────────────────────────────────────────────────────

  function toggleShowcase() {
    const next = !panels.driverShowcase.visible;
    void post(
      "driverShowcase",
      () =>
        api.setDriverShowcase({
          visible: next,
          driverId: panels.driverShowcase.driverId,
        }),
      (p) => ({ ...p, driverShowcase: { ...p.driverShowcase, visible: next } }),
    );
  }

  function setShowcaseDriver(id: number | null) {
    void post(
      "driverShowcase",
      () => api.setDriverShowcase({ driverId: id }),
      (p) => ({ ...p, driverShowcase: { ...p.driverShowcase, driverId: id } }),
    );
  }

  // ── Driver Telemetry ─────────────────────────────────────────────────────

  function toggleDriverTelemetry() {
    const next = !panels.driverTelemetry.visible;
    void post(
      "driverTelemetry",
      () =>
        api.setDriverTelemetry({
          visible: next,
          driverId: panels.driverTelemetry.driverId,
        }),
      (p) => ({ ...p, driverTelemetry: { ...p.driverTelemetry, visible: next } }),
    );
  }

  function setDriverTelemetryDriver(id: number | null) {
    void post(
      "driverTelemetry",
      () => api.setDriverTelemetry({ driverId: id }),
      (p) => ({ ...p, driverTelemetry: { ...p.driverTelemetry, driverId: id } }),
    );
  }

  return {
    panels,
    busy,
    error,
    toggleStandings,
    toggleSector,
    toggleCarTelemetry,
    toggleShowcase,
    toggleDriverTelemetry,
    setSectorDriver,
    setCarTelDriver,
    setShowcaseDriver,
    setDriverTelemetryDriver,
  };
}
