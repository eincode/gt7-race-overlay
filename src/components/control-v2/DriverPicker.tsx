import { useState } from "react";
import type { RosterEntry } from "../../types";

type DriverPickerProps = {
  title: string;
  roster: RosterEntry[];
  onClose: () => void;
  onSelect?: (driverId: number | null) => void;
};

function DriverCard({
  driver,
  selected,
  onPick,
}: {
  driver: RosterEntry | null;
  selected: boolean;
  onPick: () => void;
}) {
  const isNone = driver === null;
  return (
    <button
      type="button"
      onClick={onPick}
      className={`flex w-full flex-col rounded-2xl border transition-colors ${
        selected
          ? "border-red-600 bg-red-600/14 shadow-[0_0_0_3px_rgba(220,38,38,0.2)]"
          : "border-white/8 bg-[#212125]"
      }`}
    >
      <span className="flex items-center justify-between px-3 pt-[10px] pb-2">
        <span className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-white/7 font-jetbrains text-xs font-bold text-zinc-400">
          {isNone ? "—" : driver.id}
        </span>
        <span
          className={`font-jetbrains text-[10px] font-bold tracking-[0.14em] ${
            selected ? "text-red-400" : "text-[#5c5c64]"
          }`}
        >
          {isNone ? "SELECTED" : "OFFLINE"}
        </span>
      </span>
      <span
        className={`mx-3 flex h-[150px] items-center justify-center overflow-hidden rounded-[10px] border bg-[repeating-linear-gradient(135deg,#1d1d21_0px,#1d1d21_7px,#24242a_7px,#24242a_14px)] ${
          isNone ? "border-dashed border-[#45454d]" : "border-white/8"
        }`}
      >
        <span className="text-center font-jetbrains text-[9px] leading-[1.5] tracking-[0.12em] whitespace-pre-line text-[#5c5c64]">
          {isNone ? "NO\nDRIVER" : "DRIVER\nPHOTO"}
        </span>
      </span>
      <span className="flex flex-col gap-1 px-3 pt-3 pb-[14px] text-left">
        <span
          className={`font-oswald text-2xl font-semibold leading-[1.05] tracking-[0.04em] ${
            isNone ? "text-white" : "text-zinc-200"
          }`}
        >
          {isNone ? "NONE" : driver.name}
        </span>
        <span className="font-jetbrains text-[10px] tracking-[0.16em] text-zinc-500">
          {isNone ? "CLEAR SLOT" : driver.country}
        </span>
      </span>
    </button>
  );
}

export function DriverPicker({
  title,
  roster,
  onClose,
  onSelect,
}: DriverPickerProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const pick = (id: number | null) => {
    setSelectedId(id);
    onSelect?.(id);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div
        className="absolute inset-0 bg-black/62"
        onClick={onClose}
      />
      <div className="relative max-h-[78vh] overflow-y-auto rounded-t-[22px] border-t border-white/12 bg-[#1c1c1f] px-6 pt-5 pb-7 animate-[sheetUp_0.22s_ease-out]">
        <div className="mb-[18px] flex items-center gap-4">
          <span className="h-[30px] w-1 rounded-sm bg-red-600" />
          <span className="flex-1 font-oswald text-[21px] tracking-[0.08em] text-zinc-100">
            {title}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="h-[52px] w-[52px] rounded-[13px] bg-[#2b2b30] text-[22px] leading-none text-zinc-400"
          >
            ×
          </button>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(208px,1fr))] gap-[14px]">
          <DriverCard driver={null} selected={selectedId === null} onPick={() => pick(null)} />
          {roster.map((driver) => (
            <DriverCard
              key={driver.id}
              driver={driver}
              selected={selectedId === driver.id}
              onPick={() => pick(driver.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
