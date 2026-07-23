import { useState, useMemo, useEffect } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  IconTrendingUp,
  IconReceipt,
  IconCoins,
  IconAlertCircle,
} from "@tabler/icons-react"
import { getAccessToken } from "@/utils/tokens"
import { useUsers } from "@/hooks/useUsers"
import { useOutlets } from "@/hooks/useOutlets"
import { useOrders } from "@/hooks/useOrders"
import { useMenuItems } from "@/hooks/useMenuItems"
import { OrderStatus, PaymentMode } from "@/api/orders.api"

// ── Profile Hook ─────────────────────────────────────────────────────────────

interface CurrentUserProfile {
  id?: string
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
        const match = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
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

// ── Main Page Component ───────────────────────────────────────────────────────

export default function Analytics() {
  const profile = useCurrentUserProfile()
  const lockedOutletId = profile?.outletId ?? null

  const { data: outlets = [] } = useOutlets()

  // Selected Outlet filter
  const [selectedOutlet, setSelectedOutlet] = useState("ALL")
  const activeOutletId = useMemo(() => {
    if (lockedOutletId) return lockedOutletId
    return selectedOutlet === "ALL" ? null : selectedOutlet
  }, [lockedOutletId, selectedOutlet])

  // Automatically select first outlet if not admin
  useEffect(() => {
    if (lockedOutletId) {
      setSelectedOutlet(lockedOutletId)
    } else if (outlets.length > 0 && selectedOutlet === "ALL") {
      const active = outlets.find((o) => !o.deletedAt)
      if (active) setSelectedOutlet(active._id)
    }
  }, [lockedOutletId, outlets])

  // Queries
  const { data: orders = [], isLoading: ordersLoading } = useOrders(activeOutletId ?? undefined)
  const { data: menuItems = [] } = useMenuItems(activeOutletId ?? undefined)

  // Map for menu items
  const menuMap = useMemo(() => {
    const m: Record<string, string> = {}
    menuItems.forEach((i) => {
      m[i._id] = i.name
    })
    return m
  }, [menuItems])

  // Only evaluate completed/valid orders for analytics
  const completedOrders = useMemo(() => {
    return orders.filter((o) => !o.isDeleted && o.status === OrderStatus.COMPLETED)
  }, [orders])

  // ── Metrics Calculations ─────────────────────────────────────────────────────
  const metrics = useMemo(() => {
    const totalSales = completedOrders.reduce((sum, o) => sum + o.bill.total, 0)
    const ordersCount = completedOrders.length
    const aov = ordersCount > 0 ? totalSales / ordersCount : 0

    return { totalSales, ordersCount, aov }
  }, [completedOrders])

  // ── Sales Over Time Chart Data ───────────────────────────────────────────────
  const salesOverTime = useMemo(() => {
    const dailyMap: Record<string, number> = {}
    completedOrders.forEach((o) => {
      const dateStr = new Date(o.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      })
      dailyMap[dateStr] = (dailyMap[dateStr] || 0) + o.bill.total
    })

    // Turn map into array and take last 7 days
    return Object.entries(dailyMap)
      .map(([date, amount]) => ({ date, amount }))
      .slice(-7)
  }, [completedOrders])

  // ── Sales by Payment Mode Chart Data ─────────────────────────────────────────
  const paymentModeData = useMemo(() => {
    const modes = {
      [PaymentMode.CASH]: 0,
      [PaymentMode.CARD]: 0,
      [PaymentMode.UPI]: 0,
    }

    completedOrders.forEach((o) => {
      if (o.bill.paymentMode && o.bill.paymentMode in modes) {
        modes[o.bill.paymentMode] += o.bill.total
      }
    })

    return Object.entries(modes).map(([name, value]) => ({ name, value }))
  }, [completedOrders])

