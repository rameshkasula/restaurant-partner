import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { cn } from "@/lib/utils"
import { STATUS_STYLES } from "@/utils/permissions"

interface StatusSelectProps {
  value: string
  onChange: (newStatus: string) => void
  disabled?: boolean
  className?: string
  statusOptions?: StatusOption[]
}

export type StatusOption = {
  value: string
  label: string
  badgeClass: string
  dotClass: string
}

const Options: StatusOption[] = [
  {
    value: "active",
    label: "Active",
    badgeClass: STATUS_STYLES.ACTIVE,
    dotClass: "bg-emerald-500",
  },
  {
    value: "inactive",
    label: "Inactive",
    badgeClass: STATUS_STYLES.INACTIVE,
    dotClass: "bg-red-500",
  },
  {
    value: "on hold",
    label: "On Hold",
    badgeClass: STATUS_STYLES.ON_HOLD,
    dotClass: "bg-amber-500",
  },
]

export function StatusSelect({
  value,
  onChange,
  disabled,
  className,
  statusOptions = Options,
}: StatusSelectProps) {
  const normalizedValue = value?.toLowerCase() || "active"

  return (
    <NativeSelect
      value={normalizedValue}
      onChange={(e) => onChange(e.target.value)}
      size="sm"
      disabled={disabled}
      className={cn(
        "h-7 w-[100px] rounded-none text-[10px] font-bold tracking-wider uppercase",
        normalizedValue === "active" && STATUS_STYLES.ACTIVE,
        normalizedValue === "inactive" && STATUS_STYLES.INACTIVE,
        normalizedValue === "on hold" && STATUS_STYLES.ON_HOLD,
        className
      )}
    >
      {statusOptions?.map((option) => (
        <NativeSelectOption key={option.value} value={option.value}>
          {option.label}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  )
}
