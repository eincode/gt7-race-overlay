import { useState } from "react";
import { api } from "../../lib/api";
import { saveDriverPhotos } from "../../lib/utils";
import type { RosterEntry, Session, Track } from "../../types";
import { NewDriver } from "./NewDriver";
import { RosterCard } from "./RosterCard";
import { TrackSelection } from "./TrackSelection";
import { TrackSelector } from "./TrackSelector";

export function SetupPage({
  driverCount,
  roster,
  onRemove,
  onAddDriver,
  onCreated,
}: {
  driverCount: number;
  roster: (RosterEntry & { photoBase64: string | null })[];
  onRemove: (id: number) => void;
  onAddDriver: (name: string, country: string, photoBase64: string | null) => void;
  onCreated: (session: Session) => void;
}) {
  const [track, setTrack] = useState<Track | null>(null);
  const [showSelector, setShowSelector] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSession = async () => {
    if (!track) return;
    setBusy(true);
    setError(null);
    try {
      const sessionRoster: RosterEntry[] = roster.map((d, i) => ({
        id: i + 1,
        name: d.name,
        country: d.country,
      }));
      const res = await api.createSession(sessionRoster, "practice", track.id);

      // Persist photos locally — server doesn't accept them.
      // Keyed by the same IDs assigned above (i + 1).
      const photos: Record<number, string> = {};
      roster.forEach((d, i) => {
        if (d.photoBase64) photos[i + 1] = d.photoBase64;
      });
      saveDriverPhotos(photos);

      onCreated(res.session);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <header className="flex flex-wrap items-center gap-3 border-b border-white/7 bg-[#171719] px-6 py-5">
        <div className="flex min-w-[220px] flex-1 flex-col gap-[3px]">
          <h1 className="font-oswald text-[26px] font-semibold tracking-[0.12em] text-zinc-50">
            NEW SESSION
          </h1>
          <p className="font-jetbrains text-[11px] tracking-[0.12em] text-zinc-500">
            NO ACTIVE SESSION · localhost:3000
          </p>
        </div>
        <div className="flex items-center gap-[14px] rounded-[11px] border border-white/8 bg-[#232326] px-[18px] py-[11px]">
          <span className="font-jetbrains text-[10px] tracking-[0.16em] text-zinc-500">
            DRIVERS
          </span>
          <span className="font-oswald text-[17px] font-semibold tracking-[0.1em] text-zinc-100">
            {driverCount}
          </span>
          <span className="h-[18px] w-px bg-white/12" />
          <span className="font-jetbrains text-[10px] tracking-[0.16em] text-zinc-500">
            TRACK
          </span>
          <span className="font-oswald text-[17px] font-semibold tracking-[0.1em] text-zinc-100 max-w-[180px] truncate">
            {track ? track.name.toUpperCase() : "—"}
          </span>
        </div>
        <button
          type="button"
          onClick={createSession}
          disabled={driverCount === 0 || !track || busy}
          className="h-[54px] rounded-xl bg-red-600 px-[26px] font-oswald text-[17px] font-semibold tracking-[0.12em] text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {busy ? "CREATING…" : "CREATE SESSION →"}
        </button>
      </header>
      <main className="grid flex-1 content-start gap-4 p-6 pb-10 grid-cols-[repeat(auto-fit,minmax(400px,1fr))]">
        {error && (
          <p className="col-span-full font-jetbrains text-xs tracking-[0.12em] text-red-400">
            FAILED TO CREATE SESSION — {error}
          </p>
        )}
        <TrackSelection track={track} onOpen={() => setShowSelector(true)} />
        <NewDriver onAdd={onAddDriver} />
        <RosterCard roster={roster} onRemove={onRemove} />
      </main>

      {showSelector && (
        <TrackSelector
          onClose={() => setShowSelector(false)}
          onSelect={(t) => {
            setTrack(t);
            setShowSelector(false);
          }}
        />
      )}
    </>
  );
}
