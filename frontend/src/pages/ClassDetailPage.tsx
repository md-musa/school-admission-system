import { Link, useParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

/**
 * Placeholder page for /classes/:classId.
 * Class Details feature will be implemented in a future phase.
 */
export default function ClassDetailPage() {
  const { classId } = useParams<{ classId: string }>()

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={15} />
          Back to Classes
        </Link>

        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          Class Details
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Class ID:{" "}
          <span className="font-mono text-foreground">{classId}</span>
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          This page will show full class details and the admission application
          form in a future phase.
        </p>
      </div>
    </div>
  )
}