  // ── Top Selling Items ────────────────────────────────────────────────────────
  const topItems = useMemo(() => {
    const itemQtyMap: Record<string, number> = {}
    completedOrders.forEach((o) => {
      o.items.forEach((item) => {
        itemQtyMap[item.menuItemId] = (itemQtyMap[item.menuItemId] || 0) + item.quantity
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

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* ── Outlet Selection Header ── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-xs text-muted-foreground">
            Perform in-depth analysis of sales, transaction metrics, and menu performance.
          </p>
        </div>

        {/* Outlet selector */}
        {!lockedOutletId && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Select Outlet:</span>
            <NativeSelect
              value={selectedOutlet}
              onChange={(e) => setSelectedOutlet(e.target.value)}
              className="h-9 text-xs min-w-[160px]"
            >
              <NativeSelectOption value="ALL">— Choose Outlet —</NativeSelectOption>
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

      {!activeOutletId ? (
        <Alert className="max-w-md mx-auto my-12">
          <IconAlertCircle className="size-4" />
          <AlertDescription>
            Please select an outlet from the top dropdown to view business analytics.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="flex flex-col gap-6">
          {/* ── Metrics Cards Grid ── */}
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Total Sales */}
            <Card className="shadow-sm">
              <CardContent className="pt-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-medium">Total Sales</span>
                  <div className="text-2xl font-bold">
                    {ordersLoading ? <Skeleton className="h-8 w-20" /> : `₹${metrics.totalSales.toFixed(2)}`}
                  </div>
                  <p className="text-[10px] text-emerald-600 flex items-center gap-0.5">
                    <IconTrendingUp className="size-3" />
                    <span>Completed orders revenue</span>
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
                  <IconTrendingUp className="size-6" />
                </div>
              </CardContent>
            </Card>

            {/* Total Orders */}
            <Card className="shadow-sm">
              <CardContent className="pt-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-medium">Orders Count</span>
                  <div className="text-2xl font-bold">
                    {ordersLoading ? <Skeleton className="h-8 w-12" /> : metrics.ordersCount}
                  </div>
                  <p className="text-[10px] text-muted-foreground">Successful transactions</p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-lg">
                  <IconReceipt className="size-6" />
                </div>
              </CardContent>
            </Card>

            {/* Average Order Value */}
            <Card className="shadow-sm">
              <CardContent className="pt-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-medium">Average Ticket</span>
                  <div className="text-2xl font-bold">
                    {ordersLoading ? <Skeleton className="h-8 w-16" /> : `₹${metrics.aov.toFixed(2)}`}
                  </div>
                  <p className="text-[10px] text-muted-foreground">Average revenue per ticket</p>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 rounded-lg">
                  <IconCoins className="size-6" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Charts Grid ── */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Sales Volume over Time */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">Sales Volume (Last 7 Days)</CardTitle>
                <CardDescription className="text-xs">Daily summary of completed transactions.</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[240px] w-full">
                  {ordersLoading ? (
                    <Skeleton className="h-full w-full rounded-lg" />
                  ) : salesOverTime.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                      No sales data available.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={salesOverTime} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v) => [`₹${v}`, "Revenue"]} />
                        <Area type="monotone" dataKey="amount" stroke="#10b981" fillOpacity={1} fill="url(#colorSales)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sales by Payment Mode */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">Revenue by Payment Mode</CardTitle>
                <CardDescription className="text-xs">UPI vs Credit Card vs Cash distribution.</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[240px] w-full flex items-center justify-center">
                  {ordersLoading ? (
                    <Skeleton className="h-full w-full rounded-lg" />
                  ) : completedOrders.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                      No payment data available.
                    </div>
                  ) : (
                    <div className="flex w-full h-full items-center justify-between">
                      <div className="h-full w-2/3">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={paymentModeData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {paymentModeData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(v) => `₹${Number(v).toFixed(2)}`} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      {/* Custom Legend */}
                      <div className="w-1/3 flex flex-col gap-2.5 pr-2">
                        {paymentModeData.map((item, index) => (
                          <div key={item.name} className="flex flex-col gap-0.5 text-xs">
                            <div className="flex items-center gap-1.5 font-medium text-foreground">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                              />
                              <span className="capitalize">{item.name.toLowerCase()}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground pl-4">
                              ₹{item.value.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top Selling Items (Bar Chart) */}
            <Card className="shadow-sm md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">Top 5 Selling Items</CardTitle>
                <CardDescription className="text-xs">Highest volume menu items ordered.</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[260px] w-full">
                  {ordersLoading ? (
                    <Skeleton className="h-full w-full rounded-lg" />
                  ) : topItems.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                      No order items sold yet.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topItems} layout="vertical" margin={{ left: 30, right: 20, top: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                        <XAxis type="number" tick={{ fontSize: 10 }} />
                        <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={120} />
                        <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v) => [`${v} units`, "Sold"]} />
                        <Bar dataKey="quantity" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
