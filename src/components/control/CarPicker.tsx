import { useEffect, useRef, useState } from 'react';
import { CAR_LIST, type Car } from '../../lib/carList';

interface Props {
  value: Car | null;
  onChange: (car: Car | null) => void;
}

const MAX_RESULTS = 40;

export function CarPicker({ value, onChange }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
      ? CAR_LIST.filter(c =>
          c.name.toLowerCase().includes(query.toLowerCase()),
        ).slice(0, MAX_RESULTS)
      : [];

  const displayValue = value ? value.name : query;

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    if (value) onChange(null); // clear selection when typing
    setOpen(true);
  }

  function handleSelect(car: Car) {
    onChange(car);
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
          placeholder="Search car name…"
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

      {/* Car ID badge */}
      {value && (
        <div className="mt-1 flex items-center gap-2">
          <span className="text-xs text-zinc-500 font-[family-name:var(--font-jetbrains)]">
            ID: <span className="text-zinc-300">{value.id}</span>
          </span>
        </div>
      )}

      {/* Dropdown */}
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-zinc-800 border border-zinc-600 rounded shadow-xl max-h-56 overflow-y-auto">
          {filtered.map(car => (
            <li key={car.id}>
              <button
                type="button"
                onMouseDown={e => { e.preventDefault(); handleSelect(car); }}
                className="w-full text-left px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-700 transition-colors flex items-center justify-between gap-4"
              >
                <span className="truncate">{car.name}</span>
                <span className="text-xs text-zinc-500 shrink-0 font-[family-name:var(--font-jetbrains)]">
                  #{car.id}
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
          No cars match "{query}"
        </div>
      )}
    </div>
  );
}
