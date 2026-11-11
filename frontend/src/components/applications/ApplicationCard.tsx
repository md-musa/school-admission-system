import { useNavigate } from "react-router-dom"
import { Clock, GraduationCap, ChevronRight } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HoldStatusBadge } from "@/components/holds/HoldStatusBadge"
import type { StudentApplicationItem } from "@/api/holdApi"

interface ApplicationCardProps {
  application: StudentApplicationItem
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const navigate = useNavigate()

  const formattedExpiry = new Date(application.expiresAt).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  })

  // Shorten holdId for cleaner display
  const shortHoldId = application.holdId.length > 12
    ? `${application.holdId.slice(0, 8)}...`
    : application.holdId

  return (
    <Card className="flex flex-col justify-between hover:border-foreground/20 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2">
            <GraduationCap className="size-5 shrink-0 text-muted-foreground mt-0.5" />
            <div>
              <CardTitle className="text-base leading-snug">
                {application.className || "Class Admission"}
              </CardTitle>
              <p className="text-xs font-mono text-muted-foreground mt-0.5" title={application.holdId}>
                Hold ID: {shortHoldId}
              </p>
            </div>
          </div>
          <HoldStatusBadge status={application.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-2 pb-4 text-xs text-muted-foreground">
        <div className="flex items-center justify-between border-t border-border/50 pt-2">
          <span className="flex items-center gap-1">
            <Clock className="size-3.5" />
            {application.status === "HELD" ? "Expires:" : "Expiry window:"}
          </span>
          <span className="font-medium text-foreground">{formattedExpiry}</span>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-between"
          onClick={() => navigate(`/holds/${application.holdId}`)}
        >
          <span>View Details</span>
          <ChevronRight className="size-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
