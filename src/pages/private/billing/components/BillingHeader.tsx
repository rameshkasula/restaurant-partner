import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"

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
}

export function BillingHeader({
  outlets,
  selectedOutlet,
  setSelectedOutlet,
  lockedOutletId,
}: BillingHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b pb-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-xl font-bold text-foreground">Billing Dashboard</h1>
        <p className="text-xs text-muted-foreground">
          Place new orders and review transaction history.
        </p>
      </div>

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
  )
}
