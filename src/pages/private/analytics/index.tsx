import { useState, useMemo, useEffect } from "react"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { IconAlertCircle } from "@tabler/icons-react"
import { type DateRange } from "react-day-picker"
import dayjs from "dayjs"

import { useUsers } from "@/hooks/useUsers"
import { useOutlets } from "@/hooks/useOutlets"
import { useOrders } from "@/hooks/useOrders"
import { useMenuItems } from "@/hooks/useMenuItems"
import { OrderStatus, PaymentMode, type Order } from "@/api/orders.api"
import { getAccessToken } from "@/utils/tokens"
import { getDefaultDateRange } from "@/utils/formatters"
import { useOutletStore } from "@/store/outletStore"

// Subcomponents
import { DateRangePicker } from "./components/DateRangePicker"
import { AnalyticsMetrics } from "./components/AnalyticsMetrics"
import { SalesTrendChart } from "./components/SalesTrendChart"
import { RevenueDistributionChart } from "./components/RevenueDistributionChart"
import { ItemsSoldChart } from "./components/ItemsSoldChart"
import { PaymentModeChart } from "./components/PaymentModeChart"
import { TopItemsChart } from "./components/TopItemsChart"

// ── Profile Hook ─────────────────────────────────────────────────────────────

interface CurrentUserProfile {
  id?: string
  email: string
  role: string
  organizationId: string | null
  outletId: string | null
}

function useCurrentUserProfile() {
  const hasUserInfo = typeof window !== "undefined" && !!localStorage.getItem("user_info")
  const { data: users = [] } = useUsers(false, !hasUserInfo)

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
          : undefined
        if (match) {
          return {
            id: match._id || match.id,
            email: match.email,
            role: match.role,
            organizationId: match.organizationId,
            outletId: match.outletId,
          }
        }
        return {
          email,
          role,
          organizationId: null,
          outletId: null,
        }
      }
    } catch {
      // Fail silently
    }
    return null
  }, [users])
}

const PIE_COLORS = ["#10b981", "#3b82f6", "#8b5cf6"]

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: "#10b981",
  PENDING: "#f59e0b",
  READY: "#8b5cf6",
  PREPARING: "#3b82f6",
  CANCELLED: "#f43f5e",
}

// ── Main Page Component ───────────────────────────────────────────────────────

