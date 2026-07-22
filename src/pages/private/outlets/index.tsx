import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { orgApi } from "@/api/organizations.api"
import {
  useOutlets,
  useUpdateOutletStatus,
  useDeleteOutlet,
  useRestoreOutlet,
} from "@/hooks/useOutlets"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import {
  IconBuildingStore,
  IconSearch,
  IconRefresh,
  IconTrash,
  IconDoorExit,
  IconAlertCircle,
  IconListDetails,
  IconMapPin,
  IconDeviceMobile,
} from "@tabler/icons-react"
import { toast } from "sonner"
import { CreateOutletDialog, EditOutletDialog } from "./CreateEditOutlet"
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog"
import { cn } from "@/lib/utils"

function ErrorMsg({ message }: { message: string }) {
  return (
    <Alert variant="destructive" className="my-2">
      <IconAlertCircle className="size-4" stroke={2} />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function StatusBadge({ deleted, status }: { deleted: boolean; status: string }) {
  if (deleted) {
    return <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider">Deleted</Badge>
  }
  
  const normalizedStatus = status?.toLowerCase() || "active"
  
  switch (normalizedStatus) {
    case "active":
      return (
        <Badge variant="outline" className="border-emerald-500/35 text-emerald-600 bg-emerald-500/5 dark:text-emerald-400 dark:bg-emerald-500/10 text-[10px] uppercase font-bold tracking-wider">
          Active
        </Badge>
      )
    case "inactive":
      return (
        <Badge variant="destructive" className="text-[10px] uppercase font-bold tracking-wider">
          Inactive
        </Badge>
      )
    case "on hold":
      return (
        <Badge variant="outline" className="border-amber-500/35 text-amber-600 bg-amber-500/5 dark:text-amber-400 dark:bg-amber-500/10 text-[10px] uppercase font-bold tracking-wider">
          On Hold
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">
          {status}
        </Badge>
      )
  }
}

export default function Outlets() {
  const [search, setSearch] = useState("")
  const [showDeleted, setShowDeleted] = useState(false)

  // ── Hooks / Queries ───────────────────────────────────────────────────
  const {
    data: allOutlets = [],
    isLoading: outletsLoading,
    isError: outletsError,
    refetch: refetchOutlets,
  } = useOutlets()

  const { data: orgs = [] } = useQuery({
    queryKey: ["organizations"],
    queryFn: orgApi.list,
  })

  // ── Hooks / Mutations ─────────────────────────────────────────────────
  const deleteMutation = useDeleteOutlet()
  const restoreMutation = useRestoreOutlet()
  const updateStatusMutation = useUpdateOutletStatus()

  // Create a map for organization ID -> Organization Name for fast lookup
  const orgMap = orgs.reduce((acc, org) => {
    acc[org.id] = org.name
    return acc
  }, {} as Record<string, string>)

  // ── Filtered Outlets ───────────────────────────────────────────────────
  const filtered = allOutlets.filter((outlet) => {
    const orgName = outlet.organizationId ? orgMap[outlet.organizationId] || "" : "Standalone"
    const matchesSearch =
      (outlet.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (outlet.address?.toLowerCase() || "").includes(search.toLowerCase()) ||
      orgName.toLowerCase().includes(search.toLowerCase())
    const matchesDeleted = showDeleted ? true : !outlet.deletedAt
    return matchesSearch && matchesDeleted
  })

  // ── Stats ──────────────────────────────────────────────────────────────
  const totalOutlets = allOutlets.length
  const activeOutlets = allOutlets.filter((o) => !o.deletedAt && o.status === "active").length
  const inactiveOrOnHold = allOutlets.filter((o) => !o.deletedAt && o.status !== "active").length

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Outlets</h1>
          <p className="text-xs text-muted-foreground">
            Manage restaurant outlets and link them to organizations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Refresh list"
            onClick={() => refetchOutlets()}
          >
            <IconRefresh
              className={cn("size-4", outletsLoading && "animate-spin")}
              stroke={1.75}
            />
          </Button>
          <CreateOutletDialog />
        </div>
      </div>

      <Separator />

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Outlets</CardTitle>
            <IconBuildingStore className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {outletsLoading ? <Skeleton className="h-8 w-12" /> : totalOutlets}
            </div>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              All registered locations
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Outlets</CardTitle>
            <IconListDetails className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {outletsLoading ? <Skeleton className="h-8 w-12" /> : activeOutlets}
            </div>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              Operational locations
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Inactive / On Hold</CardTitle>
            <IconTrash className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {outletsLoading ? <Skeleton className="h-8 w-12" /> : inactiveOrOnHold}
            </div>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              Non-active operational locations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-xs">
          <IconSearch
            className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
            stroke={1.75}
          />
          <Input
            placeholder="Search outlets, addresses, orgs…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showDeleted ? "secondary" : "outline"}
            size="sm"
            onClick={() => setShowDeleted(!showDeleted)}
            className="gap-1.5 text-xs"
          >
            <IconTrash className="size-3.5" stroke={1.75} />
            {showDeleted ? "Hide Deleted" : "Show Deleted"}
          </Button>
          <Badge variant="outline" className="tabular-nums">
            {filtered.length} outlet{filtered.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      </div>

      {/* Error State */}
      {outletsError && (
        <ErrorMsg message="Failed to load outlets. Please check your connection and try again." />
      )}

      {/* Table Card */}
      <Card className="shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Outlet Name</TableHead>
              <TableHead>Linked Organization</TableHead>
              <TableHead>Address & Tax Details</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {outletsLoading ? (
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
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <Skeleton className="ml-auto h-8 w-16" />
                  </TableCell>
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-12 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center gap-2">
                    <IconDoorExit
                      className="size-8 opacity-30"
                      stroke={1.25}
                    />
                    <p className="text-xs">
                      {search
                        ? "No outlets match your search criteria."
                        : "No outlets created yet."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((outlet) => {
                const deleted = !!outlet.deletedAt
                const linkedOrgName = outlet.organizationId
                  ? orgMap[outlet.organizationId] || "Loading..."
                  : "Standalone (None)"

                return (
                  <TableRow key={outlet._id} className={cn(deleted && "opacity-60")}>
                    <TableCell className="font-semibold text-foreground">
                      <div className="flex flex-col gap-1.5">
                        <span>{outlet.name}</span>
                        {outlet.isCustomerapp && (
                          <Badge variant="default" className="text-[9px] h-4 px-1 w-fit bg-blue-500 text-white font-medium border-0 uppercase flex items-center gap-0.5">
                            <IconDeviceMobile className="size-2.5" />
                            <span>Customer App</span>
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {outlet.organizationId ? (
                        <span className="inline-flex items-center gap-1 text-xs">
                          <IconBuildingStore className="size-3.5 text-muted-foreground" />
                          {linkedOrgName}
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic text-xs">None (Standalone)</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-xs text-muted-foreground max-w-xs">
                        <span className="flex items-start gap-1">
                          <IconMapPin className="size-3.5 mt-0.5 shrink-0" />
                          <span className="line-clamp-2" title={outlet.address}>{outlet.address}</span>
                        </span>
                        {(outlet.gstin || outlet.pan) && (
                          <div className="flex gap-2 text-[10px] opacity-75 font-mono">
                            {outlet.gstin && <span>GSTIN: {outlet.gstin}</span>}
                            {outlet.pan && <span>PAN: {outlet.pan}</span>}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(outlet.createdAt)}
                    </TableCell>
                    <TableCell>
                      {deleted ? (
                        <StatusBadge deleted={true} status={outlet.status} />
                      ) : (
                        <NativeSelect
                          value={outlet.status}
                          onChange={(e) => {
                            const newStatus = e.target.value
                            updateStatusMutation.mutate(
                              { id: outlet._id, status: newStatus },
                              {
                                onSuccess: () => {
                                  toast.success("Outlet status updated successfully.")
                                },
                                onError: () => {
                                  toast.error("Failed to update status.")
                                },
                              }
                            )
                          }}
                          size="sm"
                          disabled={updateStatusMutation.isPending}
                          className={cn(
                            "w-[100px] h-7 text-[10px] uppercase font-bold tracking-wider rounded-none",
                            outlet.status === "active" && "border-emerald-500/35 text-emerald-600 bg-emerald-500/5 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500",
                            outlet.status === "inactive" && "border-destructive/35 text-destructive bg-destructive/5 focus-visible:ring-destructive/20 focus-visible:border-destructive",
                            outlet.status === "on hold" && "border-amber-500/35 text-amber-600 bg-amber-500/5 focus-visible:ring-amber-500/20 focus-visible:border-amber-500"
                          )}
                        >
                          <NativeSelectOption value="active">Active</NativeSelectOption>
                          <NativeSelectOption value="inactive">Inactive</NativeSelectOption>
                          <NativeSelectOption value="on hold">On Hold</NativeSelectOption>
                        </NativeSelect>
                      )}
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {deleted ? (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Restore Outlet"
                            disabled={restoreMutation.isPending}
                            onClick={() =>
                              restoreMutation.mutate(outlet._id, {
                                onSuccess: () => {
                                  toast.success("Outlet restored successfully.")
                                },
                                onError: () => {
                                  toast.error("Failed to restore outlet.")
                                },
                              })
                            }
                            className="hover:bg-primary/10 hover:text-primary"
                          >
                            {restoreMutation.isPending ? (
                              <span className="h-4 w-4 animate-spin border-2 border-primary border-t-transparent rounded-full" />
                            ) : (
                              <IconRefresh className="size-4" stroke={1.75} />
                            )}
                          </Button>
                        ) : (
                          <>
                            <EditOutletDialog outlet={outlet} />
                            <DeleteConfirmDialog
                              itemName={outlet.name}
                              title="Delete Outlet"
                              description={`Are you sure you want to soft-delete "${outlet.name}"? You can restore it later.`}
                              onConfirm={async () => {
                                try {
                                  await deleteMutation.mutateAsync(outlet._id)
                                  toast.success("Outlet deleted successfully.")
                                } catch (err) {
                                  toast.error("Failed to delete outlet.")
                                }
                              }}
                              trigger={
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-label="Delete Outlet"
                                  className="text-destructive hover:bg-destructive/10"
                                >
                                  <IconTrash className="size-4" stroke={1.75} />
                                </Button>
                              }
                            />
                          </>
                        )}
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
