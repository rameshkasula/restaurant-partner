/* eslint-disable react-hooks/preserve-manual-memoization */
import { useState, useEffect, useMemo, useCallback } from "react"
import {
  IconClock,
  IconToolsKitchen2,
  IconPackage,
  IconCopy,
  IconAlertCircle,
  IconReceipt,
} from "@tabler/icons-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { getAccessToken } from "@/utils/tokens"
import { useLiveOrders, useUpdateOrder } from "@/hooks/useOrders"
import { useMenuItems } from "@/hooks/useMenuItems"
import { OrderStatus, type Order } from "@/api/orders.api"
import { useOutletStore } from "@/store/outletStore"
import { DataTable } from "@/components/DataTable/DataTable"
import type { ColumnDef } from "@/components/DataTable/DataTable"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { LiveOrdersHeader } from "./components/LiveOrdersHeader"
import { OrderColumn } from "./components/OrderColumn"
import {
  PAYMENT_MODE_ICONS,
  STATUS_BADGE_CLASSES,
} from "./components/orderHelpers"
import {
  formatTime,
  formatCurrency,
} from "@/utils/formatters"

// ── Profile Hook ─────────────────────────────────────────────────────────────

interface CurrentUserProfile {
  email: string
  role: string
  organizationId: string | null
  outletId: string | null
  outletName?: string
}

function useCurrentUserProfile() {
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
      const base64Url = token.split(".")[1]
      if (base64Url) {
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
        const decoded = JSON.parse(atob(base64))
        return {
          email: decoded.email || decoded.sub || "",
          role: decoded.role || "",
          organizationId: decoded.organizationId || null,
          outletId: decoded.outletId || null,
        }
      }
    } catch {
      // Fail silently
    }
    return null
  }, [])
}

// ── Main Page Component ──────────────────────────────────────────────────────

