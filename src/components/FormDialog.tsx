import React from "react"
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
import { IconLoader2 } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

interface FormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  trigger?: React.ReactElement
  onSubmit: (e: React.FormEvent) => void | Promise<void>
  isPending?: boolean
  submitLabel?: string
  cancelLabel?: string
  children: React.ReactNode
  className?: string
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  trigger,
  onSubmit,
  isPending = false,
  submitLabel = "Save Changes",
  cancelLabel = "Cancel",
  children,
  className,
}: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent className={cn("sm:max-w-[500px]", className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-4 py-2">
          {children}

          <DialogFooter className="mt-4 gap-2">
            <DialogClose
              render={
                <Button variant="outline" type="button" disabled={isPending}>
                  {cancelLabel}
                </Button>
              }
            />
            <Button type="submit" disabled={isPending} className="flex items-center gap-1.5">
              {isPending && <IconLoader2 className="size-4 animate-spin" />}
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
