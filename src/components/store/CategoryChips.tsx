import { memo } from "react";
import { cn } from "@/lib/utils";

export interface Chip {
  id: string;
  label: string;
  count?: number;
}

export const CategoryChips = memo(function CategoryChips({
  chips,
  activeId,
  onSelect,
}: {
  chips: Chip[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  if (chips.length === 0) return null;
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      {chips.map((chip) => {
        const active = chip.id === activeId;
        return (
          <button
            key={chip.id}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(chip.id)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors active:scale-95",
              active
                ? "bg-accent-red text-white shadow-[var(--shadow-red)]"
                : "surface text-muted-foreground hover:text-white",
            )}
          >
            {chip.label}
            {typeof chip.count === "number" && chip.count > 0 && (
              <span
                className={cn(
                  "rounded-full px-1.5 text-[10px] font-bold",
                  active ? "bg-white/20 text-white" : "bg-white/10 text-muted-foreground",
                )}
              >
                {chip.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
});
