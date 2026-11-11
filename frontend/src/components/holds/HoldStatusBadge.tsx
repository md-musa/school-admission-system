import { Badge } from "@/components/ui/badge"
import type { HoldStatus } from "@/api/holdApi"

interface HoldStatusBadgeProps {
  status: HoldStatus
}

const statusConfig: Record<
  HoldStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  HELD: { label: "Awaiting Confirmation", variant: "secondary" },
  CONFIRMED: { label: "Confirmed", variant: "default" },
  EXPIRED: { label: "Expired", variant: "destructive" },
  CANCELLED: { label: "Cancelled", variant: "outline" },
}

export function HoldStatusBadge({ status }: HoldStatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status,
    variant: "outline",
  }

  return <Badge variant={config.variant}>{config.label}</Badge>
}
