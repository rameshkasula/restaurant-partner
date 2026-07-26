import * as React from "react"
import { type DateRange } from "react-day-picker"
import dayjs from "dayjs"
import { IconCalendar, IconX } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface BillingDateRangePickerProps {
  startDate: string
  endDate: string
  onDateChange: (start: string, end: string) => void
}

export function BillingDateRangePicker({
  startDate,
  endDate,
  onDateChange,
}: BillingDateRangePickerProps) {
  const [open, setOpen] = React.useState(false)

  // Convert string state to DateRange object for react-day-picker
  const dateRange: DateRange | undefined = React.useMemo(() => {
    if (!startDate && !endDate) return undefined
    return {
      from: startDate ? dayjs(startDate).toDate() : undefined,
      to: endDate ? dayjs(endDate).toDate() : undefined,
    }
  }, [startDate, endDate])

  const handleSelect = (range: DateRange | undefined) => {
    const fromStr = range?.from ? dayjs(range.from).format("YYYY-MM-DD") : ""
    const toStr = range?.to ? dayjs(range.to).format("YYYY-MM-DD") : ""
    onDateChange(fromStr, toStr)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDateChange("", "")
  }

  const setPreset = (preset: "today" | "yesterday" | "last7" | "thisMonth") => {
    const today = dayjs()
    if (preset === "today") {
      const formatted = today.format("YYYY-MM-DD")
      onDateChange(formatted, formatted)
    } else if (preset === "yesterday") {
      const yest = today.subtract(1, "day").format("YYYY-MM-DD")
      onDateChange(yest, yest)
    } else if (preset === "last7") {
      const fromStr = today.subtract(6, "day").format("YYYY-MM-DD")
      const toStr = today.format("YYYY-MM-DD")
      onDateChange(fromStr, toStr)
    } else if (preset === "thisMonth") {
      const fromStr = today.startOf("month").format("YYYY-MM-DD")
      const toStr = today.endOf("month").format("YYYY-MM-DD")
      onDateChange(fromStr, toStr)
    }
    setOpen(false)
  }

  const displayText = React.useMemo(() => {
    if (startDate && endDate) {
      if (startDate === endDate) {
        return dayjs(startDate).format("MMM D, YYYY")
      }
      return `${dayjs(startDate).format("MMM D, YYYY")} - ${dayjs(endDate).format("MMM D, YYYY")}`
    }
    if (startDate) {
      return `From ${dayjs(startDate).format("MMM D, YYYY")}`
    }
    if (endDate) {
      return `Until ${dayjs(endDate).format("MMM D, YYYY")}`
    }
    return "All Time (Date Filter)"
  }, [startDate, endDate])

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-8 gap-2 px-3 text-xs font-normal bg-background hover:bg-muted/50 border-border shadow-2xs",
                (startDate || endDate) && "border-primary/50 text-foreground font-medium bg-primary/5"
              )}
            >
              <IconCalendar className="size-3.5 text-muted-foreground" />
              <span>{displayText}</span>
              {(startDate || endDate) && (
                <span
                  onClick={handleClear}
                  className="ml-1 rounded-full p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Clear filter"
                >
                  <IconX className="size-3" />
                </span>
              )}
            </Button>
          }
        />
        <PopoverContent align="end" className="w-auto p-3 shadow-lg border border-border">
          <div className="flex flex-col gap-3">
            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 border-b pb-2.5">
              <Button
                variant="outline"
                size="xs"
                onClick={() => setPreset("today")}
                className="text-[11px] h-7 px-2"
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={() => setPreset("yesterday")}
                className="text-[11px] h-7 px-2"
              >
                Yesterday
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={() => setPreset("last7")}
                className="text-[11px] h-7 px-2"
              >
                Last 7 Days
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={() => setPreset("thisMonth")}
                className="text-[11px] h-7 px-2"
              >
                This Month
              </Button>
              {(startDate || endDate) && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => {
                    onDateChange("", "")
                    setOpen(false)
                  }}
                  className="text-[11px] h-7 px-2 text-destructive hover:bg-destructive/10 ml-auto"
                >
                  Reset
                </Button>
              )}
            </div>

            {/* Calendar */}
            <Calendar
              mode="range"
              defaultMonth={dateRange?.from || new Date()}
              selected={dateRange}
              onSelect={handleSelect}
              numberOfMonths={1}
              className="p-0"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
