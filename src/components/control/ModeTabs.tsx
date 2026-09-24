import type { SessionMode } from "../../types";

const MODES: { value: SessionMode; label: string }[] = [
  { value: "race", label: "Race" },
  { value: "qualifying", label: "Qualifying" },
  { value: "practice", label: "Practice" },
];

export function ModeTabs({
  current,
  onSelect,
  disabled,
}: {
  current: SessionMode;
  onSelect: (mode: SessionMode) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-2">
      {MODES.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => onSelect(value)}
          disabled={disabled}
          className={`flex-1 py-2 text-sm font-bold tracking-wider rounded transition-colors font-oswald disabled:opacity-50 ${
            current === value
              ? "bg-red-600 text-white"
              : "bg-zinc-700 hover:bg-zinc-600 text-zinc-400"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
