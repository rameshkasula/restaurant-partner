import React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { OrderStatus, type Order } from "@/api/orders.api"
import { OrderCard } from "./OrderCard"

interface OrderColumnProps {
  title: string
  icon: React.ReactNode
  count: number
  orders: Order[]
  isLoading: boolean
  emptyTitle: string
  emptySub: string
  emptyIcon: React.ReactNode
  getMenuItemName: (itemObj: any) => string
  copyOrderId: (id: any) => void
  timeTrigger: number
  isMutatingId: string | null
  onUpdateStatus: (id: string, status: OrderStatus) => void
  columnType: "pending" | "preparing" | "ready"
}

export function OrderColumn({
  title,
  icon,
  count,
  orders,
  isLoading,
  emptyTitle,
  emptySub,
  emptyIcon,
  getMenuItemName,
  copyOrderId,
  timeTrigger,
  isMutatingId,
  onUpdateStatus,
  columnType,
}: OrderColumnProps) {
  const getColumnStyles = () => {
    switch (columnType) {
      case "pending":
        return {
          headerBg: "bg-destructive/10",
          titleClass: "text-destructive",
          badgeVariant: "destructive" as const,
        }
      case "preparing":
        return {
          headerBg: "bg-primary/10",
          titleClass: "text-primary",
          badgeVariant: "default" as const,
        }
      case "ready":
        return {
          headerBg: "bg-secondary/30",
          titleClass: "text-secondary-foreground",
          badgeVariant: "secondary" as const,
        }
    }
  }

  const styles = getColumnStyles()

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Column Header */}
      <div
        className={`flex items-center justify-between border-b border-border/40 ${styles.headerBg} p-3`}
      >
        <div className="flex items-center gap-2">
          {icon}
          <h2
            className={`text-xs font-bold tracking-wider uppercase ${styles.titleClass}`}
          >
            {title}
          </h2>
        </div>
        <Badge
          variant={styles.badgeVariant}
          className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
        >
          {count}
        </Badge>
      </div>

      {/* Column Content */}
      <div className="flex flex-1 min-h-0 scrollbar-thin flex-col gap-3 overflow-y-auto bg-muted/20 p-3">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, idx) => (
            <Card key={idx} className="border-border/30 shadow-none">
              <CardHeader className="p-3 pb-0">
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent className="p-3">
                <Skeleton className="mb-2 h-6 w-full" />
                <Skeleton className="h-8 w-1/3" />
              </CardContent>
            </Card>
          ))
        ) : orders.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-4 text-center">
            {emptyIcon}
            <p className="text-xs font-semibold text-muted-foreground">
              {emptyTitle}
            </p>
            <p className="mt-0.5 text-[10px] text-muted-foreground/70">
              {emptySub}
            </p>
          </div>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              getMenuItemName={getMenuItemName}
              copyOrderId={copyOrderId}
              timeTrigger={timeTrigger}
              isMutatingId={isMutatingId}
              onUpdateStatus={onUpdateStatus}
              columnType={columnType}
            />
          ))
        )}
      </div>
    </div>
  )
}
