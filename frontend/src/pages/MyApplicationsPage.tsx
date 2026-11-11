import { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import {
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  FileQuestion,
  UserX,
  CreditCard,
} from "lucide-react"
import { useMyHolds } from "@/hooks/useMyHolds"
import { getStudentId } from "@/lib/studentId"
import { ApplicationCard } from "@/components/applications/ApplicationCard"
import {
  ApplicationStatusFilter,
  type FilterStatus,
} from "@/components/applications/ApplicationStatusFilter"
import { ApplicationsSummary } from "@/components/applications/ApplicationsSummary"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { ApiError } from "@/api/axios"

// ── Skeletons ──────────────────────────────────────────────────────────────

function MyApplicationsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border p-4 space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-7 w-12" />
          </div>
        ))}
      </div>
      <Skeleton className="h-10 w-full max-w-md rounded-lg" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border p-5 space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-full rounded-md mt-4" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Error State ────────────────────────────────────────────────────────────

interface ErrorStateProps {
  message: string
  onRetry: () => void
}

function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <AlertCircle className="mb-4 text-destructive size-10" />
      <h2 className="mb-1 text-lg font-semibold">Failed to Load Applications</h2>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">{message}</p>
      <Button variant="outline" onClick={onRetry} className="gap-2">
        <RefreshCw size={15} />
        Retry
      </Button>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function MyApplicationsPage() {
  const studentId = getStudentId()
  const {
    data: applications,
    isLoading,
    isError,
    error,
    refetch,
  } = useMyHolds()

  const [statusFilter, setStatusFilter] = useState<FilterStatus>("ALL")

  const maskedStudentId = useMemo(() => {
    if (!studentId || studentId.length < 8) return studentId || ""
    return `${studentId.slice(0, 4)}•••••••••${studentId.slice(-4)}`
  }, [studentId])

  // Filter calculations & counts
  const counts = useMemo<Record<FilterStatus, number>>(() => {
    const defaultCounts: Record<FilterStatus, number> = {
      ALL: applications?.length ?? 0,
      HELD: 0,
      CONFIRMED: 0,
      EXPIRED: 0,
      CANCELLED: 0,
    }

    if (!applications) return defaultCounts

    applications.forEach((app) => {
      if (defaultCounts[app.status] !== undefined) {
        defaultCounts[app.status] += 1
      }
    })

    return defaultCounts
  }, [applications])

  // Summary counts
  const summaryStats = useMemo(() => {
    const total = applications?.length ?? 0
    const held = counts.HELD
    const confirmed = counts.CONFIRMED
    const active = held + confirmed
    const inactive = counts.EXPIRED + counts.CANCELLED

    return { total, active, confirmed, inactive }
  }, [applications, counts])

  // Filtered applications list
  const filteredApplications = useMemo(() => {
    if (!applications) return []
    if (statusFilter === "ALL") return applications
    return applications.filter((app) => app.status === statusFilter)
  }, [applications, statusFilter])

  const apiError = error as unknown as ApiError | null
  const errorMessage = apiError?.message ?? "An unexpected error occurred."

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Navigation back */}
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={15} />
          Back to Classes
        </Link>

        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              My Applications
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Review and track all your school admission applications.
            </p>
          </div>

          {studentId && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card text-xs">
              <CreditCard className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">Student ID:</span>
              <span className="font-mono font-semibold text-foreground">
                {maskedStudentId}
              </span>
            </div>
          )}
        </div>

        {/* Missing Student ID State */}
        {!studentId && (
          <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl border-dashed p-8">
            <UserX className="mb-4 text-muted-foreground size-12" />
            <h2 className="mb-1 text-lg font-semibold">No Student ID Found</h2>
            <p className="mb-6 max-w-sm text-sm text-muted-foreground">
              You haven't submitted an admission application on this browser yet. Browse classes and apply using your 17-digit student identifier.
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Browse Available Classes
            </Link>
          </div>
        )}

        {/* Loading */}
        {studentId && isLoading && <MyApplicationsSkeleton />}

        {/* Error */}
        {studentId && isError && (
          <ErrorState message={errorMessage} onRetry={() => void refetch()} />
        )}

        {/* Empty State (when student has no applications at all) */}
        {studentId && !isLoading && !isError && applications?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl border-dashed p-8">
            <FileQuestion className="mb-4 text-muted-foreground size-12" />
            <h2 className="mb-1 text-lg font-semibold">No Applications Yet</h2>
            <p className="mb-6 max-w-sm text-sm text-muted-foreground">
              You have not submitted any admission holds. Explore available classes and start your application.
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Browse Available Classes
            </Link>
          </div>
        )}

        {/* Data List */}
        {studentId && !isLoading && !isError && applications && applications.length > 0 && (
          <div className="space-y-6">
            {/* Summary Statistics */}
            <ApplicationsSummary {...summaryStats} />

            {/* Filter */}
            <div className="flex items-center justify-between">
              <ApplicationStatusFilter
                currentFilter={statusFilter}
                onFilterChange={setStatusFilter}
                counts={counts}
              />
            </div>

            {/* Application Cards Grid */}
            {filteredApplications.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredApplications.map((app) => (
                  <ApplicationCard key={app.holdId} application={app} />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No applications match the "{statusFilter}" status filter.
              </div>
            )}
          </div>
        )}
    </div>
  )
}
