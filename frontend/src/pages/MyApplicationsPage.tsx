import { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import {
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  FileQuestion,
  CreditCard,
  IdCard,
} from "lucide-react"
import { useMyHolds } from "@/hooks/useMyHolds"
import { useStudent } from "@/context/StudentContext"
import { ApplicationCard } from "@/components/applications/ApplicationCard"
import {
  ApplicationStatusFilter,
  type FilterStatus,
} from "@/components/applications/ApplicationStatusFilter"
import { ApplicationsSummary } from "@/components/applications/ApplicationsSummary"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import type { ApiError } from "@/api/axios"

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

export default function MyApplicationsPage() {
  const { studentId, setStudentId, isValid } = useStudent()
  const [localInput, setLocalInput] = useState("")

  const {
    data: applications,
    isLoading,
    isError,
    error,
    refetch,
  } = useMyHolds(isValid ? studentId : undefined)

  const [statusFilter, setStatusFilter] = useState<FilterStatus>("ALL")

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

  const summaryStats = useMemo(() => {
    const total = applications?.length ?? 0
    const held = counts.HELD
    const confirmed = counts.CONFIRMED
    const active = held + confirmed
    const inactive = counts.EXPIRED + counts.CANCELLED

    return { total, active, confirmed, inactive }
  }, [applications, counts])

  const filteredApplications = useMemo(() => {
    if (!applications) return []
    if (statusFilter === "ALL") return applications
    return applications.filter((app) => app.status === statusFilter)
  }, [applications, statusFilter])

  const apiError = error as unknown as ApiError | null
  const errorMessage = apiError?.message ?? "An unexpected error occurred."

  const handleSetLocalId = (e: React.FormEvent) => {
    e.preventDefault()
    if (localInput.trim()) {
      setStudentId(localInput.trim())
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={15} />
        Back to Classes
      </Link>

      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            My Applications
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View all admission applications and track their status.
          </p>
        </div>

        {isValid && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card text-xs">
            <CreditCard className="size-4 text-primary" />
            <span className="text-muted-foreground">Registration No:</span>
            <span className="font-mono font-semibold text-foreground">
              {studentId}
            </span>
          </div>
        )}
      </div>

      {!isValid && (
        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-xl border-dashed p-8 bg-muted/10 max-w-xl mx-auto">
          <IdCard className="mb-4 text-primary size-12" />
          <h2 className="mb-1 text-lg font-semibold">Enter Your Student ID</h2>
          <p className="mb-6 max-w-md text-sm text-muted-foreground">
            Enter your 17-digit birth registration number to view your applications.
          </p>

          <form onSubmit={handleSetLocalId} className="w-full flex flex-col sm:flex-row gap-2 max-w-sm mb-4">
            <Input
              type="text"
              inputMode="numeric"
              maxLength={17}
              placeholder="17-Digit Student ID"
              value={localInput}
              onChange={(e) => setLocalInput(e.target.value.replace(/\D/g, "").slice(0, 17))}
              className="font-mono text-center sm:text-left text-sm"
              autoFocus
            />
            <Button type="submit" disabled={localInput.length !== 17}>
              View Applications
            </Button>
          </form>

          <p className="text-xs text-muted-foreground">
            You can also enter or update this number at any time in the top header.
          </p>
        </div>
      )}

      {isValid && isLoading && <MyApplicationsSkeleton />}

      {isValid && isError && (
        <ErrorState message={errorMessage} onRetry={() => void refetch()} />
      )}

      {isValid && !isLoading && !isError && applications?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl border-dashed p-8">
          <FileQuestion className="mb-4 text-muted-foreground size-12" />
          <h2 className="mb-1 text-lg font-semibold">No Applications Found</h2>
          <p className="mb-6 max-w-sm text-sm text-muted-foreground">
            No applications found for registration number {studentId}. Explore open classes and apply today.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Browse Available Classes
          </Link>
        </div>
      )}

      {isValid && !isLoading && !isError && applications && applications.length > 0 && (
        <div className="space-y-6">
          <ApplicationsSummary {...summaryStats} />

          <div className="flex items-center justify-between">
            <ApplicationStatusFilter
              currentFilter={statusFilter}
              onFilterChange={setStatusFilter}
              counts={counts}
            />
          </div>

          {filteredApplications.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredApplications.map((app) => (
                <ApplicationCard key={app.holdId} application={app} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No applications match the &quot;{statusFilter}&quot; status filter.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
