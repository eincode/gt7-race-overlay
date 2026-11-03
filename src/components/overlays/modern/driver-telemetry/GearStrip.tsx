import { currentGearStyle, GEAR_CELL_WIDTH, telemetryStyles as T } from "../styles";

/** The current gear sits this many cells from the left; lower gears fade out before it. */
const CURRENT_GEAR_SLOT = 3;

/** Every gear in a row, slid so the current one stays in the same place. Gear 0 is "N". */
export function GearStrip({ current, gears }: { current: number; gears: number }) {
  const labels = ["N", ...Array.from({ length: Math.max(gears, current) }, (_, i) => String(i + 1))];
  const offset = (CURRENT_GEAR_SLOT - current) * GEAR_CELL_WIDTH;

  return (
    <div style={T.gearWindow}>
      <div style={{ ...T.gearStrip, transform: `translateX(${offset}px)` }}>
        {labels.map((label, gear) => (
          <span key={label} style={gear === current ? currentGearStyle() : T.gear}>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
