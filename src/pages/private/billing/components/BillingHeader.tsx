import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Button } from "@/components/ui/button"
import { IconQrcode } from "@tabler/icons-react"

interface Outlet {
  _id: string
  name: string
  deletedAt?: string | null
}

interface BillingHeaderProps {
  outlets: Outlet[]
  selectedOutlet: string
  setSelectedOutlet: (id: string) => void
  lockedOutletId: string | null
  onShowQr?: () => void
  hasActiveOutlet?: boolean
}

export function BillingHeader({
  outlets,
  selectedOutlet,
  setSelectedOutlet,
  lockedOutletId,
  onShowQr,
  hasActiveOutlet,
}: BillingHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b pb-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-xl font-bold text-foreground">Billing Dashboard</h1>
        <p className="text-xs text-muted-foreground">
          Place new orders and review transaction history.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {hasActiveOutlet && onShowQr && (
          <Button
            variant="outline"
            size="sm"
            onClick={onShowQr}
            className="gap-1.5 h-9 text-xs font-semibold cursor-pointer"
          >
            <IconQrcode className="size-4 text-primary" />
            Customer QR
          </Button>
        )}

        {!lockedOutletId && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Billing Outlet:</span>
            <NativeSelect
              value={selectedOutlet}
              onChange={(e) => setSelectedOutlet(e.target.value)}
              className="h-9 min-w-[160px] text-xs"
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
    </div>
  )
}
