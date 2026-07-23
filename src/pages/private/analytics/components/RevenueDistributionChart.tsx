import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface RevenueDistributionChartProps {
  ordersLoading: boolean
  activeStatusData: any[]
  totalSummaryRevenue: number
  statusColors: Record<string, string>
}

export const RevenueDistributionChart = React.memo(function RevenueDistributionChart({
  ordersLoading,
  activeStatusData,
  totalSummaryRevenue,
  statusColors,
}: RevenueDistributionChartProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold">
          Revenue Distribution by Status
        </CardTitle>
        <CardDescription className="text-xs">
          Financial share allocation of total business transactions.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="flex h-[240px] w-full items-center justify-center">
          {ordersLoading ? (
            <Skeleton className="h-full w-full rounded-lg" />
          ) : (
            <div className="flex h-full w-full items-center justify-between">
              <div className="h-full w-2/3">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={activeStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="total"
                    >
                      {activeStatusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={statusColors[entry.status]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) =>
                        `₹${Number(v).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}`
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Custom Status Legend */}
              <div className="flex w-1/3 flex-col gap-2.5 pr-2">
                {activeStatusData.map((item) => {
                  const itemTotal = item.total || item.totalPrice || 0
                  const percentage =
                    totalSummaryRevenue > 0
                      ? ((itemTotal / totalSummaryRevenue) * 100).toFixed(1)
                      : "0.0"
                  return (
                    <div key={item.status} className="flex flex-col gap-0.5 text-xs">
                      <div className="flex items-center gap-1.5 font-medium text-foreground">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{
                            backgroundColor: statusColors[item.status],
                          }}
                        />
                        <span className="truncate text-[11px] capitalize">
                          {item.status.toLowerCase()}
                        </span>
                        <span className="ml-auto text-[9px] font-semibold text-muted-foreground">
                          {percentage}%
                        </span>
                      </div>
                      <span className="pl-4 font-mono text-[10px] text-muted-foreground">
                        ₹{(itemTotal / 100000).toFixed(1)}L
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
})
