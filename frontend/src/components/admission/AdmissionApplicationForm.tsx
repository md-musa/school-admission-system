import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { validateStudentId } from "@/lib/studentId"
import { useStudent } from "@/context/StudentContext"
import { useCreateHold } from "@/hooks/useCreateHold"
import { AlertCircle, Clock, Loader2, Sparkles } from "lucide-react"

interface AdmissionApplicationFormProps {
  isOpen: boolean
  onClose: () => void
  classId: string
  classNameTitle: string
}

export function AdmissionApplicationForm({
  isOpen,
  onClose,
  classId,
  classNameTitle,
}: AdmissionApplicationFormProps) {
  const { studentId: contextStudentId, setStudentId: setContextStudentId } = useStudent()
  const [studentId, setStudentId] = useState("")
  const [validationError, setValidationError] = useState<string | null>(null)
  const { mutate: applyHold, isPending } = useCreateHold()

  // Load existing student ID from context / localStorage when dialog opens
  useEffect(() => {
    if (isOpen) {
      setStudentId(contextStudentId || "")
      setValidationError(null)
    }
  }, [isOpen, contextStudentId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 17)
    setStudentId(value)
    if (validationError) {
      setValidationError(validateStudentId(value))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const error = validateStudentId(studentId)
    if (error) {
      setValidationError(error)
      return
    }

    setValidationError(null)
    // Synchronize to global context
    setContextStudentId(studentId)

    applyHold(
      { classId, studentId },
      {
        onSuccess: () => {
          onClose()
        },
      }
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary mb-1">
            <Sparkles className="size-5" />
            <DialogTitle>Apply for Admission</DialogTitle>
          </div>
          <DialogDescription>
            Reserving a temporary seat hold for{" "}
            <span className="font-semibold text-foreground">{classNameTitle}</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="rounded-lg bg-muted/70 p-3 text-xs text-muted-foreground flex items-start gap-2 border border-border/50">
            <Clock className="size-4 shrink-0 mt-0.5 text-primary" />
            <span>
              Once submitted, a temporary seat hold will be placed. You will need to click <strong>&quot;Pay Admission Fee&quot;</strong> before the timer expires to confirm your seat.
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="formStudentId" className="text-xs font-semibold">
                Student Registration Number (17 Digits)
              </Label>
              <span className="text-[11px] text-muted-foreground font-mono">
                {studentId.length}/17
              </span>
            </div>
            <Input
              id="formStudentId"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Enter 17-digit registration number"
              value={studentId}
              onChange={handleInputChange}
              disabled={isPending}
              maxLength={17}
              className={`font-mono text-sm ${validationError ? "border-destructive focus-visible:ring-destructive" : ""}`}
              autoFocus={!studentId}
            />
            {validationError ? (
              <p className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="size-3.5 shrink-0" />
                {validationError}
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                No login required. This 17-digit registration number serves as your identity.
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {isPending ? "Reserving..." : "Submit Application"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
