import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface TopItemsChartProps {
  ordersLoading: boolean
  activeTopItems: any[]
}

export const TopItemsChart = React.memo(function TopItemsChart({
  ordersLoading,
  activeTopItems,
}: TopItemsChartProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold">
          Top 5 Selling Items
        </CardTitle>
        <CardDescription className="text-xs">
          Highest volume menu items ordered.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[240px] w-full">
          {ordersLoading ? (
            <Skeleton className="h-full w-full rounded-lg" />
          ) : activeTopItems.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              No order items sold yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={activeTopItems}
                layout="vertical"
                margin={{ left: 30, right: 20, top: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 10 }}
                  width={120}
                />
                <Tooltip
                  contentStyle={{ fontSize: 11 }}
                  formatter={(v) => [`${v} units`, "Sold"]}
                />
                <Bar dataKey="quantity" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
})
