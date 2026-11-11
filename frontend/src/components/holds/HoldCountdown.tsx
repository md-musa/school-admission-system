import { Clock, AlertTriangle } from "lucide-react"
import { useHoldCountdown } from "@/hooks/useHoldCountdown"
import type { HoldStatus } from "@/api/holdApi"

interface HoldCountdownProps {
  expiresAt: string
  status: HoldStatus
  onExpire?: () => void
}

export function HoldCountdown({ expiresAt, status, onExpire }: HoldCountdownProps) {
  const { formatted, isWarning, isExpired } = useHoldCountdown(expiresAt, onExpire)

  // Hide countdown for terminal states
  if (status === "CONFIRMED" || status === "CANCELLED") {
    return null
  }

  if (status === "EXPIRED") {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-center">
        <p className="text-sm font-semibold text-destructive">
          This reservation has expired.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          The temporary seat hold is no longer valid. The seat has been released back to the class pool.
        </p>
      </div>
    )
  }

  return (
    <div
      className={`rounded-xl border p-5 text-center transition-colors ${
        isWarning
          ? "border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/20"
          : "border-border bg-card"
      }`}
    >
      <div className="flex items-center justify-center gap-2 mb-2 text-muted-foreground">
        {isWarning ? (
          <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 animate-pulse" />
        ) : (
          <Clock className="size-4" />
        )}
        <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
          {isExpired ? "Status Check" : "Time Remaining to Confirm"}
        </span>
      </div>

      <div
        className={`font-mono text-3xl sm:text-4xl font-bold tracking-tight ${
          isWarning
            ? "text-amber-600 dark:text-amber-400"
            : isExpired
              ? "text-sm text-muted-foreground font-normal"
              : "text-foreground"
        }`}
      >
        {formatted}
      </div>

      {isWarning && (
        <p className="mt-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
          ⚠️ Hurry! Less than a minute remaining. Click &quot;Pay Admission Fee&quot; to secure your seat.
        </p>
      )}
    </div>
  )
}
