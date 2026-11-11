import { useState } from "react"
import { RefreshCw, AlertCircle, BookOpen, PlusCircle } from "lucide-react"
import { useClasses } from "@/hooks/useClasses"
import { ClassCard, type ClassData } from "@/components/classes/ClassCard"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CreateClassDialog } from "@/components/classes/CreateClassDialog"
import type { ApiError } from "@/api/axios"

function ClassesSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-4 rounded-xl border border-border p-5">
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

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-8 py-16 text-center">
      <BookOpen className="mb-4 size-12 text-muted-foreground" />
      <h2 className="mb-1 text-lg font-semibold">No Classes Available</h2>
      <p className="mb-4 max-w-md text-sm text-muted-foreground">
        No admission classes have been created yet. Click below to add one.
      </p>
      <Button onClick={onCreateClick} className="gap-2">
        <PlusCircle className="size-4" />
        Create Class (Admin)
      </Button>
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
      <AlertCircle className="mb-4 size-10 text-destructive" />
      <h2 className="mb-1 text-lg font-semibold">Failed to Load Classes</h2>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">{message}</p>
      <Button variant="outline" onClick={onRetry} className="gap-2">
        <RefreshCw size={15} />
        Retry
      </Button>
    </div>
  )
}

export default function ClassesPage() {
  const { data: classes, isLoading, isError, error, refetch } = useClasses()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const errorMessage = isError
    ? ((error as unknown as ApiError)?.message ??
      "An unexpected error occurred.")
    : ""

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Available Classes
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Select a class to check seat availability and apply.
          </p>
        </div>

        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="shrink-0 gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="size-4" />
          <span>Create Class</span>
        </Button>
      </div>

      {/* ── States ── */}
      {isLoading && <ClassesSkeletonGrid />}

      {isError && (
        <ErrorState message={errorMessage} onRetry={() => void refetch()} />
      )}

      {!isLoading && !isError && classes?.length === 0 && (
        <EmptyState onCreateClick={() => setCreateDialogOpen(true)} />
      )}

      {!isLoading && !isError && classes && classes.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(classes as ClassData[]).map((cls) => (
            <ClassCard key={cls.id} cls={cls} />
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <CreateClassDialog
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />
    </div>
  )
}
