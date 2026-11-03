import { useEffect, useState } from "react";
import { api, baseUrl } from "../../lib/api";
import type { Track, TrackLayout, TrackVenue } from "../../types";
import { TrackMap } from "./TrackMap";

export function trackSpec(t: Pick<Track, "totalLength" | "totalSectors">): string {
  return `${(t.totalLength / 1000).toFixed(3)} KM · ${t.totalSectors} SECTORS`;
}

export function TrackMapImage({
  imagePath,
  className,
}: {
  imagePath: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className="flex h-full w-full items-center justify-center font-jetbrains text-[9px] leading-[1.5] tracking-[0.12em] whitespace-pre-line text-[#5c5c64]">
        TRACK MAP
      </span>
    );
  }
  return (
    <img
      src={baseUrl() + imagePath}
      alt="Track map"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

function VenueCard({
  venue,
  selected,
  onPick,
}: {
  venue: TrackVenue;
  selected: boolean;
  onPick: () => void;
}) {
  const count = venue.layouts.length;
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
      <span className="flex items-center justify-between px-[13px] pt-[11px] pb-2">
        <span className="font-jetbrains text-[10px] font-bold tracking-[0.16em] text-zinc-400">
          {venue.country}
        </span>
        {selected && (
          <span className="font-jetbrains text-[10px] font-bold tracking-[0.14em] text-red-400">
            SELECTED
          </span>
        )}
      </span>
      <span className="mx-[13px] p-2 bg-white flex h-[140px] items-center justify-center overflow-hidden rounded-[10px] border border-white/8">
        <TrackMapImage
          imagePath={venue.imagePath}
          className="h-full w-full object-cover"
        />
      </span>
      <span className="flex flex-col gap-[5px] px-[13px] pt-3 pb-[14px] text-left">
        <span
          className={`font-oswald text-[21px] font-semibold leading-[1.08] tracking-[0.03em] ${
            selected ? "text-white" : "text-zinc-200"
          }`}
        >
          {venue.name}
        </span>
        <span className="font-jetbrains text-[10px] tracking-[0.12em] text-zinc-500">
          {count} {count === 1 ? "LAYOUT" : "LAYOUTS"}
        </span>
      </span>
    </button>
  );
}

function LayoutCard({
  layout,
  selected,
  onPick,
}: {
  layout: TrackLayout;
  selected: boolean;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      className={`flex w-full flex-col gap-[5px] rounded-2xl border px-[13px] py-[14px] text-left transition-colors ${
        selected
          ? "border-red-600 bg-red-600/14 shadow-[0_0_0_3px_rgba(220,38,38,0.2)]"
          : "border-white/8 bg-[#212125]"
      }`}
    >
      <span className="mb-[7px] flex h-[160px] items-center justify-center rounded-[10px] border border-white/8 bg-[#141416] p-3">
        <TrackMap trackId={layout.id} className="h-full w-full" />
      </span>
      <span className="flex items-center justify-between gap-2">
        <span
          className={`font-oswald text-[21px] font-semibold leading-[1.08] tracking-[0.03em] ${
            selected ? "text-white" : "text-zinc-200"
          }`}
        >
          {layout.name}
        </span>
        {selected && (
          <span className="font-jetbrains text-[10px] font-bold tracking-[0.14em] text-red-400">
            SELECTED
          </span>
        )}
      </span>
      <span className="font-jetbrains text-[10px] tracking-[0.12em] text-zinc-500">
        {trackSpec(layout)}
      </span>
    </button>
  );
}

