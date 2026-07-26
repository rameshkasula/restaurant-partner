import { Button } from "@/components/ui/button"
import { IconRefresh } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"

interface LiveOrdersHeaderProps {
  isRefetching: boolean
  ordersLoading: boolean
  onRefresh: () => void
  isPlatformUser?: boolean
  outlets?: any[]
  selectedOutlet?: string
  setSelectedOutlet?: (id: string) => void
}

export function LiveOrdersHeader({
  isRefetching,
  ordersLoading,
  onRefresh,
  isPlatformUser = false,
  outlets = [],
  selectedOutlet = "ALL",
  setSelectedOutlet,
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

      <div className="flex items-center gap-3 self-start sm:self-auto">
        {isPlatformUser && setSelectedOutlet && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Outlet:</span>
            <NativeSelect
              value={selectedOutlet}
              onChange={(e) => setSelectedOutlet(e.target.value)}
              className="h-8 min-w-[150px] text-xs"
            >
              <NativeSelectOption value="ALL">All Outlets</NativeSelectOption>
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
