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
import { AlertCircle, Clock, Loader2, GraduationCap } from "lucide-react"

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
            <GraduationCap className="size-5" />
            <DialogTitle>Apply for Admission</DialogTitle>
          </div>
          <DialogDescription>
            Apply for <span className="font-semibold text-foreground">{classNameTitle}</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground flex items-start gap-2 border border-border">
            <Clock className="size-4 shrink-0 mt-0.5 text-primary" />
            <span>
              A 10-minute hold will reserve your seat while you complete your admission fee.
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="formStudentId" className="text-xs font-semibold">
                Student ID (17 digits)
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
                Enter your 17-digit birth registration number.
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
