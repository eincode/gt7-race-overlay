import { useEffect, useRef, useState, type ReactNode } from "react";
import { api } from "../../lib/api";
import type { OverlayState, RosterEntry, Session } from "../../types";
import { Card } from "../ui/Card";
import { Label } from "../ui/Label";

function ToggleBtn({
  visible,
  busy,
  onClick,
}: {
  visible: boolean;
  busy?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={`px-3 py-1.5 text-xs font-bold tracking-widest rounded transition-colors font-jetbrains disabled:opacity-50 ${
        visible
          ? "bg-red-600 hover:bg-red-500 text-white"
          : "bg-zinc-700 hover:bg-zinc-600 text-zinc-400"
      }`}
    >
      {visible ? "● LIVE" : "○ HIDDEN"}
    </button>
  );
}

function DriverSelect({
  label,
  value,
  roster,
  onChange,
  disabled,
}: {
  label: string;
  value: number | null;
  roster: RosterEntry[];
  onChange: (id: number | null) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <select
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value !== "" ? Number(e.target.value) : null)
        }
        disabled={disabled}
        className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-400 transition-colors disabled:opacity-50"
      >
        <option value="">— none —</option>
        {roster.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function PanelRow({
  title,
  visible,
  busy,
  onToggle,
  children,
}: {
  title: string;
  visible: boolean;
  busy?: boolean;
  onToggle: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-zinc-700/40 bg-zinc-900/30 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-zinc-200 font-barlow tracking-wide">
          {title}
        </span>
        <ToggleBtn visible={visible} busy={busy} onClick={onToggle} />
      </div>
      {children}
    </div>
  );
}

function TwoDriverPanel({
  title,
  visible,
  busy,
  driverIds,
  roster,
  onDriverChange,
  onToggle,
}: {
  title: string;
  visible: boolean;
  busy: boolean;
  driverIds: number[];
  roster: RosterEntry[];
  onDriverChange: (slot: 0 | 1, id: number | null) => void;
  onToggle: () => void;
}) {
  return (
    <PanelRow title={title} visible={visible} busy={busy} onToggle={onToggle}>
      <div className="grid grid-cols-2 gap-3 mt-3">
        <DriverSelect
          label="Driver A"
          value={driverIds[0] ?? null}
          roster={roster}
          disabled={busy}
          onChange={(id) => onDriverChange(0, id)}
        />
        <DriverSelect
          label="Driver B"
          value={driverIds[1] ?? null}
          roster={roster}
          disabled={busy}
          onChange={(id) => onDriverChange(1, id)}
        />
      </div>
    </PanelRow>
  );
}

/** Overlay panel visibility controls — shown when a session is active. */
export function OverlayControls({
  session,
  overlayState: serverOverlayState,
}: {
  session: Session;
  overlayState: OverlayState;
}) {
  const { roster } = session;
  const [panels, setPanels] = useState<OverlayState>(serverOverlayState);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync from server when state changes (e.g. another control panel instance made changes).
  // Uses a functional updater that returns `prev` unchanged when values are identical,
  // so React skips re-renders on the 60Hz WS ticks where nothing changed.
  useEffect(() => {
    setPanels((prev) => {
      const next = serverOverlayState;
      const equal =
        prev.standings.visible === next.standings.visible &&
        prev.sector.visible === next.sector.visible &&
        prev.sector.driverIds.length === next.sector.driverIds.length &&
        prev.sector.driverIds.every(
          (id, i) => id === next.sector.driverIds[i],
        ) &&
        prev.carTelemetry.visible === next.carTelemetry.visible &&
        prev.carTelemetry.driverIds.length ===
          next.carTelemetry.driverIds.length &&
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
    key: string,
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
      () =>
        api.setSector({ visible: next, driverIds: panels.sector.driverIds }),
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

  // ── Driver Telemetry ────────────────────────────────────────────────────

  function toggleDriverTelemetry() {
    const next = !panels.driverTelemetry.visible;
    void post(
      "driverTelemetry",
      () =>
        api.setDriverTelemetry({
          visible: next,
          driverId: panels.driverTelemetry.driverId,
        }),
      (p) => ({
        ...p,
        driverTelemetry: { ...p.driverTelemetry, visible: next },
      }),
    );
  }

  function setDriverTelemetryDriver(id: number | null) {
    void post(
      "driverTelemetry",
      () => api.setDriverTelemetry({ driverId: id }),
      (p) => ({
        ...p,
        driverTelemetry: { ...p.driverTelemetry, driverId: id },
      }),
    );
  }

  // ── Keyboard shortcuts ──────────────────────────────────────────────────
  const toggleFns = useRef({
    toggleStandings,
    toggleSector,
    toggleCarTelemetry,
    toggleShowcase,
    toggleDriverTelemetry,
  });
  toggleFns.current = {
    toggleStandings,
    toggleSector,
    toggleCarTelemetry,
    toggleShowcase,
    toggleDriverTelemetry,
  };

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "SELECT" ||
        target.tagName === "TEXTAREA"
      )
        return;
      if (!e.altKey) return;

      const fns = toggleFns.current;
      switch (e.key) {
        case "1":
          e.preventDefault();
          fns.toggleStandings();
          break;
        case "2":
          e.preventDefault();
          fns.toggleSector();
          break;
        case "3":
          e.preventDefault();
          fns.toggleCarTelemetry();
          break;
        case "4":
          e.preventDefault();
          fns.toggleShowcase();
          break;
        case "5":
          e.preventDefault();
          fns.toggleDriverTelemetry();
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Card title="Overlay Controls">
      <div className="flex flex-col gap-3">
        {/* Standings */}
        <PanelRow
          title="Standings"
          visible={panels.standings.visible}
          busy={busy === "standings"}
          onToggle={toggleStandings}
        />

        {/* Sector Compare */}
        <TwoDriverPanel
          title="Sector Compare"
          visible={panels.sector.visible}
          busy={busy === "sector"}
          driverIds={panels.sector.driverIds}
          roster={roster}
          onDriverChange={setSectorDriver}
          onToggle={toggleSector}
        />

        {/* Car Telemetry */}
        <TwoDriverPanel
          title="Car Telemetry"
          visible={panels.carTelemetry.visible}
          busy={busy === "carTelemetry"}
          driverIds={panels.carTelemetry.driverIds}
          roster={roster}
          onDriverChange={setCarTelDriver}
          onToggle={toggleCarTelemetry}
        />

        {/* Driver Showcase */}
        <PanelRow
          title="Driver Showcase"
          visible={panels.driverShowcase.visible}
          busy={busy === "driverShowcase"}
          onToggle={toggleShowcase}
        >
          <div className="mt-3">
            <DriverSelect
              label="Driver"
              value={panels.driverShowcase.driverId}
              roster={roster}
              disabled={busy === "driverShowcase"}
              onChange={setShowcaseDriver}
            />
          </div>
        </PanelRow>

        {/* Driver Telemetry */}
        <PanelRow
          title="Driver Telemetry"
          visible={panels.driverTelemetry.visible}
          busy={busy === "driverTelemetry"}
          onToggle={toggleDriverTelemetry}
        >
          <div className="mt-3">
            <DriverSelect
              label="Driver"
              value={panels.driverTelemetry.driverId}
              roster={roster}
              disabled={busy === "driverTelemetry"}
              onChange={setDriverTelemetryDriver}
            />
          </div>
        </PanelRow>
      </div>
      {error && (
        <p className="mt-3 text-xs text-red-400 font-jetbrains">{error}</p>
      )}
    </Card>
  );
}
