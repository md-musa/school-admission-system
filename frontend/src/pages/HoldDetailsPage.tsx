import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import {
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react"
import { useHoldDetails } from "@/hooks/useHoldDetails"
import { useClassDetails } from "@/hooks/useClassDetails"
import { useConfirmHold } from "@/hooks/useConfirmHold"
import { HoldCountdown } from "@/components/holds/HoldCountdown"
import { HoldSummary } from "@/components/holds/HoldSummary"
import { ConfirmAdmissionDialog } from "@/components/holds/ConfirmAdmissionDialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import type { ApiError } from "@/api/axios"

// ── Skeleton Loader ─────────────────────────────────────────────────────────

function HoldDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-36" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-60" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  )
}

// ── Error State ────────────────────────────────────────────────────────────

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
        {isNotFound ? "Application Hold Not Found" : "Failed to Load Hold Details"}
      </h2>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        {isNotFound
          ? "The admission hold you requested does not exist or may have been removed."
          : message}
      </p>
      {!isNotFound && (
        <Button variant="outline" onClick={onRetry} className="gap-2">
          <RefreshCw size={15} />
          Retry
        </Button>
      )}
      <div className="mt-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={14} />
          Back to Classes
        </Link>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function HoldDetailsPage() {
  const { holdId } = useParams<{ holdId: string }>()
  const {
    data: hold,
    isLoading: isHoldLoading,
    isError: isHoldError,
    error: holdError,
    refetch: refetchHold,
  } = useHoldDetails(holdId)

  const { data: cls } = useClassDetails(hold?.classId)
  const { mutate: confirmAdmission, isPending: isConfirming } = useConfirmHold()

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)

  const apiError = holdError as unknown as ApiError | null

  const handleConfirmSubmit = () => {
    if (!hold) return
    confirmAdmission(
      {
        holdId: hold.holdId,
        classId: hold.classId,
        studentId: hold.studentId,
      },
      {
        onSuccess: () => {
          setIsConfirmDialogOpen(false)
        },
      }
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        {/* Back Link */}
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={15} />
          Back to Classes
        </Link>

        {isHoldLoading && <HoldDetailsSkeleton />}

        {isHoldError && (
          <ErrorState
            status={apiError?.status ?? null}
            message={apiError?.message ?? "An unexpected error occurred."}
            onRetry={() => void refetchHold()}
          />
        )}

        {!isHoldLoading && !isHoldError && hold && (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Admission Application</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Track your admission hold status and next steps.
              </p>
            </div>

            {/* Countdown / Visual Timer (only active when HELD) */}
            <HoldCountdown
              expiresAt={hold.expiresAt}
              status={hold.status}
              onExpire={() => void refetchHold()}
            />

            {/* Status-specific Guidance Card */}
            {hold.status === "HELD" && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="size-5 text-primary" />
                    <CardTitle className="text-base">Seat Temporarily Reserved</CardTitle>
                  </div>
                  <CardDescription>
                    Your seat is held. Please confirm your admission before the timer expires to secure your enrollment.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2 space-y-4">
                  <Button
                    onClick={() => setIsConfirmDialogOpen(true)}
                    className="w-full sm:w-auto gap-2"
                  >
                    <CheckCircle2 className="size-4" />
                    Confirm Admission
                  </Button>
                </CardContent>
              </Card>
            )}

            {hold.status === "CONFIRMED" && (
              <Card className="border-green-500/30 bg-green-500/5">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-5 text-green-600" />
                    <CardTitle className="text-base text-green-700 dark:text-green-400">
                      Admission Confirmed
                    </CardTitle>
                  </div>
                  <CardDescription>
                    Congratulations! Your admission seat has been officially confirmed.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Your seat is permanently reserved in {cls?.name || "the selected class"}.
                  </p>
                </CardContent>
              </Card>
            )}

            {hold.status === "EXPIRED" && (
              <Card className="border-destructive/30 bg-destructive/5">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="size-5 text-destructive" />
                    <CardTitle className="text-base text-destructive">
                      Application Expired
                    </CardTitle>
                  </div>
                  <CardDescription>
                    The temporary reservation window has closed. The seat has been released back to the class pool.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link
                    to="/"
                    className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted hover:text-foreground transition-colors"
                  >
                    Browse Available Classes
                  </Link>
                </CardContent>
              </Card>
            )}

            {hold.status === "CANCELLED" && (
              <Card className="border-muted bg-muted/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <XCircle className="size-5 text-muted-foreground" />
                    <CardTitle className="text-base text-foreground">
                      Application Cancelled
                    </CardTitle>
                  </div>
                  <CardDescription>
                    This admission application was cancelled and the seat hold is no longer active.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link
                    to="/"
                    className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted hover:text-foreground transition-colors"
                  >
                    Browse Available Classes
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Hold Summary Card */}
            <HoldSummary hold={hold} classNameTitle={cls?.name} />

            {/* Confirmation Dialog */}
            <ConfirmAdmissionDialog
              isOpen={isConfirmDialogOpen}
              onClose={() => setIsConfirmDialogOpen(false)}
              onConfirm={handleConfirmSubmit}
              isPending={isConfirming}
              classNameTitle={cls?.name}
            />
          </div>
        )}
      </div>
    </div>
  )
}
