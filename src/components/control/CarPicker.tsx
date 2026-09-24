import { CAR_LIST, type Car } from "../../lib/carList";
import { SearchablePicker } from "./SearchablePicker";

interface Props {
  value: Car | null;
  onChange: (car: Car | null) => void;
}

export function CarPicker({ value, onChange }: Props) {
  return (
    <SearchablePicker<Car>
      items={CAR_LIST}
      value={value}
      onChange={onChange}
      getKey={(c) => c.id}
      getDisplayValue={(item, q) => (item ? item.name : q)}
      matchesQuery={(c, q) => c.name.toLowerCase().includes(q.toLowerCase())}
      renderRow={(car) => (
        <span className="flex items-center justify-between gap-4">
          <span className="truncate">{car.name}</span>
          <span className="text-xs text-zinc-500 shrink-0 font-jetbrains">
            #{car.id}
          </span>
        </span>
      )}
      placeholder="Search car name…"
      emptyMessage={(q) => `No cars match "${q}"`}
      footer={(v) =>
        v ? (
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs text-zinc-500 font-jetbrains">
              ID: <span className="text-zinc-300">{v.id}</span>
            </span>
          </div>
        ) : null
      }
    />
  );
}
