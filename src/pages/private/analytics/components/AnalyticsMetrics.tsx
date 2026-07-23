import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { IconTrendingUp, IconRotateClockwise, IconBox, IconAlertCircle } from "@tabler/icons-react"

interface AnalyticsMetricsProps {
  ordersLoading: boolean
  activeMetrics: {
    completed: number
    completedQty: number
    cancelled: number
    cancelledQty: number
    itemsProcessed: number
    pipeline: number
    pipelineQty: number
  }
}

export const AnalyticsMetrics = React.memo(function AnalyticsMetrics({
  ordersLoading,
  activeMetrics,
}: AnalyticsMetricsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-4">
      {/* Completed Revenue */}
      <Card className="border-emerald-500/20 bg-emerald-50/5 shadow-sm">
        <CardContent className="flex items-center justify-between pt-6">
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">
              Completed Revenue
            </span>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {ordersLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                `₹${activeMetrics.completed.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}`
              )}
            </div>
            <p className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
              <IconTrendingUp className="size-3.5" />
              <span>
                {activeMetrics.completedQty.toLocaleString("en-IN")} items sold
              </span>
            </p>
          </div>
          <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
            <IconTrendingUp className="size-6" />
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Value */}
      <Card className="border-blue-500/20 bg-blue-50/5 shadow-sm">
        <CardContent className="flex items-center justify-between pt-6">
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">
              Pipeline Value
            </span>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {ordersLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                `₹${activeMetrics.pipeline.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}`
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">
              {activeMetrics.pipelineQty.toLocaleString("en-IN")} pending items
            </p>
          </div>
          <div className="rounded-lg bg-blue-50 p-3 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
            <IconRotateClockwise className="size-6" />
          </div>
        </CardContent>
      </Card>

      {/* Items Processed */}
      <Card className="border-purple-500/20 bg-purple-50/5 shadow-sm">
        <CardContent className="flex items-center justify-between pt-6">
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">
              Items Processed
            </span>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {ordersLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                activeMetrics.itemsProcessed.toLocaleString("en-IN")
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">
              Total volume across all states
            </p>
          </div>
          <div className="rounded-lg bg-purple-50 p-3 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400">
            <IconBox className="size-6" />
          </div>
        </CardContent>
      </Card>

      {/* Cancellations Loss */}
      <Card className="border-rose-500/20 bg-rose-50/5 shadow-sm">
        <CardContent className="flex items-center justify-between pt-6">
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">
              Cancellations Loss
            </span>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {ordersLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                `₹${activeMetrics.cancelled.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}`
              )}
            </div>
            <p className="text-[10px] text-rose-600">
              {activeMetrics.cancelledQty.toLocaleString("en-IN")} cancelled items
            </p>
          </div>
          <div className="rounded-lg bg-rose-50 p-3 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">
            <IconAlertCircle className="size-6" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
})
