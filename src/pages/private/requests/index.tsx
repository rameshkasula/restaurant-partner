import { useState } from "react"
import { useRequests, useDeleteRequest, useUpdateRequestStatus } from "@/hooks/useRequests"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
  IconSearch,
  IconRefresh,
  IconTrash,
  IconCalendar,
  IconPhone,
  IconMail,
  IconMapPin,
  IconFileText,
  IconListDetails,
} from "@tabler/icons-react"
import { toast } from "sonner"
import { APP_NAME } from "@/utils/constants"

import { EditRequestDialog, CreateRequestDialog } from "./CreateEditRequests"
import { ErrorMsg } from "@/components/ErrorMsg"
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog"
import { cn } from "@/lib/utils"
import { RestaurantRequestStatus } from "@/api/requests.api"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export { RestaurantRequestStatus }

const STATUS_STYLES = {
  [RestaurantRequestStatus.WAITING_FOR_CALL]: {
    label: "Waiting for Call",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-900/40",
    dotClass: "bg-amber-500",
  },
  [RestaurantRequestStatus.CONTACTED]: {
    label: "Contacted",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900/40",
    dotClass: "bg-emerald-500",
  },
  [RestaurantRequestStatus.DECLINED]: {
    label: "Declined",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/20 dark:text-rose-300 dark:border-rose-900/40",
    dotClass: "bg-rose-500",
  },
}

// ─── Format Date Helper ──────────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function Requests() {
  const { data: requests = [], isLoading, isError, refetch } = useRequests()
  const { mutateAsync: deleteRequest } = useDeleteRequest()
  const { mutateAsync: updateStatus } = useUpdateRequestStatus()
  const [search, setSearch] = useState("")

  // Filter requests safely by name, email, restaurantName, or city
  const filtered = requests.filter((r) => {
    const q = search.toLowerCase()
    return (
      (r.restaurantName?.toLowerCase() || "").includes(q) ||
      (r.name?.toLowerCase() || "").includes(q) ||
      (r.email?.toLowerCase() || "").includes(q) ||
      (r.city?.toLowerCase() || "").includes(q)
    )
  })

  // Calculations for Stats Card
  const totalRequests = requests.length
  const uniqueCities = Array.from(
    new Set(requests.map((r) => r.city).filter(Boolean))
  ).length
  const recentRequestsCount = requests.filter((r) => {
    const createdDate = new Date(r.createdAt)
    const diffTime = Math.abs(new Date().getTime() - createdDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7
  }).length

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

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <IconSearch
            className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
            stroke={1.75}
          />
          <Input
            placeholder="Search requests…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="tabular-nums">
            {filtered.length} request{filtered.length !== 1 ? "s" : ""}
          </Badge>
          <CreateRequestDialog />
        </div>
      </div>

      {/* Error State */}
      {isError && (
        <ErrorMsg message="Failed to load restaurant requests. Please check your connection and try again." />
      )}

      {/* Table Card */}
      <Card className="shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Restaurant Name</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Contact Details</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-36" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-24 rounded-md" />
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <Skeleton className="ml-auto h-8 w-16" />
                  </TableCell>
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-12 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center gap-2">
                    <IconBuildingStore
                      className="size-8 opacity-30"
                      stroke={1.25}
                    />
                    <p className="text-xs">
                      {search
                        ? "No requests match your search criteria."
                        : "No early access requests yet."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((req) => {
                const currentStatus = req.status || RestaurantRequestStatus.WAITING_FOR_CALL
                const statusInfo = STATUS_STYLES[currentStatus] || STATUS_STYLES[RestaurantRequestStatus.WAITING_FOR_CALL]

                const handleStatusChange = async (newStatus: RestaurantRequestStatus | null) => {
                  if (!newStatus) return
                  try {
                    await updateStatus({
                      id: req._id,
                      status: newStatus,
                    })
                    toast.success("Status updated successfully.")
                  } catch (err) {
                    toast.error("Failed to update status.")
                  }
                }

                return (
                  <TableRow key={req._id}>
                    <TableCell className="font-semibold text-foreground">
                      {req.restaurantName}
                    </TableCell>
                    <TableCell>{req.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <IconMail className="size-3" /> {req.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <IconPhone className="size-3" /> {req.phone}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {req.city || req.state ? (
                        <span className="inline-flex items-center gap-1 text-xs">
                          <IconMapPin className="size-3 text-muted-foreground" />
                          {[req.city, req.state].filter(Boolean).join(", ")}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Not specified
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(req.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Select value={currentStatus} onValueChange={handleStatusChange}>
                        <SelectTrigger className={cn("h-6 rounded-md px-2 font-medium shadow-none hover:bg-muted/50 border-0 flex items-center justify-between min-w-[130px] w-fit text-xs cursor-pointer", statusInfo.badgeClass)}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover text-popover-foreground border border-border shadow-md rounded-md p-1 min-w-[150px]">
                          {Object.entries(STATUS_STYLES).map(([value, info]) => (
                            <SelectItem key={value} value={value} className="cursor-pointer hover:bg-accent hover:text-accent-foreground py-1 px-2.5 rounded-sm flex items-center text-xs">
                              <span className={cn("inline-block w-2.5 h-2.5 rounded-full mr-2 shrink-0", info.dotClass)} />
                              {info.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="pr-4 text-right">
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
                                  render={
                                    <Button variant="secondary">Close</Button>
                                  }
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
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
