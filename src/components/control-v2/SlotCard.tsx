export type SlotData = {
  tag: string;
  country: string;
  name: string;
  hasPhoto: boolean;
  filled: boolean;
  photo: string | null;
};

export function SlotCard({ slot, onClick }: { slot: SlotData; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-[14px] border bg-[#232326] px-3 py-3 ${
        slot.hasPhoto ? "border-white/11" : "border-white/5"
      }`}
    >
      <span
        className={`flex h-[82px] w-[82px] shrink-0 items-center justify-center overflow-hidden rounded-[11px] p-1 bg-[repeating-linear-gradient(135deg,#202024_0px,#202024_6px,#26262b_6px,#26262b_12px)] ${
          slot.hasPhoto ? "border border-white/10" : "border border-dashed border-[#45454d]"
        }`}
      >
        {slot.photo ? (
          <img
            src={slot.photo}
            alt={`${slot.name} portrait`}
            className="h-full w-full rounded-[10px] object-cover"
          />
        ) : (
          <span className="text-center font-jetbrains text-[8px] leading-[1.4] tracking-[0.1em] whitespace-pre-line text-[#5c5c64]">
            {slot.hasPhoto ? "DRIVER\nPHOTO" : "NO\nPHOTO"}
          </span>
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
        <span className="flex items-center gap-2">
          <span className="rounded-[5px] bg-white/7 px-2 py-[3px] font-jetbrains text-[10px] font-bold tracking-[0.14em] text-zinc-400">
            {slot.tag}
          </span>
          <span className="font-jetbrains text-[10px] tracking-[0.12em] text-zinc-500">
            {slot.country}
          </span>
        </span>
        <span
          className={`text-left font-oswald text-[23px] font-semibold leading-[1.05] tracking-[0.05em] ${
            slot.filled ? "text-zinc-100" : "text-[#6b6b73]"
          }`}
        >
          {slot.name}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-2 rounded-[10px] bg-white/6 px-[14px] py-[11px] font-jetbrains text-[11px] font-bold tracking-[0.14em] text-zinc-400">
        CHANGE
      </span>
    </button>
  );
}
