import { useState } from "react"
import { Eye, EyeOff, Copy, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { HoldResponse } from "@/api/holdApi"
import { HoldStatusBadge } from "./HoldStatusBadge"

interface HoldSummaryProps {
  hold: HoldResponse
  classNameTitle?: string
}

export function HoldSummary({ hold, classNameTitle }: HoldSummaryProps) {
  const [showFullStudentId, setShowFullStudentId] = useState(false)
  const [copied, setCopied] = useState(false)

  const maskStudentId = (id: string) => {
    if (!id || id.length < 8) return id
    return `${id.slice(0, 4)}•••••••••${id.slice(-4)}`
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formattedExpiry = new Date(hold.expiresAt).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "medium",
  })

  return (
    <Card>
      <CardHeader className="pb-3 border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Hold Details</CardTitle>
          <HoldStatusBadge status={hold.status} />
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-3.5 text-sm">
        {classNameTitle && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-border/50">
            <span className="text-muted-foreground text-xs uppercase tracking-wider">Class</span>
            <span className="font-semibold text-foreground">{classNameTitle}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <span className="text-muted-foreground text-xs uppercase tracking-wider">Hold ID</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-foreground bg-muted px-2 py-0.5 rounded">
              {hold.holdId}
            </span>
            <button
              onClick={() => handleCopy(hold.holdId)}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
              title="Copy Hold ID"
              type="button"
            >
              {copied ? <Check className="size-3.5 text-green-600" /> : <Copy className="size-3.5" />}
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <span className="text-muted-foreground text-xs uppercase tracking-wider">Registration Number</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-foreground bg-muted px-2 py-0.5 rounded">
              {showFullStudentId ? hold.studentId : maskStudentId(hold.studentId)}
            </span>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setShowFullStudentId(!showFullStudentId)}
              title={showFullStudentId ? "Hide Registration Number" : "Show Registration Number"}
              type="button"
              className="text-muted-foreground hover:text-foreground"
            >
              {showFullStudentId ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <span className="text-muted-foreground text-xs uppercase tracking-wider">Class ID</span>
          <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
            {hold.classId}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-2 border-t border-border/50">
          <span className="text-muted-foreground text-xs uppercase tracking-wider">Expires At</span>
          <span className="text-xs font-medium text-foreground">{formattedExpiry}</span>
        </div>
      </CardContent>
    </Card>
  )
}