export default function LiveOrders() {
  const profile = useCurrentUserProfile()
  const lockedOutletId = profile?.outletId ?? null
  const { selectedOutlet, setSelectedOutlet } = useOutletStore()

  // For time ago trigger updates
  const [timeTrigger, setTimeTrigger] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeTrigger((prev) => prev + 1)
    }, 30000)
    return () => clearInterval(timer)
  }, [])

  // Automatically lock/update selection if lockedOutletId exists
  useEffect(() => {
    if (lockedOutletId && selectedOutlet !== lockedOutletId) {
      setSelectedOutlet(lockedOutletId)
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
  } = useLiveOrders(activeOutletId)

  const { data: menuItems = [] } = useMenuItems(activeOutletId, false, false)

  // Status Mutation
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

  // Menu items name lookup
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
    (itemObj: any) => {
      if (!itemObj) return "Unknown Item"

      if (typeof itemObj === "object") {
        if (itemObj.name) return itemObj.name
        if (itemObj.title) return itemObj.title
        if (itemObj._id) return getMenuItemName(itemObj._id)
        if (itemObj.id) return getMenuItemName(itemObj.id)
      }

      const strId = String(itemObj)
      if (menuItemsMap[strId]) return menuItemsMap[strId]

      if (strId.length >= 4) {
        return `Item (${strId.substring(strId.length - 4)})`
      }
      return strId || "Item"
    },
    [menuItemsMap]
  )

  // Safe parsing orders list
  const orders: Order[] = useMemo(() => {
    if (!ordersData) return []
    if (Array.isArray(ordersData)) return ordersData
    if (ordersData && typeof ordersData === "object" && "data" in ordersData) {
      return (ordersData as { data: Order[] }).data
    }
    return []
  }, [ordersData])

  // Split orders into pipeline lists
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

  const copyOrderId = (id: any) => {
    const strId =
      typeof id === "object" ? String(id._id || id.id || "") : String(id)
    navigator.clipboard.writeText(strId)
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
          <span>
            {typeof row.outletId === "object"
              ? (row.outletId as any)?.name || (row.outletId as any)?._id
              : (row.outletId ?? "N/A")}
          </span>
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
    [getMenuItemName, profile]
  )

  const isMutatingId = updateOrderMutation.isPending
    ? updateOrderMutation.variables?.id
    : null

  return (
    <div className="flex h-screen flex-col bg-background text-foreground overflow-hidden">
      {/* Page Header (Fixed) */}
      <div className="p-6 pb-2">
        <LiveOrdersHeader
          isRefetching={isRefetching}
          ordersLoading={ordersLoading}
          onRefresh={refetch}
        />
      </div>

      <Tabs defaultValue="live" className="flex flex-1 flex-col overflow-hidden px-6 pb-6">
        <TabsList className="w-full justify-start max-w-fit mb-4">
          <TabsTrigger value="live" className="gap-2">
            <IconClock className="size-4" /> Live Pipeline
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <IconReceipt className="size-4" /> Orders History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="flex-1 min-h-0 m-0 border-none p-0 outline-none">
          {/* Live Pipeline Columns Grid */}
          <div className="grid h-full grid-cols-1 gap-6 md:grid-cols-3">
            {/* Column 1: Pending/New */}
        <OrderColumn
          title="New/Pending"
          icon={<IconClock className="size-4 animate-pulse text-destructive" />}
          count={pendingOrders.length}
          orders={pendingOrders}
          isLoading={ordersLoading}
          emptyTitle="No new orders"
          emptySub="Fresh requests will appear here instantly."
          emptyIcon={
            <IconAlertCircle className="mb-2 size-8 text-muted-foreground/30" />
          }
          getMenuItemName={getMenuItemName}
          copyOrderId={copyOrderId}
          timeTrigger={timeTrigger}
          isMutatingId={isMutatingId}
          onUpdateStatus={handleUpdateStatus}
          columnType="pending"
        />

        {/* Column 2: Preparing/Kitchen */}
        <OrderColumn
          title="Kitchen Prep"
          icon={<IconToolsKitchen2 className="size-4 text-primary" />}
          count={preparingOrders.length}
          orders={preparingOrders}
          isLoading={ordersLoading}
          emptyTitle="No orders in prep"
          emptySub="Accept pending orders to dispatch them to the kitchen."
          emptyIcon={
            <IconToolsKitchen2 className="mb-2 size-8 text-muted-foreground/30" />
          }
          getMenuItemName={getMenuItemName}
          copyOrderId={copyOrderId}
          timeTrigger={timeTrigger}
          isMutatingId={isMutatingId}
          onUpdateStatus={handleUpdateStatus}
          columnType="preparing"
        />

        {/* Column 3: Ready for Pickup */}
        <OrderColumn
          title="Ready / Pickup"
          icon={<IconPackage className="size-4 text-secondary-foreground" />}
          count={readyOrders.length}
          orders={readyOrders}
          isLoading={ordersLoading}
          emptyTitle="No orders waiting"
          emptySub="Ready orders will align here for completion checkout."
          emptyIcon={
            <IconPackage className="mb-2 size-8 text-muted-foreground/30" />
          }
          getMenuItemName={getMenuItemName}
          copyOrderId={copyOrderId}
          timeTrigger={timeTrigger}
          isMutatingId={isMutatingId}
          onUpdateStatus={handleUpdateStatus}
          columnType="ready"
        />
      </div>
        </TabsContent>

        <TabsContent value="history" className="flex-1 min-h-0 m-0 border-none p-0 outline-none">
          {/* History Table */}
          <div className="h-full flex flex-col">
            <DataTable
              title={
                <div className="flex flex-col">
                  <span className="text-sm font-bold">Latest Orders History</span>
                  <span className="mt-0.5 text-[11px] font-normal text-muted-foreground">
                    Track and search historical logs of completed, cancelled, or processing invoices.
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
              containerClassName="h-full border shadow-sm rounded-xl"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
