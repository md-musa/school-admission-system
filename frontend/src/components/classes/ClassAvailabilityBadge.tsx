import { Badge } from "@/components/ui/badge"

interface ClassAvailabilityBadgeProps {
  availableSeats: number
  totalSeats: number
}

type AvailabilityStatus = "available" | "limited" | "full"

function getAvailabilityStatus(
  availableSeats: number,
  totalSeats: number
): AvailabilityStatus {
  if (!totalSeats || availableSeats <= 0) return "full"
  if (availableSeats / totalSeats <= 0.1) return "limited"
  return "available"
}

const statusConfig: Record<
  AvailabilityStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  available: { label: "Available", variant: "default" },
  limited: { label: "Limited Seats", variant: "secondary" },
  full: { label: "Full", variant: "destructive" },
}

export function ClassAvailabilityBadge({
  availableSeats,
  totalSeats,
}: ClassAvailabilityBadgeProps) {
  const status = getAvailabilityStatus(availableSeats, totalSeats)
  const { label, variant } = statusConfig[status]

  return <Badge variant={variant}>{label}</Badge>
}
