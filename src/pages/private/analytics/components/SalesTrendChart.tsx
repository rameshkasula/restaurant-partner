import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface SalesTrendChartProps {
  ordersLoading: boolean
  salesOverTime: Array<{ date: string; amount: number }>
}

export const SalesTrendChart = React.memo(function SalesTrendChart({
  ordersLoading,
  salesOverTime,
}: SalesTrendChartProps) {
  return (
    <Card className="shadow-sm md:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold">
          Sales Volume Trend (Last 7 Days)
        </CardTitle>
        <CardDescription className="text-xs">
          Daily summary of completed transactions from the current order list.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[240px] w-full">
          {ordersLoading ? (
            <Skeleton className="h-full w-full rounded-lg" />
          ) : salesOverTime.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              No recent sales trend data.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={salesOverTime}
                margin={{ left: -10, right: 10, top: 10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ fontSize: 11 }}
                  formatter={(v) => [`₹${v}`, "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorSales)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
})
