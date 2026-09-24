import { countryFlag } from "../../lib/countryList";
import type { LocalDriver } from "../control/localDriver";

export function DriverCard({
  driver,
  index,
  onRemove,
}: {
  driver: LocalDriver;
  index: number;
  onRemove: () => void;
}) {
  const flag = driver.country ? countryFlag(driver.country) : "🏁";

  return (
    <div className="flex items-center gap-4 p-3 rounded-lg bg-zinc-900/60 border border-zinc-700/40 group">
      {/* Photo / initials */}
      <div className="w-12 h-12 rounded-md overflow-hidden bg-zinc-800 shrink-0 flex items-center justify-center">
        {driver.photoBase64 ? (
          <img
            src={driver.photoBase64}
            alt={driver.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-lg font-bold font-oswald text-zinc-600">
            {driver.name
              ? driver.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
              : "?"}
          </span>
        )}
      </div>

      {/* Position badge */}
      <div className="w-8 text-center font-bold text-zinc-400 text-sm font-oswald shrink-0">
        {String(index + 1).padStart(2, "0")}
      </div>

      {/* Flag */}
      <span className="text-xl shrink-0">{flag}</span>

      {/* Name + country code */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-zinc-100 text-sm truncate font-barlow">
          {driver.name || <span className="text-zinc-500 italic">Unnamed</span>}
        </div>
        <div className="text-xs text-zinc-500 font-jetbrains mt-0.5">
          {driver.country || "—"}
        </div>
      </div>

      {/* Remove */}
      <button
        type="button"
        onClick={onRemove}
        className="text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0 ml-1"
        title="Remove driver"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
