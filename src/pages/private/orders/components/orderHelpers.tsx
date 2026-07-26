import React from "react"
import { IconCoins, IconCreditCard, IconDeviceMobile } from "@tabler/icons-react"
import { OrderStatus, PaymentMode } from "@/api/orders.api"

export const PAYMENT_MODE_ICONS: Record<PaymentMode, React.ReactNode> = {
  [PaymentMode.CASH]: <IconCoins className="size-3 text-amber-600" />,
  [PaymentMode.CARD]: <IconCreditCard className="size-3 text-blue-600" />,
  [PaymentMode.UPI]: <IconDeviceMobile className="size-3 text-purple-600" />,
}

export const STATUS_BADGE_CLASSES: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]:
    "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20",
  [OrderStatus.PREPARING]:
    "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
  [OrderStatus.READY]:
    "bg-secondary text-secondary-foreground border-secondary/50 hover:bg-secondary/80",
  [OrderStatus.COMPLETED]:
    "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20 dark:text-emerald-400",
  [OrderStatus.CANCELLED]:
    "bg-muted text-muted-foreground border-border hover:bg-muted/80",
}
