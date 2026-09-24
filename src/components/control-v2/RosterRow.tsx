import type { RosterEntry } from "../../types";

export function RosterRow({
  entry,
  index,
  onRemove,
}: {
  entry: RosterEntry & { photoBase64?: string | null };
  index: number;
  onRemove: (id: number) => void;
}) {
  return (
    <div className="flex items-center gap-[14px] rounded-xl border border-white/6 bg-[#232326] px-4 py-[14px]">
      {entry.photoBase64 ? (
        <img
          src={entry.photoBase64}
          alt={`${entry.name} portrait`}
          className="h-[34px] w-[34px] shrink-0 rounded-[9px] object-cover"
        />
      ) : (
        <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] bg-[#2d2d31] font-jetbrains text-[13px] text-zinc-400">
          {index + 1}
        </span>
      )}
      <span className="min-w-0 flex-1 font-jetbrains text-[15px] font-bold tracking-[0.03em] text-zinc-100">
        {entry.name}
      </span>
      <span className="flex items-center gap-[7px] font-jetbrains text-[11px] tracking-[0.1em] text-red-500">
        <span className="h-2 w-2 rounded-full bg-red-500" />
        OFFLINE
      </span>
      <button
        type="button"
        onClick={() => onRemove(entry.id)}
        className="h-[44px] w-[44px] shrink-0 rounded-[11px] bg-red-600/12 text-xl leading-none text-red-400"
      >
        ×
      </button>
    </div>
  );
}
