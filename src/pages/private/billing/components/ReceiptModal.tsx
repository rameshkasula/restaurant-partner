import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { IconPrinter } from "@tabler/icons-react"
import { type Order } from "@/api/orders.api"

interface ReceiptModalProps {
  order: Order | null
  open: boolean
  onClose: () => void
  outletName: string
}

export function ReceiptModal({
  order,
  open,
  onClose,
  outletName,
}: ReceiptModalProps) {
  if (!order) return null

  const handlePrint = () => {
    window.print()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm print:max-w-full print:border-none print:shadow-none">
        <DialogHeader className="print:hidden">
          <DialogTitle>Order Receipt</DialogTitle>
          <DialogDescription>
            Print or view the generated customer invoice.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 rounded-lg border bg-card p-5 font-mono text-xs text-foreground shadow-sm">
          {/* Outlet details */}
          <div className="space-y-1 text-center">
            <h3 className="text-sm font-bold tracking-wider uppercase">
              {outletName}
            </h3>
            <p className="text-[10px] text-muted-foreground">
              GSTIN: STANDALONE
            </p>
            <p className="text-[10px] text-muted-foreground">
              Order ID: {order._id.slice(-6).toUpperCase()}
            </p>
          </div>

          <div className="my-1 border-t border-dashed" />

          {/* Date & Status */}
          <div className="flex justify-between text-[11px]">
            <span>
              Date: {new Date(order.createdAt).toLocaleString("en-IN")}
            </span>
            <span className="font-bold uppercase">{order.status}</span>
          </div>

          <div className="my-1 border-t border-dashed" />

          {/* Items */}
          <div className="space-y-2">
            <div className="grid grid-cols-12 text-[10px] font-bold text-muted-foreground uppercase">
              <span className="col-span-6">Item</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-4 text-right">Price</span>
            </div>
            {order.items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 text-[11px]">
                <span className="col-span-6 truncate font-medium">
                  {item.menuItemId.slice(-4).toUpperCase()} (Item)
                </span>
                <span className="col-span-2 text-center">{item.quantity}</span>
                <span className="col-span-4 text-right">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="my-1 border-t border-dashed" />

          {/* Calculations */}
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{order.bill.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (5%):</span>
              <span>₹{order.bill.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-1 text-sm font-bold">
              <span>TOTAL:</span>
              <span>₹{order.bill.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="my-1 border-t border-dashed" />

          {/* Payment info */}
          <div className="flex justify-between text-[11px]">
            <span>Payment Mode:</span>
            <span className="font-bold">
              {order.bill.paymentMode ?? "UNPAID"}
            </span>
          </div>

          <div className="mt-3 text-center text-[10px] text-muted-foreground italic">
            Thank you for dining with us!
          </div>
        </div>

        <DialogFooter className="print:hidden">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handlePrint} className="gap-1.5">
            <IconPrinter className="size-4" />
            Print Bill
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
