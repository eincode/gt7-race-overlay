import type { SlotData } from "./SlotCard";
import { SlotCard } from "./SlotCard";

export type PanelKey =
  | "standings"
  | "sector"
  | "carTelemetry"
  | "driverShowcase"
  | "driverTelemetry";

export type PanelData = {
  key: PanelKey;
  title: string;
  live: boolean;
  slots: SlotData[];
};

export function PanelCard({
  panel,
  busy,
  onSlotClick,
  onToggle,
}: {
  panel: PanelData;
  busy?: boolean;
  onSlotClick: (panelKey: PanelKey, tag: string) => void;
  onToggle: (panelKey: PanelKey) => void;
}) {
  return (
    <section className="overflow-hidden rounded-[18px] border border-white/9 bg-[#1c1c1f]">
      <div className="flex items-center gap-4 px-5 py-[18px]">
        <span
          className={`h-[34px] w-1 rounded-sm ${panel.live ? "bg-red-600" : "bg-zinc-700"}`}
        />
        <span className="flex-1 font-oswald text-[21px] font-medium tracking-[0.07em] text-zinc-100">
          {panel.title}
        </span>
        <button
          type="button"
          onClick={() => onToggle(panel.key)}
          disabled={busy}
          className={`flex h-[58px] min-w-[132px] items-center justify-center gap-2 rounded-xl font-jetbrains text-sm font-bold tracking-[0.12em] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            panel.live
              ? "bg-red-600 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]"
              : "bg-[#2b2b30] text-[#8b8b93]"
          }`}
        >
          {panel.live ? (
            <>
              <span className="h-2 w-2 rounded-full bg-white animate-[pulseDot_2s_ease_infinite]" />
              LIVE
            </>
          ) : (
            <>○ HIDDEN</>
          )}
        </button>
      </div>
      {panel.slots.length > 0 && (
        <div className="flex flex-col gap-2.5 px-5 pb-5">
          {panel.slots.map((slot) => (
            <SlotCard
              key={`${panel.title}-${slot.tag}`}
              slot={slot}
              onClick={() => onSlotClick(panel.key, slot.tag)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
