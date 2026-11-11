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
import { getStudentId, validateStudentId } from "@/lib/studentId"
import { useCreateHold } from "@/hooks/useCreateHold"
import { AlertCircle, Clock, Loader2 } from "lucide-react"

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
  const [studentId, setStudentId] = useState("")
  const [validationError, setValidationError] = useState<string | null>(null)
  const { mutate: applyHold, isPending } = useCreateHold()

  // Load existing student ID from localStorage when dialog opens
  useEffect(() => {
    if (isOpen) {
      const savedId = getStudentId()
      if (savedId) {
        setStudentId(savedId)
      }
      setValidationError(null)
    }
  }, [isOpen])

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
          <DialogTitle>Apply for Admission</DialogTitle>
          <DialogDescription>
            Applying will reserve a temporary seat in{" "}
            <span className="font-semibold text-foreground">{classNameTitle}</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground flex items-start gap-2">
            <Clock className="size-4 shrink-0 mt-0.5 text-primary" />
            <span>
              Once submitted, a temporary hold will be placed on your seat. You will need to confirm your application before it expires.
            </span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="studentId">Student ID (17 Digits)</Label>
            <Input
              id="studentId"
              type="text"
              inputMode="numeric"
              placeholder="e.g. 12345678901234567"
              value={studentId}
              onChange={handleInputChange}
              disabled={isPending}
              maxLength={17}
              className={validationError ? "border-destructive focus-visible:ring-destructive" : ""}
              autoFocus
            />
            {validationError ? (
              <p className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="size-3.5" />
                {validationError}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Enter your unique 17-digit numeric student identifier.
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
