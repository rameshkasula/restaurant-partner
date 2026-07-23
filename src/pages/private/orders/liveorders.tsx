import React, { useState, useEffect, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  IconBuildingStore,
  IconClock,
  IconToolsKitchen2,
  IconPackage,
  IconCheck,
  IconX,
  IconCopy,
  IconCoins,
  IconCreditCard,
  IconDeviceMobile,
  IconAlertCircle,
  IconRefresh,
  IconReceipt,
} from "@tabler/icons-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { getAccessToken } from "@/utils/tokens"
import { useUsers } from "@/hooks/useUsers"
import { useOutlets } from "@/hooks/useOutlets"
import { useOrders, useUpdateOrder } from "@/hooks/useOrders"
import { useMenuItems } from "@/hooks/useMenuItems"
import { OrderStatus, type Order, PaymentMode } from "@/api/orders.api"
import { useOutletStore } from "@/store/outletStore"
import { DataTable } from "@/components/DataTable/DataTable"
import type { ColumnDef } from "@/components/DataTable/DataTable"

// ── Profile Hook ─────────────────────────────────────────────────────────────

interface CurrentUserProfile {
  email: string
  role: string
  organizationId: string | null
  outletId: string | null
}

function useCurrentUserProfile() {
  const { data: users = [] } = useUsers()

  return useMemo<CurrentUserProfile | null>(() => {
    try {
      const stored = localStorage.getItem("user_info")
      if (stored) return JSON.parse(stored) as CurrentUserProfile
    } catch {
      // Fail silently
    }

    const token = getAccessToken()
    if (!token) return null
    try {
      const decoded = atob(token)
      const parts = decoded.split(":")
      if (parts.length >= 2) {
        const email = parts[0]
        const role = parts[1]
        const match = Array.isArray(users)
          ? users.find((u) => u.email.toLowerCase() === email.toLowerCase())
          : null
        return {
          email,
          role,
          organizationId: match?.organizationId ?? null,
          outletId: match?.outletId ?? null,
        }
      }
    } catch {
      // Fail silently
    }
    return null
  }, [users])
}

// ── Helper functions ──────────────────────────────────────────────────────────

function getTimeAgo(createdAt: string, timeTrigger: number) {
  // Use timeTrigger to force recalculation every minute
  if (timeTrigger < 0) return ""
  const diff = Date.now() - new Date(createdAt).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return new Date(createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount)
}

const PAYMENT_MODE_ICONS = {
  [PaymentMode.CASH]: <IconCoins className="size-3 text-amber-600" />,
  [PaymentMode.CARD]: <IconCreditCard className="size-3 text-blue-600" />,
  [PaymentMode.UPI]: <IconDeviceMobile className="size-3 text-purple-600" />,
}

