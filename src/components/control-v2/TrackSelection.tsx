import type { Track } from "../../types";
import { InfoCard } from "./InfoCard";
import { TrackMapImage, trackSpec } from "./TrackSelector";

export function TrackSelection({
  track,
  onOpen,
}: {
  track: Track | null;
  onOpen: () => void;
}) {
  return (
    <InfoCard title="TRACK">
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full items-center gap-4 rounded-[14px] border border-white/11 bg-[#232326] p-[14px]"
      >
        <span
          className={`flex h-[104px] w-[104px] shrink-0 items-center justify-center overflow-hidden rounded-[11px] border border-white/9 p-1 ${track ? "bg-white" : "bg-[repeating-linear-gradient(135deg,#202024_0px,#202024_6px,#26262b_6px,#26262b_12px)]"}`}
        >
          {track ? (
            <TrackMapImage
              imagePath={track.imagePath}
              className="h-full w-full rounded-[8px] object-contain"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center font-jetbrains text-[9px] leading-[1.6] tracking-[0.14em] whitespace-pre-line text-[#5c5c64]">
              TRACK MAP
            </span>
          )}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-2 py-1 text-left">
          {track ? (
            <>
              <span className="font-jetbrains text-[10px] font-bold tracking-[0.16em] text-zinc-500 uppercase">
                {track.country}
              </span>
              <span className="font-oswald text-[27px] font-semibold leading-[1.05] tracking-[0.04em] text-zinc-100">
                {track.name}
              </span>
              <span className="font-jetbrains text-xs tracking-[0.08em] text-[#8b8b93]">
                {trackSpec(track)}
              </span>
            </>
          ) : (
            <span className="font-oswald text-[21px] font-semibold tracking-[0.06em] text-zinc-500">
              SELECT A TRACK
            </span>
          )}
        </span>
        <span className="shrink-0 self-center rounded-[10px] bg-white/6 px-[15px] py-3 font-jetbrains text-[11px] font-bold tracking-[0.14em] text-zinc-400">
          CHANGE
        </span>
      </button>
    </InfoCard>
  );
}
