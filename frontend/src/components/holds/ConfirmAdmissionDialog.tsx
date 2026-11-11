import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"

interface ConfirmAdmissionDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isPending: boolean
  classNameTitle?: string
}

export function ConfirmAdmissionDialog({
  isOpen,
  onClose,
  onConfirm,
  isPending,
  classNameTitle,
}: ConfirmAdmissionDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary mb-1">
            <CheckCircle2 className="size-5" />
            <DialogTitle>Confirm Admission</DialogTitle>
          </div>
          <DialogDescription>
            You are about to confirm your admission for{" "}
            <span className="font-semibold text-foreground">
              {classNameTitle || "this class"}
            </span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 text-sm">
          <div className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground flex items-start gap-2">
            <AlertCircle className="size-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <span>
              Once confirmed, your seat reservation will be permanently locked. Please make sure you have reviewed the class details.
            </span>
          </div>
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
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="gap-2"
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {isPending ? "Confirming..." : "Confirm Admission"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
