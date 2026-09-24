import { useState } from "react";
import { api } from "../../lib/api";
import type { Session, SessionMode } from "../../types";

const STATUS_COLOR: Record<Session["status"], string> = {
  waiting: "text-yellow-400",
  racing: "text-red-400",
  finished: "text-zinc-400",
};

export function Header({
  session,
  onModeChanged,
}: {
  session: Session;
  onModeChanged: (mode: SessionMode) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mode = session.mode;

  async function switchMode(next: SessionMode) {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await api.setMode(next);
      onModeChanged(next);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const buttons: { label: string; mode: SessionMode }[] =
    mode === "practice"
      ? [
          { label: "MOVE TO QUALIFYING", mode: "qualifying" },
          { label: "MOVE TO RACE", mode: "race" },
        ]
      : mode === "qualifying"
        ? [
            { label: "MOVE TO RACE", mode: "race" },
            { label: "BACK TO PRACTICE", mode: "practice" },
          ]
        : [{ label: "BACK TO PRACTICE", mode: "practice" }];

  return (
    <header className="flex flex-wrap items-center gap-3 border-b border-white/7 bg-[#171719] px-6 py-5">
      <h1 className="min-w-[200px] flex-1 font-oswald text-[26px] font-semibold tracking-[0.12em] text-zinc-50">
        OVERLAY CONTROLS
      </h1>
      <div className="flex items-center gap-[14px] rounded-[11px] border border-white/8 bg-[#232326] px-[18px] py-[11px]">
        <span className="font-jetbrains text-[10px] tracking-[0.16em] text-zinc-500">
          SESSION
        </span>
        <span
          className={`font-oswald text-[17px] font-semibold tracking-[0.1em] ${STATUS_COLOR[session.status]}`}
        >
          {session.status.toUpperCase()}
        </span>
        <span className="h-[18px] w-px bg-white/12" />
        <span className="font-jetbrains text-xs text-zinc-400">
          {mode.toUpperCase()}
        </span>
      </div>
      <div className="flex gap-2.5">
        {error && (
          <span className="self-center font-jetbrains text-[10px] text-red-400">
            {error}
          </span>
        )}
        {buttons.map((b) => (
          <button
            key={b.mode}
            type="button"
            onClick={() => void switchMode(b.mode)}
            disabled={busy}
            className="h-[54px] rounded-[11px] bg-red-600 px-5 font-oswald text-[15px] font-semibold tracking-[0.1em] text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {b.label}
          </button>
        ))}
      </div>
    </header>
  );
}
