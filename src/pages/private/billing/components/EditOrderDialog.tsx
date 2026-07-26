import { useEffect } from "react"
import { useForm } from "react-hook-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { IconLoader2 } from "@tabler/icons-react"
import { type Order, OrderStatus, PaymentMode } from "@/api/orders.api"

interface EditOrderDialogProps {
  open: boolean
  onOpenChange: (o: boolean) => void
  order: Order | null
  onSubmit: (data: {
    status: OrderStatus
    paymentMode: PaymentMode | null
  }) => void
  isPending: boolean
}

export function EditOrderDialog({
  open,
  onOpenChange,
  order,
  onSubmit,
  isPending,
}: EditOrderDialogProps) {
  const { register, handleSubmit, reset } = useForm<{
    status: OrderStatus
    paymentMode: PaymentMode | ""
  }>()

  useEffect(() => {
    if (open && order) {
      reset({
        status: order.status,
        paymentMode: order.bill.paymentMode ?? "",
      })
    }
  }, [open, order, reset])

  const onFormSubmit = (data: {
    status: OrderStatus
    paymentMode: PaymentMode | ""
  }) => {
    onSubmit({
      status: data.status,
      paymentMode: data.paymentMode === "" ? null : data.paymentMode,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
          <DialogDescription>
            Update the payment or preparation status of this order.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className="flex flex-col gap-4 py-1"
        >
          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-status">Preparation Status</Label>
            <NativeSelect id="edit-status" {...register("status")}>
              {Object.values(OrderStatus).map((stat) => (
                <NativeSelectOption key={stat} value={stat}>
                  {stat}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>

          {/* Payment Mode */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-payment">Payment Mode</Label>
            <NativeSelect id="edit-payment" {...register("paymentMode")}>
              <NativeSelectOption value="">— Unpaid —</NativeSelectOption>
              {Object.values(PaymentMode).map((pm) => (
                <NativeSelectOption key={pm} value={pm}>
                  {pm}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>

          <DialogFooter className="mt-2">
            <DialogClose
              render={
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              }
            />
            <Button type="submit" disabled={isPending} className="gap-1.5">
              {isPending && <IconLoader2 className="size-3.5 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
