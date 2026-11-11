interface SeatRowProps {
  label: string
  value: number
  highlight?: boolean
}

function SeatRow({ label, value, highlight = false }: SeatRowProps) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={`text-sm font-semibold tabular-nums ${
          highlight ? "text-primary" : "text-foreground"
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
    <div className="space-y-1">
      {/* Progress bar */}
      <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${fillPercent}%` }}
          aria-label={`${fillPercent}% seats taken`}
        />
      </div>

      <SeatRow label="Total seats" value={totalSeats} />
      <SeatRow label="Confirmed" value={confirmedSeats} />
      <SeatRow label="On hold" value={heldSeats} />
      <div className="mt-1 border-t border-border pt-1">
        <SeatRow label="Available" value={availableSeats} highlight />
      </div>
    </div>
  )
}
