import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { cn } from "@/lib/utils"

interface StatusSelectProps {
  value: string
  onChange: (newStatus: string) => void
  disabled?: boolean
  className?: string
}

export function StatusSelect({ value, onChange, disabled, className }: StatusSelectProps) {
  const normalizedValue = value?.toLowerCase() || "active"
  return (
    <NativeSelect
      value={normalizedValue}
      onChange={(e) => onChange(e.target.value)}
      size="sm"
      disabled={disabled}
      className={cn(
        "h-7 w-[100px] rounded-none font-bold tracking-wider uppercase text-[10px]",
        normalizedValue === "active" &&
          "border-emerald-500/35 bg-emerald-500/5 text-emerald-600 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20",
        normalizedValue === "inactive" &&
          "border-destructive/35 bg-destructive/5 text-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
        normalizedValue === "on hold" &&
          "border-amber-500/35 bg-amber-500/5 text-amber-600 focus-visible:border-amber-500 focus-visible:ring-amber-500/20",
        className
      )}
    >
      <NativeSelectOption value="active">Active</NativeSelectOption>
      <NativeSelectOption value="inactive">Inactive</NativeSelectOption>
      <NativeSelectOption value="on hold">On Hold</NativeSelectOption>
    </NativeSelect>
  )
}
