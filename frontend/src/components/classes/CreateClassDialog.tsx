import React, { useState } from "react"
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
import { useCreateClass } from "@/hooks/useCreateClass"
import { PlusCircle, Loader2, AlertCircle } from "lucide-react"

interface CreateClassDialogProps {
  isOpen: boolean
  onClose: () => void
}

const PRESET_SHIFTS = [
  "Class 6 – Morning Shift",
  "Class 6 – Day Shift",
  "Class 7 – Morning Shift",
  "Class 7 – Day Shift",
  "Class 8 – Morning Shift",
  "Class 8 – Day Shift",
  "Class 9 – Morning Shift",
  "Class 9 – Day Shift",
]

export function CreateClassDialog({ isOpen, onClose }: CreateClassDialogProps) {
  const [name, setName] = useState("")
  const [totalSeats, setTotalSeats] = useState("")
  const [error, setError] = useState<string | null>(null)

  const { mutate: addClass, isPending } = useCreateClass()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedName = name.trim()
    if (!trimmedName) {
      setError("Class name is required.")
      return
    }

    const seatsNum = Number.parseInt(totalSeats, 10)
    if (Number.isNaN(seatsNum) || seatsNum <= 0) {
      setError("Total seat capacity must be a positive number greater than 0.")
      return
    }

    setError(null)
    addClass(
      { name: trimmedName, totalSeats: seatsNum },
      {
        onSuccess: () => {
          setName("")
          setTotalSeats("")
          onClose()
        },
      }
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <PlusCircle className="size-5" />
            <DialogTitle className="text-lg">Create Class</DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Add a new class or shift with its seat capacity.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Quick Preset Buttons */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Suggestions:</Label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_SHIFTS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setName(preset)
                    setError(null)
                  }}
                  className="rounded-md border border-border bg-muted/60 px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Class Name */}
          <div className="space-y-1.5">
            <Label htmlFor="className">
              Class &amp; Shift Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="className"
              placeholder='e.g. "Class 6 – Morning Shift"'
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (error) setError(null)
              }}
              disabled={isPending}
              maxLength={150}
              required
            />
          </div>

          {/* Total Seats */}
          <div className="space-y-1.5">
            <Label htmlFor="totalSeats">
              Total Seat Capacity <span className="text-destructive">*</span>
            </Label>
            <Input
              id="totalSeats"
              type="number"
              min={1}
              step={1}
              placeholder="e.g. 100"
              value={totalSeats}
              onChange={(e) => {
                setTotalSeats(e.target.value)
                if (error) setError(null)
              }}
              disabled={isPending}
              required
            />
          </div>

          {error && (
            <p className="flex items-center gap-1.5 text-xs text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </p>
          )}

          <DialogFooter className="gap-2 sm:gap-0 pt-3">
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
              {isPending ? "Creating..." : "Create Class"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
