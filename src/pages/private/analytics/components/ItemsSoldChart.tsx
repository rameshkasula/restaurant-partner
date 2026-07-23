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
  Cell,
} from "recharts"

interface ItemsSoldChartProps {
  ordersLoading: boolean
  activeStatusData: any[]
  statusColors: Record<string, string>
}

export const ItemsSoldChart = React.memo(function ItemsSoldChart({
  ordersLoading,
  activeStatusData,
  statusColors,
}: ItemsSoldChartProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold">
          Items Sold by Status
        </CardTitle>
        <CardDescription className="text-xs">
          Physical item throughput categorized by order state.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[240px] w-full">
          {ordersLoading ? (
            <Skeleton className="h-full w-full rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={activeStatusData}
                margin={{ left: -10, right: 10, top: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis
                  dataKey="status"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => v.charAt(0) + v.slice(1).toLowerCase()}
                />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ fontSize: 11 }}
                  formatter={(v) => [`${v} units`, "Quantity"]}
                />
                <Bar dataKey="totalQuantity" radius={[4, 4, 0, 0]} barSize={30}>
                  {activeStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={statusColors[entry.status]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
})
