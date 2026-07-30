import { useState, useMemo, useEffect } from "react"
import {
  useRequests,
  useDeleteRequest,
  useUpdateRequestStatus,
} from "@/hooks/useRequests"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import {
  IconBuildingStore,
  IconRefresh,
  IconTrash,
  IconCalendar,
  IconPhone,
  IconMail,
  IconMapPin,
  IconFileText,
  IconListDetails,
  IconSearch,
} from "@tabler/icons-react"
import { toast } from "sonner"
import { APP_NAME } from "@/utils/constants"

import { EditRequestDialog, CreateRequestDialog } from "./CreateEditRequests"
import { ErrorMsg } from "@/components/ErrorMsg"
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog"
import { cn } from "@/lib/utils"
import {
  RestaurantRequestStatus,
  type RestaurantRequest,
} from "@/api/requests.api"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DataTable } from "@/components/DataTable/DataTable"
import type { ColumnDef } from "@/components/DataTable/DataTable"
import { Pagination } from "@/components/DataTable/Pagination"
import { formatDateTime, getTimeAgo } from "@/utils/formatters"

const STATUS_STYLES = {
  [RestaurantRequestStatus.WAITING_FOR_CALL]: {
    label: "Waiting for Call",
    badgeClass:
      "bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-900/40",
    dotClass: "bg-amber-500",
  },
  [RestaurantRequestStatus.CONTACTED]: {
    label: "Approved",
    badgeClass:
      "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900/40",
    dotClass: "bg-emerald-500",
  },
  [RestaurantRequestStatus.DECLINED]: {
    label: "Declined",
    badgeClass:
      "bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/20 dark:text-rose-300 dark:border-rose-900/40",
    dotClass: "bg-rose-500",
  },
}

const STATUS_FILTER_OPTIONS = [
  { label: "All Statuses", value: "ALL" },
  { label: "Waiting for Call", value: RestaurantRequestStatus.WAITING_FOR_CALL },
  { label: "Approved", value: RestaurantRequestStatus.CONTACTED },
  { label: "Declined", value: RestaurantRequestStatus.DECLINED },
]

