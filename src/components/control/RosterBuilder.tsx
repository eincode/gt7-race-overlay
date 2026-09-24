import { useState } from "react";
import { api } from "../../lib/api";
import { saveDriverPhotos } from "../../lib/utils";
import type { RosterEntry, Session, SessionMode } from "../../types";
import { AddDriverForm } from "../ui/AddDriverForm";
import { DriverCard } from "../ui/DriverCard";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { ModeTabs } from "./ModeTabs";
import type { LocalDriver } from "./localDriver";

// ── Demo roster (no photos) ──────────────────────────────────────────────────

const DEMO_LOCAL: LocalDriver[] = [
  { tempId: "d1", name: "M. TANAKA", country: "JP", photoBase64: null },
  { tempId: "d2", name: "K. SCHMIDT", country: "DE", photoBase64: null },
  { tempId: "d3", name: "L. ROSSI", country: "IT", photoBase64: null },
  { tempId: "d4", name: "A. BENNETT", country: "GB", photoBase64: null },
  { tempId: "d5", name: "R. SILVA", country: "BR", photoBase64: null },
  { tempId: "d6", name: "J. DUBOIS", country: "FR", photoBase64: null },
];

// ── Roster builder ───────────────────────────────────────────────────────────

export function RosterBuilder({
  onSessionCreated,
}: {
  onSessionCreated: (s: Session) => void;
}) {
  const [drivers, setDrivers] = useState<LocalDriver[]>([]);
  const [mode, setMode] = useState<SessionMode>("practice");
  const [trackId, setTrackId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function addDriver(d: LocalDriver) {
    setDrivers((prev) => [...prev, d]);
  }

  function removeDriver(tempId: string) {
    setDrivers((prev) => prev.filter((d) => d.tempId !== tempId));
  }

  function loadDemo() {
    setDrivers(DEMO_LOCAL);
  }

  async function createSession() {
    if (drivers.length === 0) return;
    setError(null);
    setBusy(true);
    try {
      const roster: RosterEntry[] = drivers.map((d, i) => ({
        id: i + 1,
        name: d.name,
        country: d.country,
      }));
      const res = await api.createSession(roster, mode, trackId.trim());

      // Persist photos locally — server doesn't accept them.
      // Keyed by the same IDs assigned above (i + 1).
      const photos: Record<number, string> = {};
      drivers.forEach((d, i) => {
        if (d.photoBase64) photos[i + 1] = d.photoBase64;
      });
      saveDriverPhotos(photos);

      setDrivers([]);
      onSessionCreated(res.session);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card
      title={`Roster Builder · ${drivers.length} driver${drivers.length !== 1 ? "s" : ""}`}
      action={
        <button
          type="button"
          onClick={loadDemo}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-jetbrains tracking-wider"
        >
          Load demo →
        </button>
      }
    >
      {/* Mode selector */}
      <div className="mb-5">
        <Label>Session Mode</Label>
        <ModeTabs current={mode} onSelect={setMode} />
      </div>

      {/* Track ID */}
      <div className="mb-5">
        <Label>Track ID</Label>
        <Input
          value={trackId}
          onChange={(e) => setTrackId(e.target.value)}
          placeholder="e.g. tokyo_east"
        />
      </div>

      {/* Driver list */}
      {drivers.length > 0 && (
        <div className="flex flex-col gap-2 mb-5">
          {drivers.map((d, i) => (
            <DriverCard
              key={d.tempId}
              driver={d}
              index={i}
              onRemove={() => removeDriver(d.tempId)}
            />
          ))}
        </div>
      )}

      {drivers.length === 0 && (
        <p className="text-sm text-zinc-600 italic mb-5 font-jetbrains">
          No drivers yet. Fill in the form below or load a demo roster.
        </p>
      )}

      {/* Add form */}
      <AddDriverForm onAdd={addDriver} />

      {/* Create session */}
      <div className="mt-5 flex items-center gap-4">
        <button
          type="button"
          onClick={createSession}
          disabled={drivers.length === 0 || !trackId.trim() || busy}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold tracking-wider rounded transition-colors"
        >
          {busy
            ? "Creating…"
            : `Create Session (${drivers.length} driver${drivers.length !== 1 ? "s" : ""})`}
        </button>
        {drivers.length > 0 && (
          <button
            type="button"
            onClick={() => setDrivers([])}
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors font-jetbrains"
          >
            Clear all
          </button>
        )}
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-400 font-jetbrains">{error}</p>
      )}
    </Card>
  );
}
