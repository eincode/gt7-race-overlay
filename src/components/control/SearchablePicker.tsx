import { useRef, useState } from "react";
import { useClickOutside } from "../../hooks/useClickOutside";

const DEFAULT_MAX_RESULTS = 40;

export interface SearchablePickerProps<T> {
  items: readonly T[];
  value: T | null;
  onChange: (item: T | null) => void;
  getKey: (item: T) => string | number;
  getDisplayValue: (item: T | null, query: string) => string;
  matchesQuery: (item: T, query: string) => boolean;
  renderRow: (item: T) => React.ReactNode;
  placeholder?: string;
  emptyMessage?: (query: string) => string;
  footer?: (item: T | null) => React.ReactNode;
  maxResults?: number;
  inputClassName?: string;
}

export function SearchablePicker<T>({
  items,
  value,
  onChange,
  getKey,
  getDisplayValue,
  matchesQuery,
  renderRow,
  placeholder = "Search…",
  emptyMessage,
  footer,
  maxResults = DEFAULT_MAX_RESULTS,
  inputClassName = "w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 pr-8 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-400 transition-colors",
}: SearchablePickerProps<T>) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useClickOutside(containerRef, () => {
    setOpen(false);
    setQuery("");
  });

  const filtered =
    query.trim().length >= 1
      ? items.filter((c) => matchesQuery(c, query)).slice(0, maxResults)
      : [];

  const displayValue = getDisplayValue(value, query);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    if (value) onChange(null);
    setOpen(true);
  }

  function handleSelect(item: T) {
    onChange(item);
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange(null);
    setQuery("");
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
          onFocus={() => {
            if (!value) setOpen(true);
          }}
          onClick={() => {
            if (value) {
              onChange(null);
              setOpen(true);
            }
          }}
          placeholder={placeholder}
          autoComplete="off"
          className={inputClassName}
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

      {footer?.(value)}

      {open && filtered.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-zinc-800 border border-zinc-600 rounded shadow-xl max-h-56 overflow-y-auto">
          {filtered.map((item) => (
            <li key={getKey(item)}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(item);
                }}
                className="w-full text-left px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-700 transition-colors"
              >
                {renderRow(item)}
              </button>
            </li>
          ))}
          {filtered.length === maxResults && (
            <li className="px-3 py-2 text-xs text-zinc-500 border-t border-zinc-700 font-jetbrains">
              Showing first {maxResults} — keep typing to narrow
            </li>
          )}
        </ul>
      )}

      {open && query.trim().length >= 1 && filtered.length === 0 && (
        <div className="absolute z-50 mt-1 w-full bg-zinc-800 border border-zinc-600 rounded px-3 py-3 text-sm text-zinc-500">
          {emptyMessage ? emptyMessage(query) : `No results for "${query}"`}
        </div>
      )}
    </div>
  );
}
