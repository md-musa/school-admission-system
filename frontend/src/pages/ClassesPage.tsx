import { RefreshCw, AlertCircle, BookOpen, FileText } from "lucide-react"
import { Link } from "react-router-dom"
import { useClasses } from "@/hooks/useClasses"
import { ClassCard, type ClassData } from "@/components/classes/ClassCard"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { ApiError } from "@/api/axios"

// ── Skeleton grid shown while loading ──────────────────────────────────────

function ClassesSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border p-5 space-y-4">
          <div className="flex items-start justify-between">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-1.5 w-full rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
      ))}
    </div>
  )
}

// ── Empty state ────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <BookOpen className="mb-4 text-muted-foreground" size={40} />
      <h2 className="mb-1 text-lg font-semibold">No classes available</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        There are currently no classes listed for admission. Please check back
        later.
      </p>
    </div>
  )
}

// ── Error state ────────────────────────────────────────────────────────────

interface ErrorStateProps {
  message: string
  onRetry: () => void
}

function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <AlertCircle className="mb-4 text-destructive" size={40} />
      <h2 className="mb-1 text-lg font-semibold">Failed to load classes</h2>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">{message}</p>
      <Button variant="outline" onClick={onRetry} className="gap-2">
        <RefreshCw size={15} />
        Retry
      </Button>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function ClassesPage() {
  const { data: classes, isLoading, isError, error, refetch } = useClasses()

  const errorMessage = isError
    ? ((error as unknown as ApiError)?.message ?? "An unexpected error occurred.")
    : ""

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Available Classes
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse open classes and check seat availability before applying.
            </p>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <RefreshCw size={11} className="shrink-0" />
              Seat availability refreshes automatically every 5 seconds.
            </p>
          </div>

          <div>
            <Link
              to="/my-applications"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted hover:text-foreground transition-colors shadow-xs"
            >
              <FileText className="size-4 text-primary" />
              <span>My Applications</span>
            </Link>
          </div>
        </div>

        {/* ── States ── */}
        {isLoading && <ClassesSkeletonGrid />}

        {isError && (
          <ErrorState message={errorMessage} onRetry={() => void refetch()} />
        )}

        {!isLoading && !isError && classes?.length === 0 && <EmptyState />}

        {!isLoading && !isError && classes && classes.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(classes as ClassData[]).map((cls) => (
              <ClassCard key={cls.id} cls={cls} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
