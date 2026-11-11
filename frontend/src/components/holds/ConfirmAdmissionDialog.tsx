import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CreditCard, CheckCircle2, Loader2, Sparkles } from "lucide-react"

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
            <CreditCard className="size-5" />
            <DialogTitle className="text-lg">Pay Admission Fee</DialogTitle>
          </div>
          <DialogDescription>
            Confirm your admission seat reservation for{" "}
            <span className="font-semibold text-foreground">
              {classNameTitle || "this class"}
            </span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 text-sm">
          <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3.5 text-xs text-foreground flex items-start gap-2.5">
            <Sparkles className="size-4 shrink-0 mt-0.5 text-green-600 dark:text-green-400" />
            <div className="space-y-1">
              <p className="font-semibold text-green-700 dark:text-green-400">
                Simulated Payment:
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Clicking &quot;Pay Admission Fee&quot; assumes that the payment is successful. No real payment gateway integration is required. Your admission seat will be permanently confirmed.
              </p>
            </div>
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
            className="gap-2 bg-green-600 hover:bg-green-700 text-white font-medium"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Confirming...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="size-4" />
                <span>Pay Admission Fee</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
