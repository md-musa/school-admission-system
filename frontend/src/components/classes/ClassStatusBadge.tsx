import { Badge } from "@/components/ui/badge"

interface ClassStatusBadgeProps {
  availableSeats: number
  totalSeats: number
}

type Status = "available" | "almost-full" | "full"

function getStatus(availableSeats: number, totalSeats: number): Status {
  if (availableSeats <= 0) return "full"
  if (availableSeats / totalSeats < 0.2) return "almost-full"
  return "available"
}

const statusConfig: Record<
  Status,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" | null }
> = {
  available: { label: "Available", variant: "default" },
  "almost-full": { label: "Almost Full", variant: "secondary" },
  full: { label: "Class Full", variant: "destructive" },
}

export function ClassStatusBadge({
  availableSeats,
  totalSeats,
}: ClassStatusBadgeProps) {
  const status = getStatus(availableSeats, totalSeats)
  const { label, variant } = statusConfig[status]

  return <Badge variant={variant ?? "default"}>{label}</Badge>
}
