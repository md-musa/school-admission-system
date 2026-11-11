import { useParams, Link } from "react-router-dom"
import { ArrowLeft, Clock } from "lucide-react"

export default function HoldDetailPage() {
  const { holdId } = useParams<{ holdId: string }>()

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={15} />
          Back to Classes
        </Link>

        <div className="rounded-xl border border-border p-6 mt-4 space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Clock className="size-6" />
            <h1 className="text-xl font-semibold tracking-tight">Seat Reserved</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Hold ID: <span className="font-mono text-foreground font-semibold">{holdId}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Your admission hold has been successfully created. The Hold Details &amp; confirmation feature will be completed in the next phase.
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted hover:text-foreground transition-colors"
            >
              Browse Other Classes
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
