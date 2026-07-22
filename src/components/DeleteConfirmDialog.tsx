import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { IconTrash, IconLoader2 } from "@tabler/icons-react"

interface DeleteConfirmDialogProps {
  title?: string
  description?: string
  itemName?: string
  onConfirm: () => Promise<void> | void
  trigger?: React.ReactElement
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function DeleteConfirmDialog({
  title = "Confirm Deletion",
  description,
  itemName,
  onConfirm,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: DeleteConfirmDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen
  const setOpen = isControlled ? controlledOnOpenChange : setUncontrolledOpen

  const handleConfirm = async () => {
    try {
      setIsDeleting(true)
      await onConfirm()
      setOpen?.(false)
    } catch (error) {
      console.error("Deletion failed:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const defaultDescription = itemName
    ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
    : "Are you sure you want to delete this record? This action cannot be undone."

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <IconTrash className="size-5" />
            {title}
          </DialogTitle>
          <DialogDescription className="pt-2">
            {description || defaultDescription}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 gap-3">
          <DialogClose
            render={
              <Button variant="outline" type="button" disabled={isDeleting}>
                Cancel
              </Button>
            }
          />
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex items-center gap-1.5"
          >
            {isDeleting ? (
              <>
                <IconLoader2 className="size-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
