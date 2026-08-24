import { useMemo, useState } from "react"
import {
  useOutlets,
  useUpdateOutletStatus,
  useDeleteOutlet,
  useRestoreOutlet,
} from "@/hooks/useOutlets"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  IconBuildingStore,
  IconRefresh,
  IconTrash,
  IconDoorExit,
  IconListDetails,
  IconMapPin,
  IconDeviceMobile,
} from "@tabler/icons-react"
import { toast } from "sonner"
import { CreateOutletDialog, EditOutletDialog } from "./CreateEditOutlet"
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog"
import { DataTable, type ColumnDef } from "@/components/DataTable/DataTable"
import { cn } from "@/lib/utils"
import { Pagination } from "@/components/DataTable/Pagination"
import { ErrorMsg } from "@/components/ErrorMsg"
import { StatusBadge } from "@/components/StatusBadge"
import { StatusSelect } from "@/components/StatusSelect"
import { formatDateTime } from "@/utils/formatters"

export default function Outlets() {
  // ── Pagination State ──────────────────────────────────────────────────
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  // ── Hooks / Queries ───────────────────────────────────────────────────
  const {
    data: paginatedData,
    isLoading: outletsLoading,
    isError: outletsError,
    refetch: refetchOutlets,
  } = useOutlets(true, page, limit)

  // Background query for stats calculations
  const { data: allOutletsForStats = [] } = useOutlets(true)

  const allOutlets = useMemo(() => paginatedData?.data || [], [paginatedData])
  const paginationMeta = useMemo(
    () => paginatedData?.pagination,
    [paginatedData]
  )

  // ── Hooks / Mutations ─────────────────────────────────────────────────
  const deleteMutation = useDeleteOutlet()
  const restoreMutation = useRestoreOutlet()
  const updateStatusMutation = useUpdateOutletStatus()

  // ── Filtered Outlets (No deleted outlets, no deleted organizations) ─────
  const displayedOutlets = useMemo(() => {
    return allOutlets
      .filter((outlet) => {
        if (!outlet) return false

        // 1. Do not show deleted outlets
        if (outlet.isDeleted || outlet.deletedAt) {
          return false
        }

        // 2. Check linked organization
        const orgObj =
          typeof outlet.organizationId === "object" &&
          outlet.organizationId !== null
            ? outlet.organizationId
            : null

        // Do not show if the linked organization is deleted
        if (orgObj && (orgObj.isDeleted || orgObj.status === "deleted")) {
          return false
        }

        return true
      })
      .map((outlet) => {
        const orgObj =
          typeof outlet.organizationId === "object" &&
          outlet.organizationId !== null
            ? outlet.organizationId
            : null
        const orgName = orgObj ? orgObj.name : "Standalone"
        return {
          ...outlet,
          orgName,
        }
      })
  }, [allOutlets])

  // ── Filtered Outlets for Stats ──────────────────────────────────────────
  const displayedOutletsForStats = useMemo(() => {
    return allOutletsForStats.filter((outlet) => {
      if (!outlet) return false
      if (outlet.isDeleted || outlet.deletedAt) return false
      const orgObj =
        typeof outlet.organizationId === "object" &&
        outlet.organizationId !== null
          ? outlet.organizationId
          : null
      if (orgObj && (orgObj.isDeleted || orgObj.status === "deleted")) {
        return false
      }
      return true
    })
  }, [allOutletsForStats])

  // ── Stats ──────────────────────────────────────────────────────────────
  const totalOutlets = displayedOutletsForStats.length
  const activeOutlets = displayedOutletsForStats.filter(
    (o) => o.status === "active"
  ).length
  const inactiveOrOnHold = displayedOutletsForStats.filter(
    (o) => o.status !== "active"
  ).length

  // ── Columns for DataTable ──────────────────────────────────────────────
  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        header: "Outlet Name",
        accessorKey: "name",
        sortable: true,
        cell: ({ row: outlet }) => (
          <div className="flex flex-col gap-1.5 font-semibold text-foreground">
            <span>{outlet.name || "Unnamed Outlet"}</span>
            {outlet.isCustomerapp && (
              <Badge
                variant="default"
                className="flex h-4 w-fit items-center gap-0.5 border-0 bg-blue-500 px-1 text-[9px] font-medium text-white uppercase"
              >
                <IconDeviceMobile className="size-2.5" />
                <span>Customer App</span>
              </Badge>
            )}
          </div>
        ),
      },
      {
        header: "Linked Organization",
        accessorKey: "orgName",
        sortable: true,
        cell: ({ row: outlet }) => {
          const orgObj =
            typeof outlet.organizationId === "object" &&
            outlet.organizationId !== null
              ? outlet.organizationId
              : null
          const linkedOrgName = orgObj ? orgObj.name : null

          if (linkedOrgName) {
            return (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
                <IconBuildingStore className="size-3.5 text-muted-foreground" />
                {linkedOrgName}
              </span>
            )
          }
          return (
            <span className="text-xs text-muted-foreground italic">
              None (Standalone)
            </span>
          )
        },
      },
      {
        header: "Address & Tax Details",
        accessorKey: "address",
        cell: ({ row: outlet }) => (
          <div className="flex max-w-xs flex-col gap-1 text-xs text-muted-foreground">
            <span className="flex items-start gap-1">
              <IconMapPin className="mt-0.5 size-3.5 shrink-0" />
              <span className="line-clamp-2" title={outlet.address}>
                {outlet.address || "No address provided"}
              </span>
            </span>
            <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] opacity-85">
              {outlet.gstin && <span>GSTIN: {outlet.gstin}</span>}
              {outlet.pan && <span>PAN: {outlet.pan}</span>}
              {outlet.isTaxRequired ? (
                <Badge
                  variant="outline"
                  className="h-4 border-emerald-500/40 bg-emerald-500/5 px-1 py-0 font-sans text-[9px] font-semibold text-emerald-600 dark:text-emerald-400"
                >
                  Tax: {outlet.taxPercentage ?? 5}%
                </Badge>
              ) : (
                <span className="font-sans text-muted-foreground/70">
                  No Tax Req.
                </span>
              )}
            </div>
          </div>
        ),
      },
      {
        header: "Created At",
        accessorKey: "createdAt",
        sortable: true,
        cell: ({ row: outlet }) => (
          <span className="text-xs text-muted-foreground">
            {outlet.createdAt ? formatDateTime(outlet.createdAt) : "—"}
          </span>
        ),
      },
      {
        header: "Status",
        accessorKey: "status",
        sortable: true,
        cell: ({ row: outlet }) => {
          const deleted = !!outlet.deletedAt || !!outlet.isDeleted
          if (deleted) {
            return <StatusBadge deleted={true} status={outlet.status} />
          }
          return (
            <StatusSelect
              value={outlet.status}
              disabled={updateStatusMutation.isPending}
              onChange={(newStatus) => {
                updateStatusMutation.mutate(
                  { id: outlet._id || outlet.id, status: newStatus },
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
            />
          )
        },
      },
      {
        header: "Actions",
        className: "text-right pr-4",
        cell: ({ row: outlet }) => {
          const deleted = !!outlet.deletedAt || !!outlet.isDeleted
          const outletId = outlet._id || outlet.id
          return (
            <div className="flex items-center justify-end gap-1">
              {deleted ? (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Restore Outlet"
                  disabled={restoreMutation.isPending}
                  onClick={() =>
                    restoreMutation.mutate(outletId, {
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
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
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
                        await deleteMutation.mutateAsync(outletId)
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
          )
        },
      },
    ],
    [updateStatusMutation, restoreMutation, deleteMutation]
  )

  const emptyState = (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-muted-foreground">
      <IconDoorExit className="size-8 opacity-30" stroke={1.25} />
      <p className="text-xs font-semibold">No active outlets found</p>
      <p className="text-[10px] text-muted-foreground/70">
        Create a new outlet using the button above to get started.
      </p>
    </div>
  )

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
              {outletsLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                totalOutlets
              )}
            </div>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              All active registered locations
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Active Outlets
            </CardTitle>
            <IconListDetails className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {outletsLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                activeOutlets
              )}
            </div>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              Operational locations
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Inactive / On Hold
            </CardTitle>
            <IconTrash className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {outletsLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                inactiveOrOnHold
              )}
            </div>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              Non-active operational locations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Error State */}
      {outletsError && (
        <ErrorMsg message="Failed to load outlets. Please check your connection and try again." />
      )}

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={displayedOutlets}
        loading={outletsLoading}
        searchable={true}
        searchableKeys={[
          "name",
          "address",
          "orgName",
          "gstin",
          "pan",
          "status",
        ]}
        searchPlaceholder="Search outlets, addresses, orgs…"
        pagination={false}
        title={
          <div className="flex items-center gap-2 text-sm font-semibold">
            <IconBuildingStore className="size-4" />
            Registered Outlets
          </div>
        }
        emptyState={emptyState}
      />

      {paginationMeta && displayedOutlets.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={paginationMeta.totalPages}
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
