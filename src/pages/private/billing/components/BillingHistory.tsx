import { useMemo, useState } from "react"
import {
  IconFileText,
  IconCalendar,
  IconRotateDot,
  IconPrinter,
  IconPencil,
  IconTrash,
  IconCash,
  IconCreditCard,
  IconDeviceMobile,
  IconArchive,
  IconReceipt,
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { type Order, OrderStatus, PaymentMode } from "@/api/orders.api"
import { DataTable, type ColumnDef } from "@/components/DataTable/DataTable"
import { Pagination } from "@/components/DataTable/Pagination"
import { BillingDateRangePicker } from "./BillingDateRangePicker"

const ORDER_STATUS_COLORS = {
  [OrderStatus.PENDING]:
    "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-900/50",
  [OrderStatus.PREPARING]:
    "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900/50",
  [OrderStatus.READY]:
    "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-900/50",
  [OrderStatus.COMPLETED]:
    "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-900/50",
  [OrderStatus.CANCELLED]:
    "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-900/50",
}

const PAYMENT_MODE_ICONS = {
  [PaymentMode.CASH]: <IconCash className="size-3.5 text-emerald-600 dark:text-emerald-400" />,
  [PaymentMode.CARD]: <IconCreditCard className="size-3.5 text-blue-600 dark:text-blue-400" />,
  [PaymentMode.UPI]: <IconDeviceMobile className="size-3.5 text-purple-600 dark:text-purple-400" />,
}

interface BillingHistoryProps {
  orders: Order[]
  ordersLoading: boolean
  paginationMeta: any
  setIncludeDeleted: (v: boolean) => void
  startDate: string
  setStartDate: (v: string) => void
  endDate: string
  setEndDate: (v: string) => void
  setPage: (v: number) => void
  setLimit: (v: number) => void
  handleRestoreOrder: (id: string) => void
  setViewReceipt: (order: Order) => void
  setEditingOrder: (order: Order) => void
  setDeleteConfirmId: (id: string) => void
}

export function BillingHistory({
  orders,
  ordersLoading,
  paginationMeta,
  setIncludeDeleted,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  setPage,
  setLimit,
  handleRestoreOrder,
  setViewReceipt,
  setEditingOrder,
  setDeleteConfirmId,
}: BillingHistoryProps) {
  // Local state to filter view: 'active' vs 'deleted'
  const [viewFilter, setViewFilter] = useState<"active" | "deleted">("active")

  // Filter orders according to view filter
  const displayedOrders = useMemo(() => {
    if (viewFilter === "deleted") {
      return orders.filter((o) => o.isDeleted)
    }
    return orders.filter((o) => !o.isDeleted)
  }, [orders, viewFilter])

  const handleTabChange = (filter: "active" | "deleted") => {
    setViewFilter(filter)
    setPage(1)
    if (filter === "deleted") {
      setIncludeDeleted(true)
    } else {
      setIncludeDeleted(false)
    }
  }

  const columns: ColumnDef<Order>[] = [
    {
      header: "Order ID",
      accessorKey: "_id",
      cell: ({ row }) => {
        const deleted = row.isDeleted
        return (
          <span
            className={cn(
              "font-mono text-xs font-semibold text-primary",
              deleted && "opacity-60 line-through text-muted-foreground"
            )}
          >
            #{row._id.slice(-6).toUpperCase()}
          </span>
        )
      },
    },
    {
      header: "Date & Time",
      accessorKey: "createdAt",
      cell: ({ row }) => (
        <span
          className={cn(
            "flex items-center gap-1.5 text-xs text-muted-foreground",
            row.isDeleted && "opacity-60"
          )}
        >
          <IconCalendar className="size-3.5" />
          {new Date(row.createdAt).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
    },
    {
      header: "Items Count",
      cell: ({ row }) => (
        <span
          className={cn("text-xs font-medium", row.isDeleted && "opacity-60")}
        >
          {row.items.reduce((acc, curr) => acc + curr.quantity, 0)} items
        </span>
      ),
    },
    {
      header: "Bill Amount",
      cell: ({ row }) => (
        <span
          className={cn("text-sm font-bold text-foreground", row.isDeleted && "opacity-60")}
        >
          ₹{row.bill.total.toFixed(2)}
        </span>
      ),
    },
    {
      header: "Payment Mode",
      cell: ({ row }) => {
        const paymentIcon = row.bill.paymentMode
          ? PAYMENT_MODE_ICONS[row.bill.paymentMode]
          : null
        return (
          <div className={cn(row.isDeleted && "opacity-60")}>
            {paymentIcon ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium capitalize">
                {paymentIcon}
                {row.bill.paymentMode}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground italic">
                Unpaid
              </span>
            )}
          </div>
        )
      },
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => (
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
            ORDER_STATUS_COLORS[row.status],
            row.isDeleted && "opacity-60"
          )}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: "Actions",
      className: "text-right pr-6",
      cell: ({ row }) => {
        const deleted = row.isDeleted
        const ordId = row._id
        return (
          <div className="flex items-center justify-end gap-1">
            {deleted ? (
              <Button
                variant="ghost"
                size="icon-sm"
                title="Restore invoice"
                onClick={() => handleRestoreOrder(ordId)}
                className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
              >
                <IconRotateDot className="size-3.5" />
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  title="View receipt"
                  onClick={() => setViewReceipt(row)}
                  className="hover:bg-primary/10 hover:text-primary"
                >
                  <IconPrinter className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  title="Update status"
                  onClick={() => setEditingOrder(row)}
                  className="hover:bg-muted"
                >
                  <IconPencil className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  title="Delete invoice"
                  onClick={() => setDeleteConfirmId(ordId)}
                >
                  <IconTrash className="size-3.5" />
                </Button>
              </>
            )}
          </div>
        )
      },
    },
  ]

  const headerActions = (
    <div className="flex flex-wrap items-center gap-3">
      {/* View Filter Segmented Control */}
      <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5 text-xs">
        <button
          type="button"
          onClick={() => handleTabChange("active")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-colors cursor-pointer",
            viewFilter === "active"
              ? "bg-background text-foreground shadow-2xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <IconReceipt className="size-3.5 text-primary" />
          <span>Active Invoices</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("deleted")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-colors cursor-pointer",
            viewFilter === "deleted"
              ? "bg-background text-destructive shadow-2xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <IconArchive className="size-3.5" />
          <span>Deleted Records</span>
        </button>
      </div>

      {/* Date Range Picker */}
      <BillingDateRangePicker
        startDate={startDate}
        endDate={endDate}
        onDateChange={(start, end) => {
          setStartDate(start)
          setEndDate(end)
          setPage(1)
        }}
      />
    </div>
  )

  const emptyState = (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-muted-foreground">
      {viewFilter === "deleted" ? (
        <>
          <IconArchive className="size-8 opacity-25" />
          <p className="text-xs font-medium text-foreground">No deleted invoices found</p>
          <p className="text-[11px] text-muted-foreground">
            Soft-deleted invoices for this outlet will appear here.
          </p>
        </>
      ) : (
        <>
          <IconFileText className="size-8 opacity-25" />
          <p className="text-xs font-medium text-foreground">No orders processed yet</p>
          <p className="text-[11px] text-muted-foreground">
            Start placing orders from the menu catalog above to see history here.
          </p>
        </>
      )}
    </div>
  )

  return (
    <div className="flex flex-col gap-4">
      <DataTable
        columns={columns}
        data={displayedOrders}
        loading={ordersLoading}
        searchable={false}
        pagination={false}
        title={viewFilter === "deleted" ? "Deleted Invoices Archive" : "Past Orders & Invoices"}
        icon={
          viewFilter === "deleted" ? (
            <IconArchive className="size-4 text-destructive" />
          ) : (
            <IconFileText className="size-4 text-primary" />
          )
        }
        headerActions={headerActions}
        emptyState={emptyState}
      />

      {paginationMeta && displayedOrders.length > 0 && (
        <Pagination
          currentPage={paginationMeta.page}
          totalPages={paginationMeta.totalPages}
          pageSize={paginationMeta.limit}
          totalEntries={paginationMeta.total}
          onPageChange={(p) => setPage(p)}
          onPageSizeChange={(s) => {
            setLimit(s)
            setPage(1)
          }}
        />
      )}
    </div>
  )
}
