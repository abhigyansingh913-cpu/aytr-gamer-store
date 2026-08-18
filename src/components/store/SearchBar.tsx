import { memo, useEffect, useRef } from "react";
import { Search, SearchX } from "lucide-react";

/**
 * Dark-glass search input. Reads an initial value and exposes a global
 * "aytr-focus-search" event (used by the header search button).
 */
export const SearchBar = memo(function SearchBar({
  value,
  onChange,
  placeholder,
  autoFocus = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
    const handler = () => inputRef.current?.focus();
    window.addEventListener("aytr-focus-search", handler);
    return () => window.removeEventListener("aytr-focus-search", handler);
  }, [autoFocus]);

  return (
    <div className="glass relative flex h-12 items-center rounded-2xl">
      <Search
        className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted-foreground"
        strokeWidth={2.2}
      />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Search mods, skins, packs…"}
        aria-label="Search store"
        enterKeyHint="search"
        className="h-full w-full bg-transparent pl-10 pr-10 text-sm font-medium text-white outline-none placeholder:text-muted-foreground"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2 flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/10 hover:text-white"
        >
          <SearchX className="h-4 w-4" />
        </button>
      )}
    </div>
  );
});
