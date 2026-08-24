import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { DataTable, type ColumnDef } from "@/components/DataTable/DataTable"
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog"
import { StatusSelect } from "@/components/StatusSelect"
import { StatPill, StatPillGroup } from "@/components/StatCard"
import {
  IconPlus,
  IconPencil,
  IconTrash,
  IconRotateDot,
  IconLayoutGrid,
  IconStar,
  IconStarFilled,
  IconCircleCheckFilled,
  IconCircleX,
  IconRefresh,
  IconBuildingStore,
  IconMenuOrder,
} from "@tabler/icons-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  usePlans,
  useDeletePlan,
  useRestorePlan,
  useUpdatePlanStatus,
  useUpdatePlan,
} from "@/hooks/usePlans"
import {
  type Plan,
  PlanStatus,
  PLAN_STATUS_LABELS,
} from "@/api/plans.api"
import CreateEditPlan from "./CreateEditPlan"

// ── Status badge styles ───────────────────────────────────────────────────────

const STATUS_STYLES: Record<PlanStatus, { label: string; badgeClass: string; dotClass: string }> = {
  [PlanStatus.ACTIVE]: {
    label: "Active",
    badgeClass:
      "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/20 dark:text-emerald-300",
    dotClass: "bg-emerald-500",
  },
  [PlanStatus.INACTIVE]: {
    label: "Inactive",
    badgeClass:
      "bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/20 dark:text-amber-300",
    dotClass: "bg-amber-500",
  },
  [PlanStatus.ARCHIVED]: {
    label: "Archived",
    badgeClass:
      "bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/20 dark:text-rose-400",
    dotClass: "bg-rose-500",
  },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatINR(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`
}

function formatLimit(val: number | null) {
  return val === null ? (
    <span className="text-xs font-semibold text-primary">Unlimited</span>
  ) : (
    <span className="text-xs text-foreground">{val}</span>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function PlansPage() {
  const [showDeleted, setShowDeleted] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: plans = [], isLoading, refetch } = usePlans(showDeleted)

  const deleteMutation = useDeletePlan()
  const restoreMutation = useRestorePlan()
  const updateStatusMutation = useUpdatePlanStatus()
  const updateMutation = useUpdatePlan()

  // ── Stats ──────────────────────────────────────────────────────────────────
  const { data: allPlans = [] } = usePlans(true)
  const activeCount = allPlans.filter((p) => !p.isDeleted && p.status === PlanStatus.ACTIVE).length
  const deletedCount = allPlans.filter((p) => p.isDeleted).length
  const highlightedCount = allPlans.filter((p) => p.isHighlighted && !p.isDeleted).length

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleStatusChange = async (plan: Plan, newStatus: string | null) => {
    if (!newStatus) return
    try {
      await updateStatusMutation.mutateAsync({
        id: plan._id,
        status: newStatus as PlanStatus,
      })
      toast.success("Plan status updated.")
    } catch {
      toast.error("Failed to update status.")
    }
  }

  const handleToggleHighlight = async (plan: Plan) => {
    try {
      await updateMutation.mutateAsync({
        id: plan._id,
        data: { isHighlighted: !plan.isHighlighted },
      })
      toast.success(
        plan.isHighlighted
          ? "Removed highlight from plan."
          : "Plan marked as highlighted."
      )
    } catch {
      toast.error("Failed to update highlight.")
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return
    try {
      await deleteMutation.mutateAsync(deleteConfirmId)
      toast.success("Plan deleted successfully.")
      setDeleteConfirmId(null)
    } catch {
      toast.error("Failed to delete plan.")
    }
  }

  const handleRestore = async (id: string) => {
    try {
      await restoreMutation.mutateAsync(id)
      toast.success("Plan restored successfully.")
    } catch {
      toast.error("Failed to restore plan.")
    }
  }

  // ── Columns ────────────────────────────────────────────────────────────────
  const columns = useMemo<ColumnDef<Plan>[]>(
    () => [
      {
        header: "Plan",
        accessorKey: "name",
        sortable: true,
        cell: ({ row: plan }) => (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-foreground">{plan.name}</span>
              {plan.isHighlighted && (
                <IconStarFilled className="size-3 text-amber-400" />
              )}
            </div>
            <span className="max-w-[200px] truncate text-[11px] text-muted-foreground" title={plan.tagline}>
              {plan.tagline}
            </span>
          </div>
        ),
      },
      {
        header: "Pricing",
        accessorKey: "monthlyPrice",
        sortable: true,
        cell: ({ row: plan }) => (
          <div className="flex flex-col gap-0.5 text-xs">
            <span className="font-semibold text-foreground">
              {formatINR(plan.monthlyPrice)}<span className="font-normal text-muted-foreground">/mo</span>
            </span>
            <span className="text-muted-foreground">
              {formatINR(plan.yearlyPrice)}<span>/mo yearly</span>
            </span>
          </div>
        ),
      },
      {
        header: "Outlets",
        accessorKey: "maxOutlets",
        sortable: true,
        cell: ({ row: plan }) => (
          <div className="flex items-center gap-1.5">
            <IconBuildingStore className="size-3.5 shrink-0 text-muted-foreground" stroke={1.75} />
            {formatLimit(plan.maxOutlets)}
          </div>
        ),
      },
      {
        header: "Menu Items",
        accessorKey: "maxMenuItems",
        sortable: true,
        cell: ({ row: plan }) => (
          <div className="flex items-center gap-1.5">
            <IconMenuOrder className="size-3.5 shrink-0 text-muted-foreground" stroke={1.75} />
            {formatLimit(plan.maxMenuItems)}
          </div>
        ),
      },
      {
        header: "Features",
        accessorKey: "features",
        cell: ({ row: plan }) => (
          <div className="flex flex-col gap-1 max-w-[220px]">
            {plan.features.slice(0, 3).map((f, i) => (
              <span key={i} className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <IconCircleCheckFilled className="size-3 shrink-0 text-primary" />
                <span className="truncate" title={f}>{f}</span>
              </span>
            ))}
            {plan.features.length > 3 && (
              <span className="text-[11px] text-muted-foreground pl-4">
                +{plan.features.length - 3} more
              </span>
            )}
          </div>
        ),
      },
      {
        header: "Highlighted",
        accessorKey: "isHighlighted",
        cell: ({ row: plan }) => (
          <Switch
            checked={plan.isHighlighted}
            disabled={plan.isDeleted}
            onCheckedChange={() => handleToggleHighlight(plan)}
            size="sm"
          />
        ),
      },
      {
        header: "Status",
        accessorKey: "status",
        sortable: true,
        cell: ({ row: plan }) => {
          if (plan.isDeleted) {
            return (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
                <IconCircleX className="size-2.5" stroke={2} />
                Deleted
              </span>
            )
          }
          return (
            <StatusSelect
              value={plan.status}
              onChange={(val) => handleStatusChange(plan, val)}
              statusOptions={Object.values(PlanStatus).map((s) => ({
                value: s,
                label: PLAN_STATUS_LABELS[s],
                badgeClass: STATUS_STYLES[s]?.badgeClass ?? "",
                dotClass: STATUS_STYLES[s]?.dotClass ?? "",
              }))}
            />
          )
        },
      },
      {
        header: "Actions",
        className: "text-right",
        cell: ({ row: plan }) => {
          const planId = plan._id || plan.id || ""
          const deleted = plan.isDeleted
          return (
            <div className="flex items-center justify-end gap-1.5">
              {deleted ? (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  title="Restore plan"
                  onClick={() => handleRestore(planId)}
                  disabled={restoreMutation.isPending}
                >
                  <IconRotateDot className="size-3.5" />
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    title="Edit plan"
                    onClick={() => {
                      setEditingPlan(plan)
                      setFormOpen(true)
                    }}
                  >
                    <IconPencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:bg-destructive/10"
                    title="Delete plan"
                    onClick={() => setDeleteConfirmId(planId)}
                  >
                    <IconTrash className="size-3.5" />
                  </Button>
                </>
              )}
            </div>
          )
        },
      },
    ],
    [restoreMutation.isPending, updateStatusMutation, updateMutation, deleteMutation]
  )

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Pricing Plans</h1>
          <p className="text-xs text-muted-foreground">
            Manage subscription plans shown on the public pricing page.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Refresh plans"
            onClick={() => refetch()}
          >
            <IconRefresh
              className={cn("size-4", isLoading && "animate-spin")}
              stroke={1.75}
            />
          </Button>
        </div>
      </div>

      {/* ── Stats ── */}
      <StatPillGroup>
        <StatPill
          icon={IconCircleCheckFilled}
          label="Active"
          value={activeCount}
          iconClassName="text-emerald-500"
        />
        <StatPill
          icon={IconCircleX}
          label="Deleted"
          value={deletedCount}
          iconClassName="text-rose-500"
        />
        <StatPill
          icon={IconStarFilled}
          label="Highlighted"
          value={highlightedCount}
          iconClassName="text-amber-400"
        />
      </StatPillGroup>

      {/* ── Table ── */}
      <DataTable
        columns={columns}
        data={plans}
        loading={isLoading}
        searchable
        searchableKeys={["name", "tagline"]}
        searchPlaceholder="Search plans…"
        pagination
        defaultPageSize={10}
        title={
          <div className="flex items-center gap-2 text-sm font-semibold">
            <IconLayoutGrid className="size-4" />
            Plans
          </div>
        }
        headerActions={
          <div className="flex items-center gap-2">
            <Button
              variant={showDeleted ? "secondary" : "outline"}
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => setShowDeleted((v) => !v)}
            >
              <IconTrash className="size-3.5" stroke={1.75} />
              {showDeleted ? "Hide Deleted" : "Show Deleted"}
            </Button>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => {
                setEditingPlan(null)
                setFormOpen(true)
              }}
            >
              <IconPlus className="size-3.5" />
              New Plan
            </Button>
          </div>
        }
        emptyState={
          <div className="flex flex-col items-center gap-3 py-14 text-center text-muted-foreground">
            <IconStar className="size-10 opacity-20" stroke={1.25} />
            <p className="text-sm">No plans yet.</p>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => {
                setEditingPlan(null)
                setFormOpen(true)
              }}
            >
              <IconPlus className="size-3.5" />
              Create First Plan
            </Button>
          </div>
        }
      />

      {/* ── Dialogs ── */}
      <CreateEditPlan
        open={formOpen}
        onOpenChange={(o) => {
          setFormOpen(o)
          if (!o) setEditingPlan(null)
        }}
        plan={editingPlan}
      />

      <DeleteConfirmDialog
        open={!!deleteConfirmId}
        onOpenChange={(o) => !o && setDeleteConfirmId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Plan"
        description="Are you sure you want to delete this plan? It will be soft-deleted and can be restored later."
      />
    </div>
  )
}
