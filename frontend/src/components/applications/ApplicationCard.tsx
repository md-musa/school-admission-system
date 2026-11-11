import { useNavigate } from "react-router-dom"
import { Clock, GraduationCap, ChevronRight, CheckCircle2 } from "lucide-react"
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

  const isHeld = application.status === "HELD"

  return (
    <Card className={`flex flex-col justify-between transition-colors ${isHeld ? "border-primary/40 bg-primary/5" : "hover:border-foreground/20"}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2">
            <GraduationCap className="size-5 shrink-0 text-primary mt-0.5" />
            <div>
              <CardTitle className="text-base leading-snug">
                {application.className || "Class Admission"}
              </CardTitle>
              <p className="text-[11px] font-mono text-muted-foreground mt-0.5" title={application.holdId}>
                Hold ID: {shortHoldId}
              </p>
            </div>
          </div>
          <HoldStatusBadge status={application.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-2 pb-4 text-xs text-muted-foreground">
        <div className="flex items-center justify-between border-t border-border/50 pt-2">
          <span className="flex items-center gap-1 font-medium">
            <Clock className="size-3.5" />
            {isHeld ? "Expires At:" : "Expiry window:"}
          </span>
          <span className="font-semibold text-foreground">{formattedExpiry}</span>
        </div>
      </CardContent>

      <CardFooter className="pt-0 flex flex-col gap-2">
        {isHeld ? (
          <div className="w-full flex items-center gap-2">
            <Button
              size="sm"
              className="flex-1 gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold"
              onClick={() => navigate(`/holds/${application.holdId}`)}
            >
              <CheckCircle2 className="size-3.5" />
              <span>Pay Admission Fee</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs text-destructive hover:bg-destructive/10 border-destructive/20"
              onClick={() => navigate(`/holds/${application.holdId}`)}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-between"
            onClick={() => navigate(`/holds/${application.holdId}`)}
          >
            <span>View Details</span>
            <ChevronRight className="size-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
