import type { HoldStatus } from "@/api/holdApi"

export type FilterStatus = "ALL" | HoldStatus

interface ApplicationStatusFilterProps {
  currentFilter: FilterStatus
  onFilterChange: (status: FilterStatus) => void
  counts: Record<FilterStatus, number>
}

const filterOptions: { label: string; value: FilterStatus }[] = [
  { label: "All", value: "ALL" },
  { label: "On Hold", value: "HELD" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Expired", value: "EXPIRED" },
  { label: "Cancelled", value: "CANCELLED" },
]

export function ApplicationStatusFilter({
  currentFilter,
  onFilterChange,
  counts,
}: ApplicationStatusFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg border border-border bg-muted/40">
      {filterOptions.map((opt) => {
        const isSelected = currentFilter === opt.value
        const count = counts[opt.value] ?? 0

        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onFilterChange(opt.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              isSelected
                ? "bg-background text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }`}
          >
            <span>{opt.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] tabular-nums ${
                isSelected
                  ? "bg-primary/10 text-primary font-bold"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
