import { useRef } from "react"
import { useReactToPrint } from "react-to-print"
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
import { type Order, ORDER_TYPE_LABELS } from "@/api/orders.api"
import { type Outlet } from "@/api/outlets.api"

interface ReceiptModalProps {
  order: Order | null
  open: boolean
  onClose: () => void
  outletName: string
  outlet: Outlet | null
  menuMap?: Record<string, any>
}

export function ReceiptModal({
  order,
  open,
  onClose,
  outletName,
  outlet,
  menuMap = {},
}: ReceiptModalProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: order ? `Invoice-${order._id.slice(-6).toUpperCase()}` : "Invoice",
  })

  if (!order) return null

  // Lookups
  const finalOutletName = outlet?.name || outletName
  const finalAddress = outlet?.address || ""
  const finalGST = outlet?.gstin || ""
  const finalPAN = outlet?.pan || ""

  const taxPercentage = outlet
    ? outlet.isTaxRequired !== false
      ? (outlet.taxPercentage ?? 5)
      : 0
    : order.bill.subtotal > 0
    ? Math.round((order.bill.tax / order.bill.subtotal) * 100)
    : 5

  const getMenuItemName = (menuItemId: string) => {
    return menuMap[menuItemId]?.name || menuItemId.slice(-4).toUpperCase()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      {/* CSS Injection for react-to-print Page and Layout styling */}
      <style>{`
        /* Hide print area on screen */
        @media screen {
          .print-only-wrapper {
            display: none !important;
          }
        }
        
        /* Print-only CSS layout settings */
        @media print {
          .print-only-wrapper {
            display: block !important;
          }
          .thermal-print-container {
            width: 80mm !important;
            max-width: 80mm !important;
            margin: 0 !important;
            padding: 4mm !important;
            background: #fff !important;
            color: #000 !important;
            font-family: 'Courier New', Courier, monospace !important;
            font-size: 12px !important;
            line-height: 1.4 !important;
            box-sizing: border-box !important;
          }
          @page {
            margin: 0 !important;
            size: 80mm auto !important;
          }
        }
      `}</style>

      {/* Screen receipt dialog content */}
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Order Receipt</DialogTitle>
          <DialogDescription>
            Print or view the generated customer invoice.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Modal Content (Preview) */}
        <div className="flex flex-col gap-4 rounded-lg border bg-card p-5 font-mono text-xs text-foreground shadow-sm max-h-[60vh] overflow-y-auto">
          {/* Header Details */}
          <div className="space-y-1 text-center">
            <h3 className="text-sm font-bold tracking-wider uppercase">
              {finalOutletName}
            </h3>
            {finalAddress && (
              <p className="text-[10px] text-muted-foreground whitespace-pre-line">
                {finalAddress}
              </p>
            )}
            {finalGST && (
              <p className="text-[10px] text-muted-foreground font-semibold">
                GSTIN: {finalGST}
              </p>
            )}
            {finalPAN && (
              <p className="text-[10px] text-muted-foreground font-semibold">
                PAN: {finalPAN}
              </p>
            )}
            <p className="text-[10px] text-muted-foreground pt-1">
              Order ID: #{order._id.slice(-6).toUpperCase()}
            </p>
          </div>

          <div className="my-1 border-t border-dashed" />

          {/* Date & Time */}
          <div className="flex justify-between text-[11px]">
            <span>
              Date: {new Date(order.createdAt).toLocaleString("en-IN")}
            </span>
            <span className="font-bold uppercase text-primary">
              {order.orderType ? ORDER_TYPE_LABELS[order.orderType] || order.orderType : "Dine In"}
            </span>
          </div>

          <div className="my-1 border-t border-dashed" />

          {/* Items Table */}
          <div className="space-y-2">
            <div className="grid grid-cols-12 text-[10px] font-bold text-muted-foreground uppercase">
              <span className="col-span-6">Item</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-4 text-right">Price</span>
            </div>
            {order.items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 text-[11px]">
                <span className="col-span-6 truncate font-medium">
                  {getMenuItemName(item.menuItemId)}
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
              <span>Tax ({taxPercentage}%):</span>
              <span>₹{order.bill.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-1.5 text-xs font-bold">
              <span>TOTAL AMOUNT:</span>
              <span>₹{order.bill.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="my-1 border-t border-dashed" />

          {/* Payment Mode */}
          <div className="flex justify-between text-[11px]">
            <span>Payment Mode:</span>
            <span className="font-bold uppercase">
              {order.bill.paymentMode ?? "UNPAID"}
            </span>
          </div>

          {(order.tableNo !== undefined || order.note) && (
            <>
              <div className="my-1 border-t border-dashed" />
              <div className="space-y-1 text-[11px] text-muted-foreground">
                {order.tableNo !== undefined && (
                  <div className="flex justify-between">
                    <span>Table No:</span>
                    <span className="font-bold text-foreground">{order.tableNo}</span>
                  </div>
                )}
                {order.note && (
                  <div className="flex flex-col gap-0.5">
                    <span>Notes:</span>
                    <span className="text-[10px] break-words text-foreground whitespace-pre-wrap">{order.note}</span>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="my-1 border-t border-dashed" />

          {/* Footers */}
          <div className="space-y-1 text-center">
            <p className="text-[10px] font-medium text-foreground italic">
              Thank you Visit again
            </p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-widest pt-1">
              billing by thsmartbills
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => handlePrint()} className="gap-1.5">
            <IconPrinter className="size-4" />
            Print Bill
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* ── PRINT ONLY CONTAINER FOR REACT-TO-PRINT ── */}
      <div className="print-only-wrapper">
        <div ref={contentRef} className="thermal-print-container" style={{ width: "80mm", padding: "4mm", fontFamily: "monospace" }}>
          <div style={{ textAlign: "center", marginBottom: "8px" }}>
            <h3 style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: "bold", textTransform: "uppercase" }}>
              {finalOutletName}
            </h3>
            {finalAddress && (
              <p style={{ margin: "0 0 4px 0", fontSize: "10px", whiteSpace: "pre-line" }}>
                {finalAddress}
              </p>
            )}
            {finalGST && (
              <p style={{ margin: "0 0 2px 0", fontSize: "10px", fontWeight: "bold" }}>
                GSTIN: {finalGST}
              </p>
            )}
            {finalPAN && (
              <p style={{ margin: "0 0 4px 0", fontSize: "10px", fontWeight: "bold" }}>
                PAN: {finalPAN}
              </p>
            )}
            <p style={{ margin: "6px 0 0 0", fontSize: "10px" }}>
              Order ID: #{order._id.slice(-6).toUpperCase()}
            </p>
          </div>

          <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
            <span>Date: {new Date(order.createdAt).toLocaleString("en-IN")}</span>
            <span style={{ fontWeight: "bold", textTransform: "uppercase" }}>
              {order.orderType ? ORDER_TYPE_LABELS[order.orderType] || order.orderType : "Dine In"}
            </span>
          </div>

          <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />

          {/* Items list */}
          <table style={{ width: "100%", fontSize: "11px", borderCollapse: "collapse", margin: "6px 0" }}>
            <thead>
              <tr style={{ borderBottom: "1px dashed #000", fontSize: "10px" }}>
                <th style={{ textAlign: "left", paddingBottom: "4px" }}>ITEM</th>
                <th style={{ textAlign: "center", paddingBottom: "4px", width: "40px" }}>QTY</th>
                <th style={{ textAlign: "right", paddingBottom: "4px", width: "70px" }}>PRICE</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ paddingTop: "4px", paddingBottom: "4px", verticalAlign: "top" }}>
                    {getMenuItemName(item.menuItemId)}
                  </td>
                  <td style={{ paddingTop: "4px", paddingBottom: "4px", textAlign: "center", verticalAlign: "top" }}>
                    {item.quantity}
                  </td>
                  <td style={{ paddingTop: "4px", paddingBottom: "4px", textAlign: "right", verticalAlign: "top" }}>
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />

          {/* Calculations */}
          <div style={{ fontSize: "11px", lineHeight: "1.5" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Subtotal:</span>
              <span>₹{order.bill.subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Tax ({taxPercentage}%):</span>
              <span>₹{order.bill.tax.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #000", marginTop: "4px", paddingTop: "4px", fontSize: "12px", fontWeight: "bold" }}>
              <span>TOTAL AMOUNT:</span>
              <span>₹{order.bill.total.toFixed(2)}</span>
            </div>
          </div>

          <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
            <span>Payment Mode:</span>
            <span style={{ fontWeight: "bold", textTransform: "uppercase" }}>
              {order.bill.paymentMode ?? "UNPAID"}
            </span>
          </div>

          {(order.tableNo !== undefined || order.note) && (
            <>
              <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />
              <div style={{ fontSize: "11px", color: "#666" }}>
                {order.tableNo !== undefined && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Table No:</span>
                    <span style={{ fontWeight: "bold", color: "#000" }}>{order.tableNo}</span>
                  </div>
                )}
                {order.note && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "4px" }}>
                    <span>Notes:</span>
                    <span style={{ fontSize: "10px", color: "#000", whiteSpace: "pre-wrap" }}>{order.note}</span>
                  </div>
                )}
              </div>
            </>
          )}

          <div style={{ borderTop: "1px dashed #000", margin: "8px 0 6px 0" }} />

          <div style={{ textAlign: "center", fontSize: "10px", marginTop: "8px" }}>
            <p style={{ margin: "0 0 2px 0", fontWeight: "bold", fontStyle: "italic" }}>
              Thank you Visit again
            </p>
            <p style={{ margin: "4px 0 0 0", fontSize: "9px", letterSpacing: "1px", textTransform: "uppercase" }}>
              billing by thsmartbills
            </p>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
