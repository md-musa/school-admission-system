interface SeatRowProps {
  label: string
  value: number
  highlight?: boolean
}

function SeatRow({ label, value, highlight = false }: SeatRowProps) {
  return (
    <div className="flex items-center justify-between py-1 text-xs">
      <span className={highlight ? "font-semibold text-foreground" : "text-muted-foreground"}>
        {label}
      </span>
      <span
        className={`font-semibold tabular-nums ${
          highlight ? "text-primary text-sm font-bold" : "text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  )
}

interface SeatAvailabilityProps {
  totalSeats: number
  heldSeats: number
  confirmedSeats: number
  availableSeats: number
}

export function SeatAvailability({
  totalSeats,
  heldSeats,
  confirmedSeats,
  availableSeats,
}: SeatAvailabilityProps) {
  const fillPercent = Math.min(
    100,
    Math.round(((totalSeats - availableSeats) / totalSeats) * 100)
  )

  return (
    <div className="space-y-1.5">
      {/* Progress bar */}
      <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${fillPercent}%` }}
          aria-label={`${fillPercent}% seats taken`}
        />
      </div>

      <div className="divide-y divide-border/40">
        <SeatRow label="Total seats" value={totalSeats} />
        <SeatRow label="Held seats" value={heldSeats} />
        <SeatRow label="Confirmed seats" value={confirmedSeats} />
        <div className="mt-1 pt-1 bg-primary/5 rounded px-2">
          <SeatRow label="Available seats" value={availableSeats} highlight />
        </div>
      </div>
    </div>
  )
}
