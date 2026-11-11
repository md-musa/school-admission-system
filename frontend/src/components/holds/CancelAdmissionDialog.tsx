import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Loader2 } from "lucide-react"

interface CancelAdmissionDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isPending: boolean
  classNameTitle?: string
}

export function CancelAdmissionDialog({
  isOpen,
  onClose,
  onConfirm,
  isPending,
  classNameTitle,
}: CancelAdmissionDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive mb-1">
            <AlertTriangle className="size-5" />
            <DialogTitle>Cancel Application</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to cancel your admission reservation for{" "}
            <span className="font-semibold text-foreground">
              {classNameTitle || "this class"}
            </span>?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 text-sm">
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive flex items-start gap-2">
            <AlertTriangle className="size-4 shrink-0 mt-0.5" />
            <span>
              Cancelling releases your temporary seat reservation back to the class pool. A cancelled application cannot be reactivated.
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
            Keep Application
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
            className="gap-2"
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {isPending ? "Cancelling..." : "Cancel Application"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
