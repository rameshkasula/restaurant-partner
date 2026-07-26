import { Button } from "@/components/ui/button"
import { IconRefresh } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

interface LiveOrdersHeaderProps {
  isRefetching: boolean
  ordersLoading: boolean
  onRefresh: () => void
}

export function LiveOrdersHeader({
  isRefetching,
  ordersLoading,
  onRefresh,
}: LiveOrdersHeaderProps) {
  return (
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
            title={isRefetching ? "Polling data..." : "Live Connection Active"}
          />
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Real-time tracking of restaurant prep pipelines and ready completions.
        </p>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-auto">
        <Button
          variant="outline"
          size="icon"
          onClick={onRefresh}
          className="size-8"
          disabled={ordersLoading}
          title="Refresh orders"
        >
          <IconRefresh
            className={cn("size-4", ordersLoading && "animate-spin")}
          />
        </Button>
      </div>
    </div>
  )
}
