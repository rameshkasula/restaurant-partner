import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DataTable, type ColumnDef } from "@/components/DataTable/DataTable"
import { Pagination } from "@/components/DataTable/Pagination"

import {
  IconTrash,
  IconRefresh,
  IconUsers,
  IconLoader2,
  IconSearch,
  IconShieldCheck,
  IconBuildingStore,
  IconMapPin,
  IconCircleCheck,
  IconCircleX,
} from "@tabler/icons-react"
import { toast } from "sonner"
import { ErrorMsg } from "@/components/ErrorMsg"
import { cn } from "@/lib/utils"
import { UserRole, USER_ROLE_LABELS, UserStatus } from "@/api/users.api"
import { useUsers, useDeleteUser, useRestoreUser, useUpdateUserStatus } from "@/hooks/useUsers"
import { useOrganizations } from "@/hooks/useOrganizations"
import { useOutlets } from "@/hooks/useOutlets"
import { CreateUserDialog, EditUserDialog } from "./CreateEditUser"
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getIdString } from "@/utils/formatters"


export { UserStatus }

const USER_STATUS_STYLES = {
  [UserStatus.ACTIVE]: {
    label: "Active",
    badgeClass: "bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900/40",
    dotClass: "bg-emerald-500",
  },
  [UserStatus.ON_HOLD]: {
    label: "On Hold",
    badgeClass: "bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-900/40",
    dotClass: "bg-amber-500",
  },
  [UserStatus.INACTIVE]: {
    label: "Inactive",
    badgeClass: "bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-950/20 dark:text-rose-300 dark:border-rose-900/40",
    dotClass: "bg-rose-500",
  },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

// Role badge color mapping
const ROLE_COLORS: Record<string, string> = {
  [UserRole.SUPER_ADMIN]:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  [UserRole.PLATFORM_MANAGER]:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  [UserRole.RESTAURANT_OWNER]:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  [UserRole.MANAGER]:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  [UserRole.POS_STAFF]:
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  [UserRole.KITCHEN_STAFF]:
    "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        ROLE_COLORS[role] ?? "bg-muted text-muted-foreground"
      )}
    >
      <IconShieldCheck className="size-2.5" stroke={2} />
      {USER_ROLE_LABELS[role as UserRole] ?? role}
    </span>
  )
}

function StatusBadge({ isDeleted }: { isDeleted: boolean }) {
  return isDeleted ? (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
      <IconCircleX className="size-2.5" stroke={2} />
      Deleted
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
      <IconCircleCheck className="size-2.5" stroke={2} />
      Active
    </span>
  )
}


// ── Role filter pills ─────────────────────────────────────────────────────────

