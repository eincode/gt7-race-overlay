export type NavKey = "overlays" | "drivers" | "session";

const NAV_ITEMS: { key: NavKey; label: string; sub: string }[] = [
  { key: "overlays", label: "OVERLAYS", sub: "2 LIVE" },
  { key: "drivers", label: "DRIVERS", sub: "6 ENTRIES" },
  { key: "session", label: "SESSION", sub: "PRACTICE" },
];

export function Sidebar({
  active,
  onNavChange,
  setup = false,
}: {
  active: NavKey;
  onNavChange: (key: NavKey) => void;
  setup?: boolean;
}) {
  return (
    <aside className="sticky top-0 flex h-screen w-[132px] shrink-0 flex-col gap-2.5 border-r border-white/7 bg-[#191919] px-3 py-[18px]">
      <div className="px-1.5 pb-[14px]">
        <div className="font-oswald text-[22px] font-bold leading-none tracking-[0.06em] text-zinc-50">
          GT7
        </div>
        <div className="mt-[3px] font-jetbrains text-[9px] tracking-[0.18em] text-red-600">
          OVERLAY
        </div>
      </div>

      {setup ? (
        <button
          type="button"
          className="flex flex-col items-start gap-[3px] rounded-xl bg-red-600 px-3 py-4 text-left text-white"
        >
          <span className="font-oswald text-[15px] tracking-[0.1em]">SETUP</span>
          <span className="font-jetbrains text-[10px] tracking-[0.1em] opacity-60">
            NEW SESSION
          </span>
        </button>
      ) : (
        NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onNavChange(item.key)}
            className={`flex flex-col items-start gap-[3px] rounded-xl px-3 py-4 text-left transition-colors ${
              active === item.key ? "bg-red-600 text-white" : "bg-[#232326] text-zinc-500"
            }`}
          >
            <span className="font-oswald text-[15px] tracking-[0.1em]">{item.label}</span>
            <span className="font-jetbrains text-[10px] tracking-[0.1em] opacity-60">
              {item.sub}
            </span>
          </button>
        ))
      )}

      <div className="flex-1" />

      <div className="flex items-center gap-2 rounded-[10px] border border-green-400/25 bg-green-400/10 px-[10px] py-3">
        <span className="h-2 w-2 shrink-0 rounded-full bg-green-400 animate-[pulseDot_2s_ease_infinite]" />
        <span className="font-jetbrains text-[9px] font-bold tracking-[0.1em] text-green-300">
          ONLINE
        </span>
      </div>
      <a
        href="/overlay/stencil"
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-[10px] border border-white/8 bg-[#242428] px-2 py-[14px] text-center font-jetbrains text-[10px] font-bold tracking-[0.1em] text-zinc-300"
      >
        OPEN ↗
      </a>
    </aside>
  );
}