const STATUS_BADGE_CLASSES: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]:
    "bg-amber-50 text-amber-700 border border-amber-200/50 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-900/30",
  [OrderStatus.PREPARING]:
    "bg-blue-50 text-blue-700 border border-blue-200/50 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-900/30",
  [OrderStatus.READY]:
    "bg-purple-50 text-purple-700 border border-purple-200/50 dark:bg-purple-950/20 dark:text-purple-300 dark:border-purple-900/30",
  [OrderStatus.COMPLETED]:
    "bg-emerald-50 text-emerald-700 border border-emerald-200/50 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900/30",
  [OrderStatus.CANCELLED]:
    "bg-rose-50 text-rose-700 border border-rose-200/50 dark:bg-rose-950/20 dark:text-rose-300 dark:border-rose-900/30",
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function LiveOrders() {
  const profile = useCurrentUserProfile()
  const lockedOutletId = profile?.outletId ?? null

  const { data: outlets = [] } = useOutlets()
  const { selectedOutlet, setSelectedOutlet } = useOutletStore()

  // For time ago trigger updates
  const [timeTrigger, setTimeTrigger] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeTrigger((prev) => prev + 1)
    }, 30000) // Update every 30 seconds
    return () => clearInterval(timer)
  }, [])

  // Automatically lock/update selection if lockedOutletId exists
  useEffect(() => {
    if (lockedOutletId) {
      if (selectedOutlet !== lockedOutletId) {
        setSelectedOutlet(lockedOutletId)
      }
    }
  }, [lockedOutletId, selectedOutlet, setSelectedOutlet])

  const activeOutletId = useMemo(() => {
    if (lockedOutletId) return lockedOutletId
    return selectedOutlet === "ALL" ? undefined : selectedOutlet
  }, [lockedOutletId, selectedOutlet])

  // Queries
  const {
    data: ordersData,
    isLoading: ordersLoading,
    refetch,
    isRefetching,
  } = useOrders(activeOutletId, false)

  const { data: menuItems = [] } = useMenuItems(activeOutletId)

  // Polling setup for live orders
  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, 6000) // Poll every 6 seconds
    return () => clearInterval(interval)
  }, [refetch])

  // Mutation
  const updateOrderMutation = useUpdateOrder()

  const handleUpdateStatus = (id: string, status: OrderStatus) => {
    updateOrderMutation.mutate(
      { id, data: { status } },
      {
        onSuccess: () => {
          toast.success(`Order status updated to ${status.toLowerCase()}`)
        },
        onError: (err) => {
          toast.error(
            `Failed to update order: ${err instanceof Error ? err.message : "Unknown error"}`
          )
        },
      }
    )
  }

  // Dicts
  const menuItemsMap = useMemo(() => {
    const map: Record<string, string> = {}
    if (Array.isArray(menuItems)) {
      menuItems.forEach((item) => {
        if (item._id) map[item._id] = item.name
      })
    }
    return map
  }, [menuItems])

  const getMenuItemName = useCallback(
    (id: string) => {
      return menuItemsMap[id] ?? `Item (${id.substring(id.length - 4)})`
    },
    [menuItemsMap]
  )

  const outletsMap = useMemo(() => {
    const map: Record<string, string> = {}
    if (Array.isArray(outlets)) {
      outlets.forEach((o) => {
        if (o._id) map[o._id] = o.name
      })
    }
    return map
  }, [outlets])

  // Safe cast / parsing orders
  const orders: Order[] = useMemo(() => {
    if (!ordersData) return []
    if (Array.isArray(ordersData)) return ordersData
    if (ordersData && typeof ordersData === "object" && "data" in ordersData) {
      return (ordersData as { data: Order[] }).data
    }
    return []
  }, [ordersData])

  // Split into columns for active board
  const pendingOrders = useMemo(() => {
    return orders.filter(
      (o) => o.status === OrderStatus.PENDING && !o.isDeleted
    )
  }, [orders])

  const preparingOrders = useMemo(() => {
    return orders.filter(
      (o) => o.status === OrderStatus.PREPARING && !o.isDeleted
    )
  }, [orders])

  const readyOrders = useMemo(() => {
    return orders.filter((o) => o.status === OrderStatus.READY && !o.isDeleted)
  }, [orders])

  const copyOrderId = (id: string) => {
    navigator.clipboard.writeText(id)
    toast.success("Order ID copied to clipboard")
  }

  // DataTable column definitions
  const columns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        header: "Order ID",
        accessorKey: "_id",
        sortable: true,
        className: "font-mono font-medium max-w-28 truncate",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <span className="truncate">{row._id}</span>
            <button
              onClick={() => copyOrderId(row._id)}
              className="cursor-pointer text-muted-foreground/60 hover:text-foreground"
              title="Copy ID"
            >
              <IconCopy className="size-3" />
            </button>
          </div>
        ),
      },
      {
        header: "Time Created",
        accessorKey: "createdAt",
        sortable: true,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span>
              {new Date(row.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
              })}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {formatTime(row.createdAt)}
            </span>
          </div>
        ),
      },
      {
        header: "Outlet",
        accessorKey: "outletId",
        sortable: true,
        cell: ({ row }) => (
          <span>{outletsMap[row.outletId] ?? "Unknown Outlet"}</span>
        ),
      },
      {
        header: "Ordered Items",
        cell: ({ row }) => (
          <div className="flex max-w-xs flex-col gap-0.5">
            {row.items.map((item, idx) => (
              <span key={idx} className="truncate text-xs">
                {getMenuItemName(item.menuItemId)}{" "}
                <span className="font-semibold text-muted-foreground">
                  x{item.quantity}
                </span>
              </span>
            ))}
          </div>
        ),
      },
      {
        header: "Bill Total",
        accessorKey: "bill.total",
        sortable: true,
        className: "text-right font-medium",
        cell: ({ row }) => (
          <div className="flex flex-col items-end">
            <span>{formatCurrency(row.bill.total)}</span>
            {row.bill.paymentMode && (
              <div className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                {PAYMENT_MODE_ICONS[row.bill.paymentMode]}
                <span className="text-[9px] font-semibold uppercase">
                  {row.bill.paymentMode}
                </span>
              </div>
            )}
          </div>
        ),
      },
      {
        header: "Status",
        accessorKey: "status",
        sortable: true,
        cell: ({ row }) => (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
              STATUS_BADGE_CLASSES[row.status] ??
                "bg-muted text-muted-foreground"
            )}
          >
            {row.status}
          </span>
        ),
      },
    ],
    [getMenuItemName, outletsMap]
  )

  const isMutatingId = updateOrderMutation.isPending
    ? updateOrderMutation.variables?.id
    : null

  return (
    <div className="flex min-h-screen flex-col gap-6 bg-background p-6 text-foreground">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 border-b border-border/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Live Orders Dashboard
            </h1>
            <span
              className={cn(
                "size-2 rounded-full",
                isRefetching ? "animate-ping bg-amber-500" : "bg-emerald-500"
              )}
              title={
                isRefetching ? "Polling data..." : "Live Connection Active"
              }
            />
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Real-time tracking of restaurant prep pipelines and ready
            completions.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Refresh Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            className="size-8 rounded-none border-border/40 bg-muted/20"
            disabled={ordersLoading}
          >
            <IconRefresh
              className={cn("size-4", ordersLoading && "animate-spin")}
            />
          </Button>

          {/* Outlet Selector */}
          {!lockedOutletId && outlets.length > 0 && (
            <div className="flex h-8 items-center gap-1.5 border border-border/40 bg-muted/10 px-2">
              <IconBuildingStore className="size-3.5 text-muted-foreground" />
              <Select value={selectedOutlet} onValueChange={setSelectedOutlet}>
                <SelectTrigger className="h-6 w-48 border-none bg-transparent shadow-none focus-visible:ring-0">
                  <SelectValue placeholder="Select Outlet" />
                </SelectTrigger>
                <SelectContent align="end" className="rounded-none">
                  <SelectItem value="ALL">All Outlets</SelectItem>
                  {outlets.map((o) => (
                    <SelectItem key={o._id} value={o._id}>
                      {o.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* ── Live Columns Grid ── */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Column 1: Pending/New */}
        <div className="bg-muted/5/30 flex h-[560px] flex-col rounded-none border border-border/30 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-border/40 bg-rose-500/5 p-3">
            <div className="flex items-center gap-2">
              <IconClock className="size-4 animate-pulse text-rose-500" />
              <h2 className="text-xs font-bold tracking-wider text-rose-600 uppercase dark:text-rose-400">
                New/Pending
              </h2>
            </div>
            <Badge
              variant="secondary"
              className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
            >
              {pendingOrders.length}
            </Badge>
          </div>

          <div className="flex flex-1 scrollbar-thin flex-col gap-3 overflow-y-auto p-3">
            {ordersLoading ? (
              Array.from({ length: 2 }).map((_, idx) => (
                <Card
                  key={idx}
                  className="rounded-none border-border/30 shadow-none"
                >
                  <CardHeader className="p-3 pb-0">
                    <Skeleton className="h-4 w-3/4" />
                  </CardHeader>
                  <CardContent className="p-3">
                    <Skeleton className="mb-2 h-6 w-full" />
                    <Skeleton className="h-8 w-1/3" />
                  </CardContent>
                </Card>
              ))
            ) : pendingOrders.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                <IconAlertCircle className="mb-2 size-8 text-muted-foreground/30" />
                <p className="text-xs font-semibold text-muted-foreground">
                  No new orders
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground/70">
                  Fresh requests will appear here instantly.
                </p>
              </div>
            ) : (
              pendingOrders.map((order) => (
                <Card
                  key={order._id}
                  className="rounded-none border-border/30 bg-card/25 shadow-sm transition-all duration-200 hover:border-border/60"
                >
                  <CardContent className="p-3">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="flex items-center gap-1 font-mono text-xs font-semibold text-foreground">
                          #{order._id.substring(order._id.length - 6)}
                          <button
                            onClick={() => copyOrderId(order._id)}
                            className="cursor-pointer text-muted-foreground hover:text-foreground"
                          >
                            <IconCopy className="size-2.5" />
                          </button>
                        </span>
                        <span className="mt-0.5 text-[10px] text-muted-foreground">
                          {formatTime(order.createdAt)} •{" "}
                          {getTimeAgo(order.createdAt, timeTrigger)}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-rose-200 bg-rose-50/20 px-1 py-0 text-[9px] text-rose-700 dark:border-rose-900/30 dark:text-rose-300"
                      >
                        NEW
                      </Badge>
                    </div>

                    <Separator className="my-2 bg-border/30" />

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

                    <div className="mt-3.5 grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-none border-rose-200/50 text-[11px] text-rose-600 hover:bg-rose-50/30 dark:border-rose-950/40 dark:text-rose-400"
                        disabled={isMutatingId !== null}
                        onClick={() =>
                          handleUpdateStatus(order._id, OrderStatus.CANCELLED)
                        }
                      >
                        {isMutatingId === order._id ? (
                          <span className="mr-1 h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                        ) : (
                          <IconX className="mr-1 size-3" />
                        )}
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        className="h-8 rounded-none border-none bg-rose-600 text-[11px] font-medium text-white shadow-none hover:bg-rose-700"
                        disabled={isMutatingId !== null}
                        onClick={() =>
                          handleUpdateStatus(order._id, OrderStatus.PREPARING)
                        }
                      >
                        {isMutatingId === order._id ? (
                          <span className="mr-1 h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                        ) : (
                          <IconCheck className="mr-1 size-3" />
                        )}
                        Accept
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Preparing/Kitchen */}
        <div className="bg-muted/5/30 flex h-[560px] flex-col rounded-none border border-border/30 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-border/40 bg-blue-500/5 p-3">
            <div className="flex items-center gap-2">
              <IconToolsKitchen2 className="size-4 text-blue-500" />
              <h2 className="text-xs font-bold tracking-wider text-blue-600 uppercase dark:text-blue-400">
                Kitchen Prep
              </h2>
            </div>
            <Badge
              variant="secondary"
              className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
            >
              {preparingOrders.length}
            </Badge>
          </div>

          <div className="flex flex-1 scrollbar-thin flex-col gap-3 overflow-y-auto p-3">
            {ordersLoading ? (
              Array.from({ length: 2 }).map((_, idx) => (
                <Card
                  key={idx}
                  className="rounded-none border-border/30 shadow-none"
                >
                  <CardHeader className="p-3 pb-0">
                    <Skeleton className="h-4 w-3/4" />
                  </CardHeader>
                  <CardContent className="p-3">
                    <Skeleton className="mb-2 h-6 w-full" />
                    <Skeleton className="h-8 w-1/3" />
                  </CardContent>
                </Card>
              ))
            ) : preparingOrders.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                <IconToolsKitchen2 className="mb-2 size-8 text-muted-foreground/30" />
                <p className="text-xs font-semibold text-muted-foreground">
                  No orders in prep
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground/70">
                  Accept pending orders to dispatch them to the kitchen.
                </p>
              </div>
            ) : (
              preparingOrders.map((order) => (
                <Card
                  key={order._id}
                  className="rounded-none border-border/30 bg-card/25 shadow-sm transition-all duration-200 hover:border-border/60"
                >
                  <CardContent className="p-3">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="flex items-center gap-1 font-mono text-xs font-semibold text-foreground">
                          #{order._id.substring(order._id.length - 6)}
                          <button
                            onClick={() => copyOrderId(order._id)}
                            className="cursor-pointer text-muted-foreground hover:text-foreground"
                          >
                            <IconCopy className="size-2.5" />
                          </button>
                        </span>
                        <span className="mt-0.5 text-[10px] text-muted-foreground">
                          {formatTime(order.createdAt)} •{" "}
                          {getTimeAgo(order.createdAt, timeTrigger)}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-blue-200 bg-blue-50/20 px-1 py-0 text-[9px] text-blue-700 dark:border-blue-900/30 dark:text-blue-300"
                      >
                        COOKING
                      </Badge>
                    </div>

                    <Separator className="my-2 bg-border/30" />

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

                    <Button
                      size="sm"
                      className="mt-3.5 h-8 w-full rounded-none border-none bg-blue-600 text-[11px] font-medium text-white shadow-none hover:bg-blue-700"
                      disabled={isMutatingId !== null}
                      onClick={() =>
                        handleUpdateStatus(order._id, OrderStatus.READY)
                      }
                    >
                      {isMutatingId === order._id ? (
                        <span className="mr-1 h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                      ) : (
                        <IconPackage className="mr-1 size-3.5" />
                      )}
                      Mark as Ready
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Column 3: Ready for Pickup */}
        <div className="bg-muted/5/30 flex h-[560px] flex-col rounded-none border border-border/30 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-border/40 bg-purple-500/5 p-3">
            <div className="flex items-center gap-2">
              <IconPackage className="size-4 text-purple-500" />
              <h2 className="text-xs font-bold tracking-wider text-purple-600 uppercase dark:text-purple-400">
                Ready / Pickup
              </h2>
            </div>
            <Badge
              variant="secondary"
              className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700 dark:bg-purple-950/40 dark:text-purple-300"
            >
              {readyOrders.length}
            </Badge>
          </div>

          <div className="flex flex-1 scrollbar-thin flex-col gap-3 overflow-y-auto p-3">
            {ordersLoading ? (
              Array.from({ length: 2 }).map((_, idx) => (
                <Card
                  key={idx}
                  className="rounded-none border-border/30 shadow-none"
                >
                  <CardHeader className="p-3 pb-0">
                    <Skeleton className="h-4 w-3/4" />
                  </CardHeader>
                  <CardContent className="p-3">
                    <Skeleton className="mb-2 h-6 w-full" />
                    <Skeleton className="h-8 w-1/3" />
                  </CardContent>
                </Card>
              ))
            ) : readyOrders.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                <IconPackage className="mb-2 size-8 text-muted-foreground/30" />
                <p className="text-xs font-semibold text-muted-foreground">
                  No orders waiting
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground/70">
                  Ready orders will align here for completion checkout.
                </p>
              </div>
            ) : (
              readyOrders.map((order) => (
                <Card
                  key={order._id}
                  className="rounded-none border-border/30 bg-card/25 shadow-sm transition-all duration-200 hover:border-border/60"
                >
                  <CardContent className="p-3">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="flex items-center gap-1 font-mono text-xs font-semibold text-foreground">
                          #{order._id.substring(order._id.length - 6)}
                          <button
                            onClick={() => copyOrderId(order._id)}
                            className="cursor-pointer text-muted-foreground hover:text-foreground"
                          >
                            <IconCopy className="size-2.5" />
                          </button>
                        </span>
                        <span className="mt-0.5 text-[10px] text-muted-foreground">
                          {formatTime(order.createdAt)} •{" "}
                          {getTimeAgo(order.createdAt, timeTrigger)}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-purple-200 bg-purple-50/20 px-1 py-0 text-[9px] text-purple-700 dark:border-purple-900/30 dark:text-purple-300"
                      >
                        DISPATCH
                      </Badge>
                    </div>

                    <Separator className="my-2 bg-border/30" />

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

                    <Button
                      size="sm"
                      className="mt-3.5 h-8 w-full rounded-none border-none bg-purple-600 text-[11px] font-medium text-white shadow-none hover:bg-purple-700"
                      disabled={isMutatingId !== null}
                      onClick={() =>
                        handleUpdateStatus(order._id, OrderStatus.COMPLETED)
                      }
                    >
                      {isMutatingId === order._id ? (
                        <span className="mr-1 h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                      ) : (
                        <IconCheck className="mr-1 size-3.5" />
                      )}
                      Complete Checkout
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Table Section ── */}
      <div className="mt-6">
        <DataTable
          title={
            <div className="flex flex-col">
              <span className="text-sm font-bold">Latest Orders History</span>
              <span className="mt-0.5 text-[11px] font-normal text-muted-foreground">
                Track and search historical logs of completed, cancelled, or
                processing invoices.
              </span>
            </div>
          }
          icon={<IconReceipt className="size-4.5 text-primary" />}
          columns={columns}
          data={orders}
          loading={ordersLoading && orders.length === 0}
          loadingCount={5}
          searchable={true}
          searchPlaceholder="Search by ID, Status..."
          pagination={true}
          defaultPageSize={10}
        />
      </div>
    </div>
  )
}
