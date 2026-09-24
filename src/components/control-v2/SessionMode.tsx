import { useState } from "react";
import { api } from "../../lib/api";
import { clearDriverPhotos, fmtTimestamp } from "../../lib/utils";
import type { Session, SessionMode as SessionModeType } from "../../types";
import { InfoCard } from "./InfoCard";

const MODES: SessionModeType[] = ["race", "qualifying", "practice"];

export function SessionMode({
  session,
  onModeChanged,
  onDelete,
}: {
  session: Session;
  onModeChanged: (mode: SessionModeType) => void;
  onDelete: () => void;
}) {
  const [busyMode, setBusyMode] = useState(false);
  const [busyDelete, setBusyDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mode = session.mode;

  const switchMode = async (next: SessionModeType) => {
    if (next === mode || busyMode) return;
    setBusyMode(true);
    setError(null);
    try {
      await api.setMode(next);
      onModeChanged(next);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyMode(false);
    }
  };

  const deleteSession = async () => {
    setBusyDelete(true);
    setError(null);
    try {
      await api.deleteSession();
      clearDriverPhotos();
      onDelete();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyDelete(false);
    }
  };

  const stats = [
    { label: "SESSION ID", value: `${session.id.slice(0, 8)}…` },
    { label: "CREATED", value: fmtTimestamp(session.createdAt) },
    { label: "DRIVERS", value: String(session.roster.length) },
  ];

  return (
    <InfoCard title="SESSION MODE" gap="gap-4">
      <div className="flex flex-col gap-4">
        <div className="flex gap-2.5">
          {MODES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => void switchMode(m)}
              disabled={busyMode}
              className={`h-[62px] flex-1 rounded-xl font-oswald text-[17px] font-semibold tracking-[0.12em] transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                mode === m
                  ? "bg-red-600 text-white"
                  : "bg-[#2b2b30] text-[#9b9ba3]"
              }`}
            >
              {m.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-white/6 bg-[#232326] px-4 py-[14px]"
            >
              <div className="mb-1.5 font-jetbrains text-[9px] font-bold tracking-[0.16em] text-zinc-500">
                {stat.label}
              </div>
              <div className="font-jetbrains text-[15px] text-zinc-200">
                {stat.value}
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={deleteSession}
          disabled={busyDelete}
          className="h-[60px] rounded-xl border border-red-600/40 bg-red-600/14 font-oswald text-[17px] font-semibold tracking-[0.12em] text-red-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {busyDelete ? "DELETING…" : "DELETE SESSION"}
        </button>
        {error && (
          <p className="font-jetbrains text-xs tracking-[0.12em] text-red-400">
            FAILED — {error}
          </p>
        )}
      </div>
    </InfoCard>
  );
}
