import { useCallback, useEffect, useState } from "react";
import { api } from "../../lib/api";
import { loadDriverPhotos, saveDriverPhotos } from "../../lib/utils";
import { useOverlayWS } from "../../hooks/useOverlayWS";
import type { RosterEntry, Session } from "../../types";
import { DriverPicker } from "./DriverPicker";
import { DriversPage } from "./DriversPage";
import { Header } from "./Header";
import { buildPanels, OverlaysPage, PANEL_TITLES } from "./OverlaysPage";
import type { PanelKey } from "./PanelCard";
import { SessionPage } from "./SessionPage";
import { SetupPage } from "./SetupPage";
import type { NavKey } from "./Sidebar";
import { Sidebar } from "./Sidebar";
import { useOverlayPanels } from "./useOverlayPanels";

type RosterDriver = RosterEntry & { photoBase64: string | null };

type PickerState = { panelKey: PanelKey; tag: string };

export function ControlV2() {
  const [activeNav, setActiveNav] = useState<NavKey>("overlays");
  const [session, setSession] = useState<Session | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [draftRoster, setDraftRoster] = useState<RosterDriver[]>([]);
  const [picker, setPicker] = useState<PickerState | null>(null);
  const [photos, setPhotos] = useState(() => loadDriverPhotos());
  const [addError, setAddError] = useState<string | null>(null);
  const { state: wsState } = useOverlayWS();
  const {
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
  } = useOverlayPanels(wsState.overlayState);

  // Load session on mount
  useEffect(() => {
    api
      .getSession()
      .then((r) => setSession(r.session))
      .catch(() => setSession(null))
      .finally(() => setSessionChecked(true));
  }, []);

  // Refresh photos when the session changes
  useEffect(() => {
    setPhotos(loadDriverPhotos());
  }, [session]);

  const handleSessionCreated = useCallback((s: Session) => setSession(s), []);

  const handleSessionDeleted = useCallback(() => {
    setSession(null);
  }, []);

  const handleAddDriver = useCallback(
    async (name: string, country: string, photoBase64: string | null) => {
      if (!session) return;
      setAddError(null);
      try {
        const nextId =
          session.roster.reduce((max, r) => Math.max(max, r.id), 0) + 1;
        await api.addDriver({ id: nextId, name, country });
        if (photoBase64) {
          saveDriverPhotos({ ...loadDriverPhotos(), [nextId]: photoBase64 });
        }
        const r = await api.getSession();
        setSession(r.session);
      } catch (e) {
        setAddError((e as Error).message);
      }
    },
    [session],
  );

  const handleRemoveDriver = useCallback(
    async (id: number) => {
      if (!session) return;
      setAddError(null);
      try {
        await api.deleteDriver(id);
        const r = await api.getSession();
        setSession(r.session);
      } catch (e) {
        setAddError((e as Error).message);
      }
    },
    [session],
  );

  const setDriver = (panelKey: PanelKey, tag: string, id: number | null) => {
    switch (panelKey) {
      case "sector":
        setSectorDriver(tag === "A" ? 0 : 1, id);
        break;
      case "carTelemetry":
        setCarTelDriver(tag === "A" ? 0 : 1, id);
        break;
      case "driverShowcase":
        setShowcaseDriver(id);
        break;
      case "driverTelemetry":
        setDriverTelemetryDriver(id);
        break;
      case "standings":
        break;
    }
  };

  const togglePanel = (panelKey: PanelKey) => {
    switch (panelKey) {
      case "standings":
        toggleStandings();
        break;
      case "sector":
        toggleSector();
        break;
      case "carTelemetry":
        toggleCarTelemetry();
        break;
      case "driverShowcase":
        toggleShowcase();
        break;
      case "driverTelemetry":
        toggleDriverTelemetry();
        break;
    }
  };

  const handleSelect = (driverId: number | null) => {
    if (!picker) return;
    setDriver(picker.panelKey, picker.tag, driverId);
    setPicker(null);
  };

  return (
    <div className="flex min-h-screen bg-[#121214] font-barlow text-zinc-200">
      <Sidebar
        active={activeNav}
        onNavChange={setActiveNav}
        setup={!session}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {!sessionChecked ? null : session ? (
          <>
            <Header
              session={session}
              onModeChanged={(mode) =>
                setSession((prev) => (prev ? { ...prev, mode } : null))
              }
            />

            {activeNav === "overlays" && (
              <OverlaysPage
                panels={buildPanels(panels, session.roster, photos)}
                busy={busy}
                error={error}
                onSlotClick={(panelKey, tag) => setPicker({ panelKey, tag })}
                onToggle={togglePanel}
              />
            )}

            {activeNav === "drivers" && (
              <DriversPage
                roster={session.roster}
                onRemove={(id) => void handleRemoveDriver(id)}
                onAddDriver={(name, country, photo) =>
                  void handleAddDriver(name, country, photo)
                }
                error={addError}
              />
            )}

            {activeNav === "session" && (
              <SessionPage
                session={session}
                onModeChanged={(mode) =>
                  setSession((prev) => (prev ? { ...prev, mode } : null))
                }
                onDelete={handleSessionDeleted}
              />
            )}
          </>
        ) : (
          <SetupPage
            driverCount={draftRoster.length}
            roster={draftRoster}
            onRemove={(id) =>
              setDraftRoster((prev) => prev.filter((d) => d.id !== id))
            }
            onAddDriver={(name, country, photoBase64) =>
              setDraftRoster((prev) => [
                ...prev,
                {
                  id: prev.reduce((max, d) => Math.max(max, d.id), 0) + 1,
                  name,
                  country,
                  photoBase64,
                },
              ])
            }
            onCreated={handleSessionCreated}
          />
        )}
      </div>

      {picker && (
        <DriverPicker
          title={`${PANEL_TITLES[picker.panelKey]} · ${picker.tag}`}
          roster={session?.roster ?? []}
          onClose={() => setPicker(null)}
          onSelect={handleSelect}
        />
      )}
    </div>
  );
}
