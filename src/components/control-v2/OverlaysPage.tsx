import type { OverlayState, RosterEntry, StandingsSource } from "../../types";
import type { PanelData, PanelKey } from "./PanelCard";
import { PanelCard } from "./PanelCard";
import type { SlotData } from "./SlotCard";

export const PANEL_TITLES: Record<PanelKey, string> = {
  standings: "STANDINGS",
  driverTelemetry: "DRIVER TELEMETRY",
  sector: "SECTOR COMPARE",
  carTelemetry: "CAR TELEMETRY",
  driverShowcase: "DRIVER SHOWCASE",
  trackMap: "TRACK MAP",
};

const EMPTY_SLOT = (tag: string): SlotData => ({
  tag,
  country: "EMPTY SLOT",
  name: "SELECT DRIVER",
  hasPhoto: false,
  filled: false,
  photo: null,
});

function slotFor(
  roster: RosterEntry[],
  photos: Record<number, string>,
  tag: string,
  driverId: number | null | undefined,
): SlotData {
  const driver = driverId == null ? undefined : roster.find((d) => d.id === driverId);
  return driver
    ? {
        tag,
        country: driver.country,
        name: driver.name,
        hasPhoto: Boolean(photos[driver.id]),
        filled: true,
        photo: photos[driver.id] ?? null,
      }
    : EMPTY_SLOT(tag);
}

function slotsFor(
  roster: RosterEntry[],
  photos: Record<number, string>,
  driverIds: number[],
): SlotData[] {
  return [
    slotFor(roster, photos, "A", driverIds[0]),
    slotFor(roster, photos, "B", driverIds[1]),
  ];
}

export function buildPanels(
  overlayState: OverlayState,
  roster: RosterEntry[],
  photos: Record<number, string>,
): PanelData[] {
  return [
    {
      key: "standings",
      title: PANEL_TITLES.standings,
      live: overlayState.standings.visible,
      slots: [],
    },
    {
      key: "driverTelemetry",
      title: PANEL_TITLES.driverTelemetry,
      live: overlayState.driverTelemetry.visible,
      slots: [slotFor(roster, photos, "DRV", overlayState.driverTelemetry.driverId)],
    },
    {
      key: "sector",
      title: PANEL_TITLES.sector,
      live: overlayState.sector.visible,
      slots: slotsFor(roster, photos, overlayState.sector.driverIds),
    },
    {
      key: "carTelemetry",
      title: PANEL_TITLES.carTelemetry,
      live: overlayState.carTelemetry.visible,
      slots: slotsFor(roster, photos, overlayState.carTelemetry.driverIds),
    },
    {
      key: "driverShowcase",
      title: PANEL_TITLES.driverShowcase,
      live: overlayState.driverShowcase.visible,
      slots: [slotFor(roster, photos, "DRV", overlayState.driverShowcase.driverId)],
    },
    {
      key: "trackMap",
      title: PANEL_TITLES.trackMap,
      live: overlayState.trackMap.visible,
      slots: [],
    },
  ];
}

const STANDINGS_SOURCES: { value: StandingsSource; label: string }[] = [
  { value: "game", label: "Game reported standings" },
  { value: "inferred", label: "Inferred standings" },
];

function StandingsSourceToggle({
  value,
  disabled,
  onChange,
}: {
  value: StandingsSource;
  disabled?: boolean;
  onChange: (source: StandingsSource) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Standings source"
      className="grid grid-cols-2 gap-1 rounded-xl bg-[#141416] p-1"
    >
      {STANDINGS_SOURCES.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => !selected && onChange(option.value)}
            className={`h-11 rounded-lg px-3 font-jetbrains text-xs font-bold tracking-[0.06em] transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              selected
                ? "bg-[#2b2b30] text-zinc-100 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]"
                : "text-[#8b8b93] hover:text-zinc-300"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function OverlaysPage({
  panels,
  busy,
  error,
  standingsSource,
  onSlotClick,
  onToggle,
  onStandingsSourceChange,
}: {
  panels: PanelData[];
  busy: PanelKey | null;
  error: string | null;
  standingsSource: StandingsSource;
  onSlotClick: (panelKey: PanelKey, tag: string) => void;
  onToggle: (panelKey: PanelKey) => void;
  onStandingsSourceChange: (source: StandingsSource) => void;
}) {
  return (
    <main className="grid flex-1 content-start gap-4 p-6 pb-10 grid-cols-[repeat(auto-fit,minmax(400px,1fr))]">
      {error && (
        <p className="col-span-full font-jetbrains text-xs tracking-[0.12em] text-red-400">
          FAILED — {error}
        </p>
      )}
      {panels.map((panel) => (
        <PanelCard
          key={panel.key}
          panel={panel}
          busy={busy === panel.key}
          onSlotClick={(p, tag) => onSlotClick(p, tag)}
          onToggle={onToggle}
        >
          {panel.key === "standings" && (
            <StandingsSourceToggle
              value={standingsSource}
              disabled={busy === "standings"}
              onChange={onStandingsSourceChange}
            />
          )}
        </PanelCard>
      ))}
    </main>
  );
}
