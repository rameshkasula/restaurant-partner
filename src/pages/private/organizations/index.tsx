/* eslint-disable prettier/prettier */
import React, { useState, useCallback } from "react"

// ── Shadcn components ─────────────────────────────────────────────────────────
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
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

// ── Tabler icons ──────────────────────────────────────────────────────────────
import {
  IconTrash,
  IconRefresh,
  IconBuildingStore,
  IconLoader2,
  IconAlertCircle,
  IconSearch,
  IconChevronRight,
  IconDoorExit,
} from "@tabler/icons-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"


import { type Outlet } from "@/api/outlets.api"
import { useOutlets, useDeleteOutlet, useRestoreOutlet } from "@/hooks/useOutlets"
import {
  useOrganizations,
  useUpdateOrganizationStatus,
  useDeleteOrganization,
  useRestoreOrganization,
} from "@/hooks/useOrganizations"
import { CreateOrgDialog, EditOrgDialog } from "./CreateEditOrganization"
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog"

// ═══════════════════════════════════════════════════════════════════════════
// SMALL HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function ErrorMsg({ message }: { message: string }) {
  return (
    <Alert variant="destructive" className="my-2">
      <IconAlertCircle className="size-4" stroke={2} />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell />
          <TableCell>
            <Skeleton className="h-4 w-5/6" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-14" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16" />
          </TableCell>
          <TableCell className="text-right pr-2">
            <div className="flex justify-end gap-1">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-6 w-6" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// OUTLETS SUB-TABLE (shown inside expanded org row)
// ═══════════════════════════════════════════════════════════════════════════

function OrgOutlets({
  orgId,
  allOutlets,
}: {
  orgId: string
  allOutlets: Outlet[]
}) {
  const outlets = allOutlets.filter((o) => o.organizationId === orgId)

  const deleteMutation = useDeleteOutlet()
  const restoreMutation = useRestoreOutlet()

  if (outlets.length === 0) {
    return (
      <p className="flex items-center gap-1.5 py-3 pl-2 text-xs text-muted-foreground">
        <IconDoorExit className="size-3.5" stroke={1.5} />
        No outlets linked to this organization.
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="pl-2">Outlet Name</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="pr-2 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {outlets.map((outlet) => {
          const deleted = !!outlet.deletedAt
          return (
            <TableRow key={outlet._id} className={cn(deleted && "opacity-50")}>
              <TableCell className="pl-2 font-medium">{outlet.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(outlet.createdAt)}
              </TableCell>
              <TableCell>
                <Badge
                  variant={deleted ? "secondary" : "outline"}
                  className="text-[10px]"
                >
                  {deleted ? "Deleted" : (outlet.status || "active")}
                </Badge>
              </TableCell>
              <TableCell className="pr-2 text-right">
                <div className="flex items-center justify-end gap-1">
                  {deleted ? (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Restore outlet"
                      disabled={restoreMutation.isPending}
                      onClick={() => restoreMutation.mutate(outlet._id)}
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
                    <DeleteConfirmDialog
                      title="Delete Outlet"
                      itemName={outlet.name}
                      description={`Are you sure you want to soft-delete outlet "${outlet.name}"? You can restore it later.`}
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
                          aria-label={`Delete ${outlet.name}`}
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <IconTrash className="size-3.5" stroke={1.75} />
                        </Button>
                      }
                    />
                  )}
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════

export default function Organizations() {
  const [search, setSearch] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showDeleted, setShowDeleted] = useState(false)

  // ── Queries ────────────────────────────────────────────────────────────
  const {
    data: orgs = [],
    isLoading: orgsLoading,
    isError: orgsError,
    refetch: refetchOrgs,
  } = useOrganizations()

  const { data: allOutlets = [], isLoading: outletsLoading } = useOutlets()

  // ── Mutations ──────────────────────────────────────────────────────────
  const deleteMutation = useDeleteOrganization()
  const restoreMutation = useRestoreOrganization()
  const updateStatusMutation = useUpdateOrganizationStatus()

  // ── Filtered list ──────────────────────────────────────────────────────
  const filtered = orgs.filter((o) => {
    const matchesSearch = (o.name?.toLowerCase() || "").includes(
      search.toLowerCase()
    )
    const matchesDeleted = showDeleted ? true : !o.deletedAt
    return matchesSearch && matchesDeleted
  })

  const toggleExpand = useCallback(
    (id: string) => setExpandedId((prev) => (prev === id ? null : id)),
    []
  )

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* ── Page header ── */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Organizations</h1>
          <p className="text-xs text-muted-foreground">
            Manage organizations and their linked outlets.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Refresh"
            onClick={() => refetchOrgs()}
          >
            <IconRefresh
              className={cn("size-4", orgsLoading && "animate-spin")}
              stroke={1.75}
            />
          </Button>
          <CreateOrgDialog />
        </div>
      </div>

      <Separator />

      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-xs">
          <IconSearch
            className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
            stroke={1.75}
          />
          <Input
            placeholder="Search organizations…"
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
            {filtered.length} org{filtered.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      </div>

      {/* ── Error state ── */}
      {orgsError && (
        <ErrorMsg message="Failed to load organizations. Check your network and try again." />
      )}

      {/* ── Table ── */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>Organization Name</TableHead>
              <TableHead>Outlets</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-2 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orgsLoading ? (
              <SkeletonRows />
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-12 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center gap-2">
                    <IconBuildingStore
                      className="size-8 opacity-30"
                      stroke={1.25}
                    />
                    <p className="text-xs">
                      {search
                        ? "No organizations match your search."
                        : "No organizations yet."}
                    </p>
                    {!search && <CreateOrgDialog />}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((org) => {
                const deleted = !!org.deletedAt
                const orgId = org._id || org.id
                const outletCount = allOutlets.filter(
                  (o) => o.organizationId === orgId && !o.deletedAt
                ).length
                const isExpanded = expandedId === orgId

                return (
                  <React.Fragment key={orgId}>
                    {/* Org row */}
                    <TableRow
                      className={cn(
                        deleted && "opacity-50",
                        isExpanded && "bg-muted/40"
                      )}
                    >
                      {/* Expand chevron */}
                      <TableCell className="w-8 pl-2">
                        <button
                          onClick={() => toggleExpand(orgId)}
                          aria-label={isExpanded ? "Collapse" : "Expand"}
                          className="text-muted-foreground transition-transform duration-200"
                          style={{
                            transform: isExpanded
                              ? "rotate(90deg)"
                              : "rotate(0deg)",
                          }}
                        >
                          <IconChevronRight className="size-4" stroke={1.75} />
                        </button>
                      </TableCell>

                      <TableCell className="font-medium">{org.name}</TableCell>

                      <TableCell>
                        {outletsLoading ? (
                          <Skeleton className="h-4 w-8" />
                        ) : (
                          <Badge
                            variant="secondary"
                            className="text-[10px] tabular-nums"
                          >
                            {outletCount} outlet{outletCount !== 1 ? "s" : ""}
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {formatDate(org.createdAt)}
                      </TableCell>

                      <TableCell>
                        {deleted ? (
                          <Badge variant="secondary" className="text-[10px]">
                            Deleted
                          </Badge>
                        ) : (
                          <NativeSelect
                            value={org.status || "active"}
                            onChange={(e) => {
                              const newStatus = e.target.value
                              updateStatusMutation.mutate(
                                { id: orgId, status: newStatus },
                                {
                                  onSuccess: () => {
                                    toast.success("Organization status updated successfully.")
                                  },
                                  onError: () => {
                                    toast.error("Failed to update status.")
                                  },
                                }
                              )
                            }}
                            className={cn(
                              "h-7 w-24 text-[10px] font-semibold uppercase tracking-wider",
                              (org.status === "active" || !org.status) && "text-emerald-600 dark:text-emerald-400 select-emerald",
                              org.status === "inactive" && "text-rose-600 dark:text-rose-400 select-rose",
                              org.status === "on hold" && "text-amber-600 dark:text-amber-400 select-amber"
                            )}
                          >
                            <NativeSelectOption value="active">Active</NativeSelectOption>
                            <NativeSelectOption value="inactive">Inactive</NativeSelectOption>
                            <NativeSelectOption value="on hold">On Hold</NativeSelectOption>
                          </NativeSelect>
                        )}
                      </TableCell>

                      <TableCell className="pr-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {deleted ? (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Restore organization"
                              disabled={restoreMutation.isPending}
                              onClick={() => restoreMutation.mutate(orgId)}
                            >
                              {restoreMutation.isPending ? (
                                <IconLoader2
                                  className="size-3.5 animate-spin"
                                  stroke={2}
                                />
                              ) : (
                                <IconRefresh
                                  className="size-3.5"
                                  stroke={1.75}
                                />
                              )}
                            </Button>
                          ) : (
                            <>
                              <EditOrgDialog org={org} />
                              <DeleteConfirmDialog
                                title="Delete Organization"
                                itemName={org.name}
                                description={`Are you sure you want to soft-delete organization "${org.name}"? You can restore it later.`}
                                onConfirm={async () => {
                                  try {
                                    await deleteMutation.mutateAsync(orgId)
                                    toast.success(
                                      "Organization deleted successfully."
                                    )
                                  } catch (err) {
                                    toast.error(
                                      "Failed to delete organization."
                                    )
                                  }
                                }}
                                trigger={
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    aria-label={`Delete ${org.name}`}
                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                  >
                                    <IconTrash
                                      className="size-3.5"
                                      stroke={1.75}
                                    />
                                  </Button>
                                }
                              />
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Expanded outlets sub-table */}
                    {isExpanded && (
                      <TableRow
                        className="hover:bg-transparent"
                      >
                        <TableCell
                          colSpan={6}
                          className="bg-muted/20 px-4 py-2"
                        >
                          <Card size="sm" className="shadow-none ring-0">
                            <CardHeader>
                              <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Outlets — {org.name}
                              </CardTitle>
                              <CardDescription>
                                Outlets linked to this organization.
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                              <OrgOutlets
                                orgId={orgId}
                                allOutlets={allOutlets}
                              />
                            </CardContent>
                          </Card>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