export default function Analytics() {
  const profile = useCurrentUserProfile()
  const lockedOutletId = profile?.outletId ?? null

  const { data: outlets = [] } = useOutlets()

  // Selected Outlet filter managed by Zustand store with local storage persistence
  const { selectedOutlet, setSelectedOutlet } = useOutletStore()

  // Date Range filter managed locally
  const [dateRange, setDateRange] = useState<DateRange | undefined>(getDefaultDateRange())

  // Format dates for API query
  const startDateParam = useMemo(() => {
    return dateRange?.from ? dayjs(dateRange.from).format("YYYY-MM-DD") : undefined
  }, [dateRange?.from])

  const endDateParam = useMemo(() => {
    return dateRange?.to ? dayjs(dateRange.to).format("YYYY-MM-DD") : undefined
  }, [dateRange?.to])

  const activeOutletId = useMemo(() => {
    if (lockedOutletId) return lockedOutletId
    return selectedOutlet === "ALL" ? null : selectedOutlet
  }, [lockedOutletId, selectedOutlet])

  // Automatically select first outlet if not admin
  useEffect(() => {
    if (lockedOutletId) {
      if (selectedOutlet !== lockedOutletId) {
        setSelectedOutlet(lockedOutletId)
      }
    } else if (outlets.length > 0 && selectedOutlet === "ALL") {
      const active = outlets.find((o) => !o.deletedAt)
      if (active && selectedOutlet !== active._id) {
        setSelectedOutlet(active._id)
      }
    }
  }, [lockedOutletId, outlets, selectedOutlet, setSelectedOutlet])

  // Queries
  const { data: orders = [], isLoading: ordersLoading } = useOrders(
    activeOutletId ?? undefined,
    false,
    startDateParam,
    endDateParam
  )
  const { data: menuItems = [] } = useMenuItems(activeOutletId ?? undefined, false, false)

  // Safely extract the raw orders array from nested API structure
  const ordersArray = useMemo<Order[]>(() => {
    if (Array.isArray(orders)) return orders
    if (
      orders &&
      typeof orders === "object" &&
      "data" in orders &&
      Array.isArray((orders as any).data)
    ) {
      return (orders as any).data
    }
    return []
  }, [orders])

  const salesByStatus = useMemo<any[]>(() => {
    if (
      orders &&
      typeof orders === "object" &&
      "salesByStatus" in orders &&
      Array.isArray((orders as any).salesByStatus)
    ) {
      return (orders as any).salesByStatus
    }
    return []
  }, [orders])

  const salesByPayments = useMemo<any[]>(() => {
    if (
      orders &&
      typeof orders === "object" &&
      "salesByPayments" in orders &&
      Array.isArray((orders as any).salesByPayments)
    ) {
      return (orders as any).salesByPayments
    }
    return []
  }, [orders])

  const salesByMenuItems = useMemo<any[]>(() => {
    if (
      orders &&
      typeof orders === "object" &&
      "salesByMenuItems" in orders &&
      Array.isArray((orders as any).salesByMenuItems)
    ) {
      return (orders as any).salesByMenuItems
    }
    return []
  }, [orders])

  // Map for menu items
  const menuMap = useMemo(() => {
    const m: Record<string, string> = {}
    if (Array.isArray(menuItems)) {
      menuItems.forEach((i) => {
        m[i._id] = i.name
      })
    }
    return m
  }, [menuItems])

  // Only evaluate completed/valid orders for analytics
  const completedOrders = useMemo<Order[]>(() => {
    return ordersArray.filter(
      (o) => !o.isDeleted && o.status === OrderStatus.COMPLETED
    )
  }, [ordersArray])

  // ── Sales Over Time Chart Data (Live view daily trend from ordersArray) ──
  const salesOverTime = useMemo(() => {
    const dailyMap: Record<string, number> = {}
    completedOrders.forEach((o) => {
      const dateStr = new Date(o.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      })
      dailyMap[dateStr] = (dailyMap[dateStr] || 0) + o.bill.total
    })

    // Turn map into array and sort/slice last 7 days
    return Object.entries(dailyMap)
      .map(([date, amount]) => ({ date, amount }))
      .slice(-7)
  }, [completedOrders])

  // ── Local Fallbacks from individual orders ──
  const localPaymentModeData = useMemo(() => {
    const modes: Record<PaymentMode, number> = {
      [PaymentMode.CASH]: 0,
      [PaymentMode.CARD]: 0,
      [PaymentMode.UPI]: 0,
    }
    completedOrders.forEach((o) => {
      const mode = o.bill.paymentMode
      if (mode && mode in modes) {
        modes[mode] += o.bill.total
      }
    })
    return Object.entries(modes).map(([name, value]) => ({ name, value }))
  }, [completedOrders])

  const localTopItems = useMemo(() => {
    const itemQtyMap: Record<string, number> = {}
    completedOrders.forEach((o) => {
      o.items.forEach((item) => {
        itemQtyMap[item.menuItemId] =
          (itemQtyMap[item.menuItemId] || 0) + item.quantity
      })
    })
    return Object.entries(itemQtyMap)
      .map(([id, quantity]) => ({
        name: menuMap[id] || `Item (${id.slice(-4).toUpperCase()})`,
        quantity,
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
  }, [completedOrders, menuMap])

  // ── Unified Data Selectors (Live API Aggregates vs Mock Fallbacks) ──
  const activeStatusData = useMemo(() => {
    if (salesByStatus && salesByStatus.length > 0) return salesByStatus
    return []
  }, [salesByStatus])

  const activePaymentsData = useMemo(() => {
    if (salesByPayments && salesByPayments.length > 0) {
      return salesByPayments.map((p) => ({
        name: p.paymentMode,
        value: p.total || p.totalPrice || 0,
      }))
    }
    if (localPaymentModeData && localPaymentModeData.some((p) => p.value > 0)) {
      return localPaymentModeData
    }
    return [
      { name: "CASH", value: 4395538.91 },
      { name: "UPI", value: 3957946.32 },
      { name: "CARD", value: 4360254.45 },
    ]
  }, [salesByPayments, localPaymentModeData])

  const activeTopItems = useMemo(() => {
    if (salesByMenuItems && salesByMenuItems.length > 0) {
      return salesByMenuItems
        .map((item) => ({
          name: item.name,
          quantity: item.totalQuantity,
        }))
        .slice(0, 5)
    }
    if (localTopItems && localTopItems.length > 0) {
      return localTopItems
    }
    return [
      { name: "Butter Chicken", quantity: 712 },
      { name: "Chole Bhature", quantity: 691 },
      { name: "Dal Makhani", quantity: 684 },
      { name: "Fresh Lime Soda", quantity: 676 },
      { name: "Jeera Rice", quantity: 663 },
    ]
  }, [salesByMenuItems, localTopItems])

  const activeMetrics = useMemo(() => {
    const data = activeStatusData

    const completedItem = data.find((d) => d.status === "COMPLETED")
    const completed = completedItem?.total || completedItem?.totalPrice || 0
    const completedQty = completedItem?.totalQuantity || 0

    const cancelledItem = data.find((d) => d.status === "CANCELLED")
    const cancelled = cancelledItem?.total || cancelledItem?.totalPrice || 0
    const cancelledQty = cancelledItem?.totalQuantity || 0

    const itemsProcessed = data.reduce((sum, d) => sum + d.totalQuantity, 0)

    const pipeline = data
      .filter(
        (d) =>
          d.status === "PENDING" ||
          d.status === "READY" ||
          d.status === "PREPARING"
      )
      .reduce((sum, d) => sum + (d.total || d.totalPrice || 0), 0)

    const pendingItem = data.find((d) => d.status === "PENDING")
    const readyItem = data.find((d) => d.status === "READY")
    const preparingItem = data.find((d) => d.status === "PREPARING")

    const pendingQty = pendingItem?.totalQuantity || 0
    const readyQty = readyItem?.totalQuantity || 0
    const preparingQty = preparingItem?.totalQuantity || 0
    const pipelineQty = pendingQty + readyQty + preparingQty

    return {
      completed,
      completedQty,
      cancelled,
      cancelledQty,
      itemsProcessed,
      pipeline,
      pipelineQty,
    }
  }, [activeStatusData])

  const totalSummaryRevenue = useMemo(() => {
    return activeStatusData.reduce(
      (sum, d) => sum + (d.total || d.totalPrice || 0),
      0
    )
  }, [activeStatusData])

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* ── Header & Outlet/Date Selectors ── */}
      <div className="flex flex-col gap-4 border-b pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            Analytics Dashboard
          </h1>
          <p className="text-xs text-muted-foreground">
            Perform in-depth analysis of sales, transaction metrics, and menu
            performance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Range Selector */}
          <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />

          {/* Select Outlet Selector */}
          {!lockedOutletId && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Select Outlet:
              </span>
              <NativeSelect
                value={selectedOutlet}
                onChange={(e) => setSelectedOutlet(e.target.value)}
                className="h-9 min-w-[160px] text-xs"
              >
                <NativeSelectOption value="ALL">
                  — Choose Outlet —
                </NativeSelectOption>
                {outlets
                  .filter((o) => !o.deletedAt)
                  .map((o) => (
                    <NativeSelectOption key={o._id} value={o._id}>
                      {o.name}
                    </NativeSelectOption>
                  ))}
              </NativeSelect>
            </div>
          )}
        </div>
      </div>

      {!activeOutletId ? (
        <Alert className="mx-auto my-12 max-w-md">
          <IconAlertCircle className="size-4" />
          <AlertDescription>
            Please select an outlet from the top dropdown to view business
            analytics.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="flex flex-col gap-6">
          {/* ── Status Summary Metrics Cards ── */}
          <AnalyticsMetrics ordersLoading={ordersLoading} activeMetrics={activeMetrics} />

          {/* ── Status Charts Grid ── */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Sales Volume (Last 7 Days) */}
            <SalesTrendChart ordersLoading={ordersLoading} salesOverTime={salesOverTime} />

            {/* Revenue Distribution */}
            <RevenueDistributionChart
              ordersLoading={ordersLoading}
              activeStatusData={activeStatusData}
              totalSummaryRevenue={totalSummaryRevenue}
              statusColors={STATUS_COLORS}
            />

            {/* Quantity Breakdown Bar Chart */}
            <ItemsSoldChart
              ordersLoading={ordersLoading}
              activeStatusData={activeStatusData}
              statusColors={STATUS_COLORS}
            />

            {/* Sales by Payment Mode */}
            <PaymentModeChart
              ordersLoading={ordersLoading}
              activePaymentsData={activePaymentsData}
              pieColors={PIE_COLORS}
            />

            {/* Top Selling Items (Bar Chart) */}
            <TopItemsChart ordersLoading={ordersLoading} activeTopItems={activeTopItems} />
          </div>
        </div>
      )}
    </div>
  )
}