export function TrackSelector({
  selectedId,
  onClose,
  onSelect,
}: {
  selectedId?: string | null;
  onClose: () => void;
  onSelect: (track: Track) => void;
}) {
  const [query, setQuery] = useState("");
  const [venues, setVenues] = useState<TrackVenue[]>([]);
  const [venue, setVenue] = useState<TrackVenue | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getTracks()
      .then((res) => {
        if (!cancelled) setVenues(res);
      })
      .catch((e) => {
        if (!cancelled)
          setError(
            e instanceof Error
              ? e.message + "--" + e.name + "baseUrl: " + baseUrl()
              : "Request failed",
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const q = query.toLowerCase();
  const filtered = venues.filter(
    (v) =>
      v.name.toLowerCase().includes(q) ||
      v.country.toLowerCase().includes(q) ||
      v.layouts.some((l) => l.name.toLowerCase().includes(q)),
  );

  const pick = (v: TrackVenue, layout: TrackLayout) => {
    onSelect({
      id: layout.id,
      name: v.name,
      layoutName: layout.name,
      country: v.country,
      totalLength: layout.totalLength,
      totalSectors: layout.totalSectors,
      imagePath: v.imagePath,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/62" onClick={onClose} />
      <div className="relative max-h-[82vh] overflow-y-auto rounded-t-[22px] border-t border-white/12 bg-[#1c1c1f] px-6 pt-5 pb-7 animate-[sheetUp_0.22s_ease-out]">
        <div className="mb-4 flex items-center gap-4">
          {venue ? (
            <button
              type="button"
              onClick={() => setVenue(null)}
              className="h-[52px] w-[52px] rounded-[13px] bg-[#2b2b30] text-[22px] leading-none text-zinc-400"
              aria-label="Back to tracks"
            >
              ←
            </button>
          ) : (
            <span className="h-[30px] w-1 rounded-sm bg-red-600" />
          )}
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="font-oswald text-[21px] tracking-[0.08em] text-zinc-100">
              {venue ? "SELECT LAYOUT" : "SELECT TRACK"}
            </span>
            {venue && (
              <span className="truncate font-jetbrains text-[11px] tracking-[0.12em] text-zinc-500 uppercase">
                {venue.name} · {venue.country}
              </span>
            )}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="h-[52px] w-[52px] rounded-[13px] bg-[#2b2b30] text-[22px] leading-none text-zinc-400"
          >
            ×
          </button>
        </div>

        {venue ? (
          <div className="flex flex-wrap items-start gap-[14px]">
            <span className="flex h-[140px] w-[224px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-white/8 bg-white p-2">
              <TrackMapImage
                imagePath={venue.imagePath}
                className="h-full w-full object-contain"
              />
            </span>
            <div className="grid min-w-[224px] flex-1 grid-cols-[repeat(auto-fill,minmax(224px,1fr))] gap-[14px]">
              {venue.layouts.map((layout) => (
                <LayoutCard
                  key={layout.id}
                  layout={layout}
                  selected={selectedId === layout.id}
                  onPick={() => pick(venue, layout)}
                />
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-[18px] flex flex-wrap items-center gap-3">
              <input
                placeholder="Search track, layout or country…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-[60px] min-w-[220px] flex-1 rounded-[13px] border border-[#3f3f46] bg-[#141416] px-[18px] font-jetbrains text-base text-zinc-200 outline-none placeholder:text-zinc-500 focus:border-white/25"
              />
              <button
                type="button"
                onClick={() => setQuery("")}
                className="h-[60px] rounded-[13px] bg-[#2b2b30] px-5 font-jetbrains text-xs font-bold tracking-[0.14em] text-zinc-400"
              >
                CLEAR
              </button>
              <span className="font-jetbrains text-xs tracking-[0.12em] text-zinc-500">
                {filtered.length} RESULTS
              </span>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(224px,1fr))] gap-[14px]">
              {loading && (
                <p className="font-jetbrains text-xs tracking-[0.12em] text-zinc-500">
                  LOADING TRACKS…
                </p>
              )}
              {error && (
                <p className="font-jetbrains text-xs tracking-[0.12em] text-red-400">
                  FAILED TO LOAD TRACKS — {error}
                </p>
              )}
              {!loading &&
                !error &&
                filtered.map((v) => (
                  <VenueCard
                    key={v.id}
                    venue={v}
                    selected={v.layouts.some((l) => l.id === selectedId)}
                    onPick={() => setVenue(v)}
                  />
                ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
