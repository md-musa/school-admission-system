import { Card, CardContent } from "@/components/ui/card"
import { Layers, Clock, CheckCircle2, AlertOctagon } from "lucide-react"

interface ApplicationsSummaryProps {
  total: number
  active: number // HELD + CONFIRMED
  confirmed: number
  inactive: number // EXPIRED + CANCELLED
}

export function ApplicationsSummary({
  total,
  active,
  confirmed,
  inactive,
}: ApplicationsSummaryProps) {
  const stats = [
    {
      label: "Total Applications",
      value: total,
      icon: <Layers className="size-4 text-muted-foreground" />,
    },
    {
      label: "Active Holds",
      value: active - confirmed, // HELD count
      icon: <Clock className="size-4 text-amber-500" />,
    },
    {
      label: "Confirmed",
      value: confirmed,
      icon: <CheckCircle2 className="size-4 text-green-600" />,
    },
    {
      label: "Expired / Cancelled",
      value: inactive,
      icon: <AlertOctagon className="size-4 text-muted-foreground" />,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat, i) => (
        <Card key={i}>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              {stat.icon}
              <span className="text-xs font-medium uppercase tracking-wide">
                {stat.label}
              </span>
            </div>
            <p className="text-2xl font-bold tabular-nums text-foreground">
              {stat.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
