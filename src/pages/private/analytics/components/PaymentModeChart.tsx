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

interface PaymentModeChartProps {
  ordersLoading: boolean
  activePaymentsData: any[]
  pieColors: string[]
}

export const PaymentModeChart = React.memo(function PaymentModeChart({
  ordersLoading,
  activePaymentsData,
  pieColors,
}: PaymentModeChartProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold">
          Revenue by Payment Mode
        </CardTitle>
        <CardDescription className="text-xs">
          UPI vs Credit Card vs Cash distribution.
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
                      data={activePaymentsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {activePaymentsData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={pieColors[index % pieColors.length]}
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
              {/* Custom Legend */}
              <div className="flex w-1/3 flex-col gap-2.5 pr-2">
                {activePaymentsData.map((item, index) => (
                  <div key={item.name} className="flex flex-col gap-0.5 text-xs">
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor: pieColors[index % pieColors.length],
                        }}
                      />
                      <span className="text-[11px] capitalize">
                        {item.name.toLowerCase()}
                      </span>
                    </div>
                    <span className="pl-4 text-[10px] text-muted-foreground">
                      ₹{item.value.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
})
