import { useCallback, useEffect, useRef, useState } from "react";
import { ActiveSessionCard } from "../components/control/ActiveSessionCard";
import { ControlHeader } from "../components/control/ControlHeader";
import { DriversTable } from "../components/control/DriversTable";
import { HealthCard } from "../components/control/HealthCard";
import { KeyboardShortcuts } from "../components/control/KeyboardShortcuts";
import { OverlayControls } from "../components/control/OverlayControls";
import { RosterBuilder } from "../components/control/RosterBuilder";
import { SessionModeCard } from "../components/control/SessionModeCard";
import type { LocalDriver } from "../components/control/localDriver";
import { AddDriverForm } from "../components/ui/AddDriverForm";
import { useOverlayWS } from "../hooks/useOverlayWS";
import { api } from "../lib/api";
import { loadDriverPhotos, saveDriverPhotos } from "../lib/utils";
import type {
  DriversListResponse,
  HealthResponse,
  Session,
  SessionMode,
} from "../types";

const HEALTH_POLL_MS = 5_000;
const DRIVERS_POLL_MS = 3_000;

export function ControlPage() {
  const { state: wsState } = useOverlayWS();
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [drivers, setDrivers] = useState<DriversListResponse["drivers"]>([]);
  const [addError, setAddError] = useState<string | null>(null);

  // Poll health
  useEffect(() => {
    let alive = true;
    const poll = async () => {
      try {
        const h = await api.health();
        if (!alive) return;
        setHealth(h);
        setHealthError(null);
      } catch {
        if (!alive) return;
        setHealth(null);
        setHealthError("Cannot reach server — is it running?");
      }
    };
    void poll();
    const id = setInterval(() => void poll(), HEALTH_POLL_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  // Load session on mount
  useEffect(() => {
    api
      .getSession()
      .then((r) => setSession(r.session))
      .catch(() => setSession(null));
  }, []);

  // Poll drivers when session active
  const driversTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (driversTimer.current) clearInterval(driversTimer.current);
    if (!session) {
      setDrivers([]);
      return;
    }
    const poll = () => {
      api
        .getDrivers()
        .then((r) => setDrivers(r.drivers))
        .catch(() => {});
    };
    poll();
    driversTimer.current = setInterval(poll, DRIVERS_POLL_MS);
    return () => {
      if (driversTimer.current) clearInterval(driversTimer.current);
    };
  }, [session]);

  const handleSessionCreated = useCallback((s: Session) => setSession(s), []);
  const handleSessionDeleted = useCallback(() => {
    setSession(null);
    setDrivers([]);
  }, []);
  const handleModeChanged = useCallback((m: SessionMode) => {
    setSession((prev) => (prev ? { ...prev, mode: m } : null));
  }, []);

  const handleAddDriver = useCallback(
    async (d: LocalDriver) => {
      if (!session) return;
      setAddError(null);
      try {
        const nextId =
          session.roster.reduce((max, r) => Math.max(max, r.id), 0) + 1;
        await api.addDriver({ id: nextId, name: d.name, country: d.country });
        if (d.photoBase64) {
          saveDriverPhotos({ ...loadDriverPhotos(), [nextId]: d.photoBase64 });
        }
        const r = await api.getSession();
        setSession(r.session);
      } catch (e) {
        setAddError((e as Error).message);
      }
    },
    [session],
  );

  return (
    <div className="control-root min-h-screen p-6">
      {/* Header */}
      <ControlHeader health={health} />

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3 items-start max-w-full flex-row px-20">
        <div className="flex flex-col gap-4">
          <HealthCard health={health} error={healthError} />

          {session ? (
            <>
              <ActiveSessionCard
                session={session}
                onDeleted={handleSessionDeleted}
              />
              <SessionModeCard
                session={session}
                onModeChanged={handleModeChanged}
              />
              <AddDriverForm onAdd={(d) => void handleAddDriver(d)} />
              {addError && (
                <p className="text-sm text-red-400 font-jetbrains">
                  {addError}
                </p>
              )}
            </>
          ) : (
            <RosterBuilder onSessionCreated={handleSessionCreated} />
          )}
        </div>

        {session && (
          <>
            <OverlayControls
              key={session.id}
              session={session}
              overlayState={wsState.overlayState}
            />
            <div className="flex flex-col gap-4">
              <KeyboardShortcuts />
              {drivers.length > 0 && <DriversTable drivers={drivers} />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
