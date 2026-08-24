import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { IconCopy, IconCheck, IconX, IconPackage } from "@tabler/icons-react"
import { OrderStatus, type Order, OrderType, ORDER_TYPE_LABELS } from "@/api/orders.api"
import { PAYMENT_MODE_ICONS } from "./orderHelpers"
import {
  getTimeAgo,
  formatTime,
  formatCurrency,
  formatShortId,
} from "@/utils/formatters"

interface OrderCardProps {
  order: Order
  getMenuItemName: (itemObj: any) => string
  copyOrderId: (id: any) => void
  timeTrigger: number
  isMutatingId: string | null
  onUpdateStatus: (id: string, status: OrderStatus) => void
  columnType: "pending" | "preparing" | "ready"
}

export function OrderCard({
  order,
  getMenuItemName,
  copyOrderId,
  timeTrigger,
  isMutatingId,
  onUpdateStatus,
  columnType,
}: OrderCardProps) {
  const isMutating = isMutatingId === order._id

  const renderBadge = () => {
    switch (columnType) {
      case "pending":
        return (
          <Badge
            variant="destructive"
            className="px-1.5 py-0 text-[9px] font-bold tracking-wider uppercase"
          >
            NEW
          </Badge>
        )
      case "preparing":
        return (
          <Badge
            variant="default"
            className="px-1.5 py-0 text-[9px] font-bold tracking-wider uppercase"
          >
            COOKING
          </Badge>
        )
      case "ready":
        return (
          <Badge
            variant="secondary"
            className="px-1.5 py-0 text-[9px] font-bold tracking-wider uppercase"
          >
            DISPATCH
          </Badge>
        )
    }
  }

  const renderActions = () => {
    switch (columnType) {
      case "pending":
        return (
          <div className="mt-3.5 grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-[11px]"
              disabled={isMutating}
              onClick={() => onUpdateStatus(order._id, OrderStatus.CANCELLED)}
            >
              {isMutating ? (
                <span className="mr-1 h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
              ) : (
                <IconX className="mr-1 size-3" />
              )}
              Reject
            </Button>
            <Button
              size="sm"
              className="h-8 text-[11px] font-medium shadow-none"
              disabled={isMutating}
              onClick={() => onUpdateStatus(order._id, OrderStatus.PREPARING)}
            >
              {isMutating ? (
                <span className="mr-1 h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
              ) : (
                <IconCheck className="mr-1 size-3" />
              )}
              Accept
            </Button>
          </div>
        )
      case "preparing":
        return (
          <Button
            size="sm"
            className="mt-3.5 h-8 w-full text-[11px] font-medium shadow-none"
            disabled={isMutating}
            onClick={() => onUpdateStatus(order._id, OrderStatus.READY)}
          >
            {isMutating ? (
              <span className="mr-1 h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
            ) : (
              <IconPackage className="mr-1 size-3.5" />
            )}
            Mark as Ready
          </Button>
        )
      case "ready":
        return (
          <Button
            size="sm"
            className="mt-3.5 h-8 w-full text-[11px] font-medium shadow-none"
            disabled={isMutating}
            onClick={() => onUpdateStatus(order._id, OrderStatus.COMPLETED)}
          >
            {isMutating ? (
              <span className="mr-1 h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
            ) : (
              <IconCheck className="mr-1 size-3.5" />
            )}
            Complete Checkout
          </Button>
        )
    }
  }

  return (
    <Card className="w-full flex-shrink-0 shadow-sm transition-all duration-200 hover:border-primary/50">
      <CardContent className="flex flex-col p-3">
        {/* Header: Order ID + Badge */}
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="flex flex-col">
            <span className="flex items-center gap-1 font-mono text-xs font-semibold text-foreground">
              #{formatShortId(order._id, 6)}
              <button
                onClick={() => copyOrderId(order._id)}
                className="cursor-pointer text-muted-foreground hover:text-foreground"
                title="Copy ID"
              >
                <IconCopy className="size-2.5" />
              </button>
            </span>
            <span className="mt-0.5 text-[10px] text-muted-foreground">
              {formatTime(order.createdAt)} •{" "}
              {getTimeAgo(order.createdAt, timeTrigger)} •{" "}
              <span className="font-semibold text-primary">
                {order.orderType ? ORDER_TYPE_LABELS[order.orderType] : "Dine In"}
              </span>
            </span>
          </div>
          {renderBadge()}
        </div>

        <Separator className="my-2 bg-border/30" />

        {/* Items List */}
        <div className="my-2.5 flex flex-col gap-1.5">
          {order.items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between text-xs"
            >
              <span className="text-muted-foreground">
                {getMenuItemName(item.menuItemId)}
              </span>
              <span className="font-bold text-foreground">
                x{item.quantity}
              </span>
            </div>
          ))}
        </div>

        <Separator className="my-2 bg-border/30" />

        {/* Bill Total & Payment Mode */}
        <div className="mt-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            {order.bill.paymentMode &&
              PAYMENT_MODE_ICONS[order.bill.paymentMode]}
            <span className="text-[10px] text-muted-foreground uppercase">
              {order.bill.paymentMode ?? "UNPAID"}
            </span>
          </div>
          <span className="font-bold text-foreground">
            {formatCurrency(order.bill.total)}
          </span>
        </div>

        {/* Action Buttons */}
        {renderActions()}
      </CardContent>
    </Card>
  )
}