export default function Requests() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")

  const {
    data: dataRequests,
    isLoading,
    isError,
    refetch,
  } = useRequests({
    page: String(page),
    limit: String(limit),
    status: statusFilter === "ALL" ? undefined : statusFilter,
    search: search.trim() || undefined,
  })

  // Fetch a larger set in the background for calculations/stats
  const { data: statsRequestsData } = useRequests({
    limit: "1000",
  })

  const requests = dataRequests?.data || []
  const paginationMeta = dataRequests?.pagination
  const statsRequests = statsRequestsData?.data || []

  const { mutateAsync: deleteRequest } = useDeleteRequest()
  const { mutateAsync: updateStatus } = useUpdateRequestStatus()

  // For time-ago trigger updates
  const [timeTrigger, setTimeTrigger] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeTrigger((prev) => prev + 1)
    }, 30000)
    return () => clearInterval(timer)
  }, [])

  // Reset page when search or filters change
  useEffect(() => {
    setPage(1)
  }, [search, statusFilter])

  // Calculations for Stats Card using statsRequests
  const totalRequests = statsRequests.length
  const uniqueCities = useMemo(() => {
    return Array.from(
      new Set(
        statsRequests
          .map((r: RestaurantRequest) => r?.city)
          .filter(Boolean)
      )
    ).length
  }, [statsRequests])

  const recentRequestsCount = useMemo(() => {
    return statsRequests.filter((r: RestaurantRequest) => {
      if (!r?.createdAt) return false
      const createdDate = new Date(r.createdAt)
      const diffTime = Math.abs(new Date().getTime() - createdDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays <= 7
    }).length
  }, [statsRequests])

  const columns = useMemo<ColumnDef<RestaurantRequest>[]>(
    () => [
      {
        header: "Restaurant Name",
        accessorKey: "restaurantName",
        sortable: true,
        className: "font-semibold text-foreground",
      },
      {
        header: "Contact Person",
        accessorKey: "name",
        sortable: true,
      },
      {
        header: "Contact Details",
        accessorKey: "email",
        cell: ({ row: req }) => (
          <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <IconMail className="size-3" /> {req.email}
            </span>
            <span className="flex items-center gap-1">
              <IconPhone className="size-3" /> {req.phone}
            </span>
          </div>
        ),
      },
      {
        header: "Location",
        accessorKey: "city",
        sortable: true,
        cell: ({ row: req }) => {
          if (req.city || req.state) {
            return (
              <span className="inline-flex items-center gap-1 text-xs">
                <IconMapPin className="size-3 text-muted-foreground" />
                {[req.city, req.state].filter(Boolean).join(", ")}
              </span>
            )
          }
          return (
            <span className="text-xs text-muted-foreground">Not specified</span>
          )
        },
      },
      {
        header: "Date & Time",
        accessorKey: "createdAt",
        sortable: true,
        cell: ({ row: req }) => (
          <div className="flex flex-col text-xs text-muted-foreground">
            <span>{getTimeAgo(req.createdAt, timeTrigger)}</span>
            <span className="text-[10px] opacity-75">
              {formatDateTime(req.createdAt)}
            </span>
          </div>
        ),
      },
      {
        header: "Status",
        accessorKey: "status",
        sortable: true,
        cell: ({ row: req }) => {
          const currentStatus =
            req.status || RestaurantRequestStatus.WAITING_FOR_CALL
          const statusInfo =
            STATUS_STYLES[currentStatus] ||
            STATUS_STYLES[RestaurantRequestStatus.WAITING_FOR_CALL]

          const handleStatusChange = async (
            newStatus: RestaurantRequestStatus | null
          ) => {
            if (!newStatus) return
            try {
              await updateStatus({
                id: req?.id ?? req._id,
                status: newStatus,
              })
              toast.success("Status updated successfully.")
            } catch (err) {
              toast.error("Failed to update status.")
            }
          }

          return (
            <Select value={currentStatus} onValueChange={handleStatusChange}>
              <SelectTrigger
                className={cn(
                  "flex h-6 w-fit min-w-[130px] cursor-pointer items-center justify-between rounded-md border-0 px-2 text-xs font-medium shadow-none hover:bg-muted/50",
                  statusInfo.badgeClass
                )}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="min-w-[150px] rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md">
                {Object.entries(STATUS_STYLES).map(([value, info]) => (
                  <SelectItem
                    key={value}
                    value={value}
                    className="flex cursor-pointer items-center rounded-sm px-2.5 py-1 text-xs hover:bg-accent hover:text-accent-foreground"
                  >
                    <span
                      className={cn(
                        "mr-2 inline-block h-2.5 w-2.5 shrink-0 rounded-full",
                        info.dotClass
                      )}
                    />
                    {info.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        },
      },
      {
        header: "Actions",
        className: "text-right",
        cell: ({ row: req }) => (
          <div className="flex items-center justify-end gap-1">
            {req.message && (
              <Dialog>
                <DialogTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="View Message"
                    >
                      <IconFileText
                        className="size-4 text-muted-foreground"
                        stroke={1.75}
                      />
                    </Button>
                  }
                />
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Requester Message</DialogTitle>
                    <DialogDescription>
                      Additional comments submitted by {req.name} from{" "}
                      {req.restaurantName}.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="rounded-lg bg-muted p-4 text-sm leading-relaxed text-foreground">
                    {req.message}
                  </div>
                  <DialogFooter>
                    <DialogClose
                      render={<Button variant="secondary">Close</Button>}
                    />
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            <EditRequestDialog request={req} />

            <DeleteConfirmDialog
              itemName={req.restaurantName}
              title="Delete Request"
              onConfirm={async () => {
                try {
                  await deleteRequest(req._id)
                  toast.success("Request deleted successfully.")
                } catch (err) {
                  toast.error("Failed to delete request.")
                }
              }}
              trigger={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Delete Request"
                  className="text-destructive hover:bg-destructive/10"
                >
                  <IconTrash className="size-4" stroke={1.75} />
                </Button>
              }
            />
          </div>
        ),
      },
    ],
    [deleteRequest, updateStatus, timeTrigger]
  )

  const totalPages = paginationMeta ? Math.ceil(paginationMeta.total / limit) : 1

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {APP_NAME} Requests
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage incoming early access requests and restaurant signups.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Refresh list"
            onClick={() => refetch()}
          >
            <IconRefresh
              className={`size-4 ${isLoading ? "animate-spin" : ""}`}
              stroke={1.75}
            />
          </Button>
          <CreateRequestDialog />
        </div>
      </div>

      <Separator />

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Requests
            </CardTitle>
            <IconListDetails className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-12" /> : totalRequests}
            </div>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              All time submissions
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Submissions
            </CardTitle>
            <IconCalendar className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                recentRequestsCount
              )}
            </div>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              Submitted in the last 7 days
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Cities Represented
            </CardTitle>
            <IconMapPin className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-12" /> : uniqueCities}
            </div>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              Geographical distribution
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar / Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-sm">
            <IconSearch
              className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
              stroke={1.75}
            />
            <Input
              placeholder="Search by restaurant name, email or city…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="tabular-nums">
              {paginationMeta?.total || 0} request{paginationMeta?.total !== 1 ? "s" : ""}
            </Badge>
          </div>
        </div>

        {/* Status filter pills */}
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTER_OPTIONS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={cn(
                "rounded-full px-3 py-1 text-[11px] font-medium transition-all duration-150",
                statusFilter === value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {isError && (
        <ErrorMsg message="Failed to load restaurant requests. Please check your connection and try again." />
      )}

      {/* Table Section */}
      <DataTable
        columns={columns}
        data={requests}
        loading={isLoading}
        searchable={false}
        pagination={false}
        emptyState={
          <div className="flex flex-col items-center gap-2 py-6">
            <IconBuildingStore className="size-8 opacity-30" stroke={1.25} />
            <p className="text-xs">
              {search || statusFilter !== "ALL"
                ? "No requests match your filters."
                : "No early access requests yet."}
            </p>
          </div>
        }
      />

      {/* Pagination component */}
      {paginationMeta && requests.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          pageSize={limit}
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