const ROLE_FILTER_OPTIONS: Array<{ label: string; value: UserRole | "ALL" }> = [
  { label: "All Roles", value: "ALL" },
  { label: "Super Admin", value: UserRole.SUPER_ADMIN },
  { label: "Platform Mgr", value: UserRole.PLATFORM_MANAGER },
  { label: "Owner", value: UserRole.RESTAURANT_OWNER },
  { label: "Manager", value: UserRole.MANAGER },
  { label: "POS Staff", value: UserRole.POS_STAFF },
  { label: "Kitchen", value: UserRole.KITCHEN_STAFF },
]

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Users() {
  const [search, setSearch] = useState("")
  const [showDeleted, setShowDeleted] = useState(false)
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL")

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  // ── Data ──────────────────────────────────────────────────────────────────
  const {
    data: paginatedData,
    isLoading,
    isError,
    refetch,
  } = useUsers(showDeleted, page, limit)

  // Fetch all users in the background to calculate stats (total, active, deleted)
  const { data: allUsers = [] } = useUsers(showDeleted)

  const users = paginatedData?.data || []
  const paginationMeta = paginatedData?.pagination

  React.useEffect(() => {
    setPage(1)
  }, [showDeleted, roleFilter, search])

  const { data: orgs = [] } = useOrganizations()
  const { data: outlets = [] } = useOutlets()

  const deleteMutation = useDeleteUser()
  const restoreMutation = useRestoreUser()
  const updateStatusMutation = useUpdateUserStatus()

  // Quick lookup maps for display
  const orgMap = React.useMemo(() => {
    const m: Record<string, string> = {}
    orgs.forEach((o) => {
      const id = getIdString(o._id || o.id)
      m[id] = o.name
    })
    return m
  }, [orgs])

  const outletMap = React.useMemo(() => {
    const m: Record<string, string> = {}
    outlets.forEach((o) => {
      const id = getIdString(o._id || o.id)
      m[id] = o.name
    })
    return m
  }, [outlets])

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filtered = users.filter((u) => {
    const lq = search.toLowerCase()
    const matchesSearch =
      (u.email?.toLowerCase() ?? "").includes(lq) ||
      (u.organizationId
        ? (orgMap[getIdString(u.organizationId)]?.toLowerCase() ?? "").includes(lq)
        : false) ||
      (u.outletId
        ? (outletMap[getIdString(u.outletId)]?.toLowerCase() ?? "").includes(lq)
        : false) ||
      (u.role?.toLowerCase() ?? "").includes(lq)
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  // Map user data for search & lookup in DataTable
  const displayedUsers = React.useMemo(() => {
    return filtered.map((u) => {
      const orgName = u.organizationId ? (orgMap[getIdString(u.organizationId)] ?? "—") : "—"
      const outletName = u.outletId ? (outletMap[getIdString(u.outletId)] ?? "—") : "—"
      return {
        ...u,
        orgName,
        outletName,
      }
    })
  }, [filtered, orgMap, outletMap])

  // ── Columns for DataTable ──────────────────────────────────────────────
  const columns = React.useMemo<ColumnDef<any>[]>(
    () => [
      {
        header: "User",
        accessorKey: "email",
        sortable: true,
        cell: ({ row: user }) => (
          <span className="text-sm font-medium text-foreground">
            {user.email}
          </span>
        ),
      },
      {
        header: "Role",
        accessorKey: "role",
        sortable: true,
        cell: ({ row: user }) => <RoleBadge role={user.role} />,
      },
      {
        header: "Organization",
        accessorKey: "orgName",
        sortable: true,
        cell: ({ row: user }) => {
          const orgName = user.orgName !== "—" ? user.orgName : null
          if (orgName) {
            return (
              <span className="flex items-center gap-1 text-xs">
                <IconBuildingStore
                  className="size-3.5 shrink-0 text-muted-foreground"
                  stroke={1.75}
                />
                <span className="max-w-[140px] truncate" title={orgName}>
                  {orgName}
                </span>
              </span>
            )
          }
          return <span className="text-xs italic text-muted-foreground">—</span>
        },
      },
      {
        header: "Outlet",
        accessorKey: "outletName",
        sortable: true,
        cell: ({ row: user }) => {
          const outletName = user.outletName !== "—" ? user.outletName : null
          if (outletName) {
            return (
              <span className="flex items-center gap-1 text-xs">
                <IconMapPin
                  className="size-3.5 shrink-0 text-muted-foreground"
                  stroke={1.75}
                />
                <span className="max-w-[140px] truncate" title={outletName}>
                  {outletName}
                </span>
              </span>
            )
          }
          return <span className="text-xs italic text-muted-foreground">—</span>
        },
      },
      {
        header: "Status",
        accessorKey: "status",
        sortable: true,
        cell: ({ row: user }) => {
          const userId = user._id || user.id || ""
          const deleted = user.isDeleted
          if (deleted) {
            return <StatusBadge isDeleted={true} />
          }

          const currentStatus = (user.status || UserStatus.ACTIVE) as UserStatus
          const statusInfo =
            USER_STATUS_STYLES[currentStatus] || USER_STATUS_STYLES[UserStatus.ACTIVE]

          const handleStatusChange = async (newStatus: any) => {
            if (!newStatus) return
            try {
              await updateStatusMutation.mutateAsync({
                id: userId,
                status: newStatus,
              })
              toast.success("User status updated successfully.")
            } catch {
              toast.error("Failed to update user status.")
            }
          }

          return (
            <Select value={currentStatus} onValueChange={handleStatusChange}>
              <SelectTrigger
                className={cn(
                  "h-6 rounded-md px-2 font-medium shadow-none hover:bg-muted/50 border-0 flex items-center justify-between min-w-[110px] w-fit text-xs cursor-pointer",
                  statusInfo.badgeClass
                )}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground border border-border shadow-md rounded-md p-1 min-w-[130px]">
                {Object.entries(USER_STATUS_STYLES).map(([value, info]) => (
                  <SelectItem
                    key={value}
                    value={value}
                    className="cursor-pointer hover:bg-accent hover:text-accent-foreground py-1 px-2.5 rounded-sm flex items-center text-xs"
                  >
                    <span
                      className={cn("inline-block w-2.5 h-2.5 rounded-full mr-2 shrink-0", info.dotClass)}
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
        header: "Created At",
        accessorKey: "createdAt",
        sortable: true,
        cell: ({ row: user }) => (
          <span className="text-xs text-muted-foreground">
            {formatDate(user.createdAt)}
          </span>
        ),
      },
      {
        header: "Actions",
        className: "text-right pr-4",
        cell: ({ row: user }) => {
          const userId = user._id || user.id || ""
          const deleted = user.isDeleted
          return (
            <div className="flex items-center justify-end gap-1">
              {deleted ? (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Restore user"
                  disabled={restoreMutation.isPending}
                  onClick={() => restoreMutation.mutate(userId)}
                >
                  {restoreMutation.isPending ? (
                    <IconLoader2
                      className="size-3.5 animate-spin"
                      stroke={2}
                    />
                  ) : (
                    <IconRefresh className="size-3.5" stroke={1.75} />
                  )}
                </Button>
              ) : (
                <>
                  <EditUserDialog user={user} orgs={orgs} outlets={outlets} />
                  <DeleteConfirmDialog
                    title="Delete User"
                    itemName={user.email}
                    description={`Are you sure you want to soft-delete "${user.email}"? You can restore them later.`}
                    onConfirm={async () => {
                      try {
                        await deleteMutation.mutateAsync(userId)
                        toast.success("User deleted successfully.")
                      } catch {
                        toast.error("Failed to delete user.")
                      }
                    }}
                    trigger={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Delete ${user.email}`}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <IconTrash className="size-3.5" stroke={1.75} />
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
    [orgMap, outletMap, orgs, outlets, restoreMutation.isPending, updateStatusMutation, deleteMutation]
  )

  // ── Stats ─────────────────────────────────────────────────────────────────
  const activeCount = allUsers.filter((u) => !u.isDeleted).length
  const deletedCount = allUsers.filter((u) => u.isDeleted).length
  const totalUsersCount = allUsers.length

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Users</h1>
          <p className="text-xs text-muted-foreground">
            Manage platform and restaurant staff accounts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Refresh"
            onClick={() => refetch()}
          >
            <IconRefresh
              className={cn("size-4", isLoading && "animate-spin")}
              stroke={1.75}
            />
          </Button>
          <CreateUserDialog orgs={orgs} outlets={outlets} />
        </div>
      </div>

      <Separator />

      {/* ── Stats ── */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs">
          <IconCircleCheck className="size-3.5 text-emerald-500" stroke={2} />
          <span className="text-muted-foreground">Active:</span>
          <span className="font-semibold tabular-nums text-foreground">{activeCount}</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs">
          <IconCircleX className="size-3.5 text-rose-500" stroke={2} />
          <span className="text-muted-foreground">Deleted:</span>
          <span className="font-semibold tabular-nums text-foreground">{deletedCount}</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs">
          <IconUsers className="size-3.5 text-muted-foreground" stroke={1.75} />
          <span className="text-muted-foreground">Total:</span>
          <span className="font-semibold tabular-nums text-foreground">{totalUsersCount}</span>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-3">
        {/* Search + toggle */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-sm">
            <IconSearch
              className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
              stroke={1.75}
            />
            <Input
              placeholder="Search by email, role, org or outlet…"
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
              {filtered.length} user{filtered.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </div>

        {/* Role filter pills */}
        <div className="flex flex-wrap gap-1.5">
          {ROLE_FILTER_OPTIONS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setRoleFilter(value)}
              className={cn(
                "rounded-full px-3 py-1 text-[11px] font-medium transition-all duration-150",
                roleFilter === value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Error ── */}
      {isError && (
        <ErrorMsg message="Failed to load users. Check your network and try again." />
      )}

      {/* ── Table ── */}
      <DataTable
        columns={columns}
        data={displayedUsers}
        loading={isLoading}
        searchable={false}
        pagination={false}
        emptyState={
          <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
            <IconUsers className="size-9 opacity-25" stroke={1.25} />
            <p className="text-xs">
              {search || roleFilter !== "ALL"
                ? "No users match your filters."
                : "No users yet."}
            </p>
            {!search && roleFilter === "ALL" && (
              <CreateUserDialog orgs={orgs} outlets={outlets} />
            )}
          </div>
        }
      />

      {paginationMeta && displayedUsers.length > 0 && (
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
