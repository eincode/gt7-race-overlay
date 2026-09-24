import { InfoCard } from "./InfoCard";

const SHORTCUTS = [
  { keys: "Alt + 1", label: "Toggle Standings" },
  { keys: "Alt + 2", label: "Toggle Sector Compare" },
  { keys: "Alt + 3", label: "Toggle Car Telemetry" },
  { keys: "Alt + 4", label: "Toggle Driver Showcase" },
  { keys: "Alt + 5", label: "Toggle Driver Telemetry" },
];

export function KeyboardShortcuts() {
  return (
    <InfoCard title="KEYBOARD SHORTCUTS">
      <div className="flex flex-col gap-2">
        {SHORTCUTS.map((sc) => (
          <div
            key={sc.keys}
            className="flex items-center gap-[14px] rounded-[11px] bg-[#232326] px-[14px] py-3"
          >
            <span className="min-w-[86px] rounded-lg border border-[#52525b] bg-[#2b2b30] px-[10px] py-2 text-center font-jetbrains text-xs font-bold text-zinc-200">
              {sc.keys}
            </span>
            <span className="text-[15px] text-zinc-400">{sc.label}</span>
          </div>
        ))}
      </div>
    </InfoCard>
  );
}
