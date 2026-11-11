import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import {
  ArrowLeft,
  GraduationCap,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import { useClassDetails } from "@/hooks/useClassDetails"
import { ClassAvailabilityBadge } from "@/components/classes/ClassAvailabilityBadge"
import { AdmissionApplicationForm } from "@/components/admission/AdmissionApplicationForm"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { ApiError } from "@/api/axios"

// ── Types ──────────────────────────────────────────────────────────────────

interface ClassDetails {
  id: string
  name: string
  totalSeats: number
  heldSeats: number
  confirmedSeats: number
  availableSeats: number
}

// ── Skeleton ───────────────────────────────────────────────────────────────

function ClassDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
      {/* seat stats grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border p-4 space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-7 w-12" />
          </div>
        ))}
      </div>
      {/* progress bar */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-full rounded-full" />
        <Skeleton className="h-4 w-40" />
      </div>
      {/* admission card */}
      <div className="rounded-xl border border-border p-6 space-y-3">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-9 w-40 rounded-md" />
      </div>
    </div>
  )
}

// ── Error state ────────────────────────────────────────────────────────────

interface ErrorStateProps {
  status: number | null
  message: string
  onRetry: () => void
}

function ErrorState({ status, message, onRetry }: ErrorStateProps) {
  const isNotFound = status === 404

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <AlertCircle
        className={`mb-4 ${isNotFound ? "text-muted-foreground" : "text-destructive"}`}
        size={40}
      />
      <h2 className="mb-1 text-lg font-semibold">
        {isNotFound ? "Class Not Found" : "Failed to Load Class"}
      </h2>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        {isNotFound
          ? "The class you're looking for doesn't exist or may have been removed."
          : message}
      </p>
      {!isNotFound && (
        <Button variant="outline" onClick={onRetry} className="gap-2">
          <RefreshCw size={15} />
          Retry
        </Button>
      )}
      <Link
        to="/"
        className="mt-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} />
        Back to Classes
      </Link>
    </div>
  )
}

// ── Stat card ──────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: number
  icon: React.ReactNode
  highlight?: boolean
}

function StatCard({ label, value, icon, highlight = false }: StatCardProps) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          {icon}
          <span className="text-xs font-medium uppercase tracking-wide">
            {label}
          </span>
        </div>
        <p
          className={`text-2xl font-semibold tabular-nums ${
            highlight ? "text-primary" : "text-foreground"
          }`}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  )
}

// ── Availability progress bar ──────────────────────────────────────────────

interface AvailabilityBarProps {
  totalSeats: number
  confirmedSeats: number
  heldSeats: number
  availableSeats: number
}

function AvailabilityBar({
  totalSeats,
  confirmedSeats,
  heldSeats,
  availableSeats,
}: AvailabilityBarProps) {
  const confirmedPct = Math.min(100, (confirmedSeats / totalSeats) * 100)
  const heldPct = Math.min(100 - confirmedPct, (heldSeats / totalSeats) * 100)
  const availPct = Math.max(0, (availableSeats / totalSeats) * 100)

  return (
    <div className="space-y-2">
      {/* Segmented bar */}
      <div
        className="flex h-3 w-full overflow-hidden rounded-full bg-muted"
        role="img"
        aria-label={`${availableSeats} of ${totalSeats} seats available`}
      >
        <div
          className="h-full bg-primary/80 transition-all"
          style={{ width: `${confirmedPct}%` }}
          title={`Confirmed: ${confirmedSeats}`}
        />
        <div
          className="h-full bg-secondary transition-all"
          style={{ width: `${heldPct}%` }}
          title={`On hold: ${heldSeats}`}
        />
        <div
          className="h-full bg-primary/20 transition-all"
          style={{ width: `${availPct}%` }}
          title={`Available: ${availableSeats}`}
        />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-primary/80" />
          Confirmed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-secondary" />
          On Hold
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-primary/20 border border-border" />
          Available
        </span>
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function ClassDetailPage() {
  const { classId } = useParams<{ classId: string }>()
  const { data: cls, isLoading, isError, error, refetch } = useClassDetails(classId)
  const [isApplicationOpen, setIsApplicationOpen] = useState(false)

  const apiError = error as unknown as ApiError | null
  const isFull = cls ? cls.availableSeats <= 0 : false

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* ── Back link ── */}
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={15} />
          Back to Classes
        </Link>

        {/* ── States ── */}
        {isLoading && <ClassDetailSkeleton />}

        {isError && (
          <ErrorState
            status={apiError?.status ?? null}
            message={apiError?.message ?? "An unexpected error occurred."}
            onRetry={() => void refetch()}
          />
        )}

        {!isLoading && !isError && cls && (
          <div className="space-y-8">

            {/* ── Header ── */}
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <GraduationCap
                  className="mt-1 shrink-0 text-muted-foreground"
                  size={22}
                />
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">
                    {(cls as ClassDetails).name}
                  </h1>
                  <div className="mt-2">
                    <ClassAvailabilityBadge
                      availableSeats={(cls as ClassDetails).availableSeats}
                      totalSeats={(cls as ClassDetails).totalSeats}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Seat stats grid ── */}
            <div>
              <h2 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Seat Information
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard
                  label="Total"
                  value={(cls as ClassDetails).totalSeats}
                  icon={<Users size={13} />}
                />
                <StatCard
                  label="Available"
                  value={(cls as ClassDetails).availableSeats}
                  icon={<CheckCircle size={13} />}
                  highlight
                />
                <StatCard
                  label="On Hold"
                  value={(cls as ClassDetails).heldSeats}
                  icon={<Clock size={13} />}
                />
                <StatCard
                  label="Confirmed"
                  value={(cls as ClassDetails).confirmedSeats}
                  icon={<CheckCircle size={13} />}
                />
              </div>
            </div>

            {/* ── Availability visualization ── */}
            <div>
              <h2 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Seat Availability
              </h2>
              <AvailabilityBar
                totalSeats={(cls as ClassDetails).totalSeats}
                confirmedSeats={(cls as ClassDetails).confirmedSeats}
                heldSeats={(cls as ClassDetails).heldSeats}
                availableSeats={(cls as ClassDetails).availableSeats}
              />
            </div>

            {/* ── Admission section ── */}
            <Card>
              <CardHeader>
                <CardTitle>Apply for Admission</CardTitle>
                <CardDescription>
                  {isFull
                    ? "This class has no available seats at the moment."
                    : `There ${(cls as ClassDetails).availableSeats === 1 ? "is" : "are"} ${(cls as ClassDetails).availableSeats} seat${(cls as ClassDetails).availableSeats === 1 ? "" : "s"} available. Submit your application to reserve a spot.`}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-6">
                <Button
                  onClick={() => setIsApplicationOpen(true)}
                  disabled={isFull}
                  className="gap-2"
                  aria-label={
                    isFull
                      ? "No seats available for this class"
                      : "Apply for admission to this class"
                  }
                >
                  {isFull ? "No Seats Available" : "Apply for Admission"}
                </Button>
              </CardContent>
            </Card>

            {/* ── Application Modal ── */}
            <AdmissionApplicationForm
              isOpen={isApplicationOpen}
              onClose={() => setIsApplicationOpen(false)}
              classId={(cls as ClassDetails).id}
              classNameTitle={(cls as ClassDetails).name}
            />
          </div>
        )}
    </div>
  )
}
