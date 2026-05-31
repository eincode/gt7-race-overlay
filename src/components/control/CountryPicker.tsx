import { useEffect, useRef, useState } from 'react';
import { COUNTRY_LIST, countryFlag, type Country } from '../../lib/countryList';

interface Props {
  value: string | null; // ISO 3166-1 alpha-2 code, e.g. "JP"
  onChange: (code: string | null) => void;
}

const MAX_RESULTS = 40;

export function CountryPicker({ value, onChange }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = value ? COUNTRY_LIST.find(c => c.code === value) ?? null : null;

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const filtered =
    query.trim().length >= 1
      ? COUNTRY_LIST.filter(c =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.code.toLowerCase().startsWith(query.toLowerCase()),
        ).slice(0, MAX_RESULTS)
      : [];

  const displayValue = selected
    ? `${countryFlag(selected.code)}  ${selected.name}`
    : query;

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    if (value) onChange(null);
    setOpen(true);
  }

  function handleSelect(country: Country) {
    onChange(country.code);
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange(null);
    setQuery('');
    setOpen(false);
    inputRef.current?.focus();
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={() => { if (!value) setOpen(true); }}
          onClick={() => { if (value) { onChange(null); setOpen(true); } }}
          placeholder="Search country…"
          autoComplete="off"
          className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 pr-8 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-400 transition-colors"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200 transition-colors text-lg leading-none"
          >
            ×
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-zinc-800 border border-zinc-600 rounded shadow-xl max-h-56 overflow-y-auto">
          {filtered.map(country => (
            <li key={country.code}>
              <button
                type="button"
                onMouseDown={e => { e.preventDefault(); handleSelect(country); }}
                className="w-full text-left px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-700 transition-colors flex items-center gap-3"
              >
                <span className="text-lg shrink-0">{countryFlag(country.code)}</span>
                <span className="flex-1 truncate">{country.name}</span>
                <span className="text-xs text-zinc-500 shrink-0 font-[family-name:var(--font-jetbrains)]">
                  {country.code}
                </span>
              </button>
            </li>
          ))}
          {filtered.length === MAX_RESULTS && (
            <li className="px-3 py-2 text-xs text-zinc-500 border-t border-zinc-700 font-[family-name:var(--font-jetbrains)]">
              Showing first {MAX_RESULTS} — keep typing to narrow
            </li>
          )}
        </ul>
      )}

      {open && query.trim().length >= 1 && filtered.length === 0 && (
        <div className="absolute z-50 mt-1 w-full bg-zinc-800 border border-zinc-600 rounded px-3 py-3 text-sm text-zinc-500">
          No countries match "{query}"
        </div>
      )}
    </div>
  );
}
