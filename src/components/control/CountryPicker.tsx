import { COUNTRY_LIST, countryFlag, type Country } from "../../lib/countryList";
import { SearchablePicker } from "./SearchablePicker";

interface Props {
  value: string | null; // ISO 3166-1 alpha-2 code, e.g. "JP"
  onChange: (code: string | null) => void;
  inputClassName?: string;
}

export function CountryPicker({ value, onChange, inputClassName }: Props) {
  const selected = value
    ? (COUNTRY_LIST.find((c) => c.code === value) ?? null)
    : null;

  return (
    <SearchablePicker<Country>
      items={COUNTRY_LIST}
      value={selected}
      onChange={(item) => onChange(item?.code ?? null)}
      inputClassName={inputClassName}
      getKey={(c) => c.code}
      getDisplayValue={(item, q) =>
        item ? `${countryFlag(item.code)}  ${item.name}` : q
      }
      matchesQuery={(c, q) =>
        c.name.toLowerCase().includes(q.toLowerCase()) ||
        c.code.toLowerCase().startsWith(q.toLowerCase())
      }
      renderRow={(country) => (
        <span className="flex items-center gap-3">
          <span className="text-lg shrink-0">{countryFlag(country.code)}</span>
          <span className="flex-1 truncate">{country.name}</span>
          <span className="text-xs text-zinc-500 shrink-0 font-jetbrains">
            {country.code}
          </span>
        </span>
      )}
      placeholder="Search country…"
      emptyMessage={(q) => `No countries match "${q}"`}
    />
  );
}
