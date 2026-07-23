import * as React from "react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import dayjs from "dayjs"
import { type DateRange } from "react-day-picker"
import { IconCalendar } from "@tabler/icons-react"

interface DateRangePickerProps {
  dateRange: DateRange | undefined
  setDateRange: (range: DateRange | undefined) => void
}

export const DateRangePicker = React.memo(function DateRangePicker({
  dateRange,
  setDateRange,
}: DateRangePickerProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">Date Range:</span>
      <Popover>
        <PopoverTrigger
          render={
            <Button
              id="date"
              variant="outline"
              className={cn(
                "h-9 justify-start text-left text-xs font-normal min-w-[240px] px-3 bg-background border-border hover:bg-muted/50 text-foreground",
                !dateRange && "text-muted-foreground"
              )}
            >
              <IconCalendar className="mr-2 size-3.5 text-muted-foreground" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {dayjs(dateRange.from).format("DD MMM, YYYY")} -{" "}
                    {dayjs(dateRange.to).format("DD MMM, YYYY")}
                  </>
                ) : (
                  dayjs(dateRange.from).format("DD MMM, YYYY")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          }
        />
        <PopoverContent
          className="w-auto p-0 border border-border bg-popover text-popover-foreground shadow-md rounded-md"
          align="end"
        >
          <Calendar
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={setDateRange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
})
