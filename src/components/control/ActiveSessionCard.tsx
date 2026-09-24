import { useState } from "react";
import { api } from "../../lib/api";
import { clearDriverPhotos, fmtTimestamp } from "../../lib/utils";
import type { Session } from "../../types";
import { Card } from "../ui/Card";

export function ActiveSessionCard({
  session,
  onDeleted,
}: {
  session: Session;
  onDeleted: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (
      !confirm("Delete the active session? This will disconnect all drivers.")
    )
      return;
    setBusy(true);
    try {
      await api.deleteSession();
      clearDriverPhotos();
      onDeleted();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const statusColor =
    session.status === "racing"
      ? "text-green-400"
      : session.status === "waiting"
        ? "text-yellow-400"
        : "text-zinc-400";

  return (
    <Card title="Active Session">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5 text-sm">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase mb-1 font-jetbrains">
            Session ID
          </p>
          <p className="text-zinc-300 font-jetbrains text-xs">
            {session.id.slice(0, 8)}…
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase mb-1 font-jetbrains">
            Status
          </p>
          <p className={`font-bold font-oswald tracking-wider ${statusColor}`}>
            {session.status.toUpperCase()}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase mb-1 font-jetbrains">
            Drivers
          </p>
          <p className="text-zinc-300 font-jetbrains">
            {session.roster.length}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase mb-1 font-jetbrains">
            Created
          </p>
          <p className="text-zinc-300 font-jetbrains text-xs">
            {fmtTimestamp(session.createdAt)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleDelete}
          disabled={busy}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-bold tracking-wider rounded transition-colors"
        >
          {busy ? "Deleting…" : "Delete Session"}
        </button>
        <a
          href="/overlay/stencil"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-sm font-bold tracking-wider rounded transition-colors"
        >
          Open Overlay ↗
        </a>
      </div>
      {error && (
        <p className="mt-3 text-sm text-red-400 font-jetbrains">{error}</p>
      )}
    </Card>
  );
}
