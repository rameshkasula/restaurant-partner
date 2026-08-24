import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  IconPlus,
  IconPencil,
  IconTrash,
  IconRotateDot,
  IconChefHat,
  IconUpload,
  IconCircleCheckFilled,
  IconCircleX,
  IconLeaf,
} from "@tabler/icons-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { getAccessToken } from "@/utils/tokens"
import {
  useMenuItems,
  useUpdateMenuItem,
  useUpdateMenuItemStatus,
  useDeleteMenuItem,
  useRestoreMenuItem,
} from "@/hooks/useMenuItems"
import {
  type MenuItem,
  MenuItemCategory,
  MenuItemStatus,
  MENU_ITEM_CATEGORY_LABELS,
} from "@/api/menu-items.api"
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog"
import { DataTable, type ColumnDef } from "@/components/DataTable/DataTable"
import { StatPill, StatPillGroup } from "@/components/StatCard"
import CreateEditMenuItem from "./CreateEditMenuItem"
import BulkUploadMenuItem from "./BulkUploadMenuItem"
import { StatusSelect } from "@/components/StatusSelect"

// ── Helpers & Styling Constants ──────────────────────────────────────────────

const CATEGORY_STYLES = {
  [MenuItemCategory.STARTER]: {
    label: "Starter",
    badgeClass:
      "bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-900/40",
  },
  [MenuItemCategory.MAIN_COURSE]: {
    label: "Main Course",
    badgeClass:
      "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900/40",
  },
  [MenuItemCategory.DESSERT]: {
    label: "Dessert",
    badgeClass:
      "bg-pink-50 text-pink-700 border-pink-200/60 dark:bg-pink-950/20 dark:text-pink-300 dark:border-pink-900/40",
  },
  [MenuItemCategory.BEVERAGE]: {
    label: "Beverage",
    badgeClass:
      "bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-900/40",
  },
  [MenuItemCategory.SIDES]: {
    label: "Sides",
    badgeClass:
      "bg-purple-50 text-purple-700 border-purple-200/60 dark:bg-purple-950/20 dark:text-purple-300 dark:border-purple-900/40",
  },
}

// ── Profile Hook ─────────────────────────────────────────────────────────────

interface CurrentUserProfile {
  id?: string
  email: string
  role: string
  organizationId: string | null
  outletId: string | null
}

function useCurrentUserProfile() {
  return useMemo<CurrentUserProfile | null>(() => {
    try {
      const stored = localStorage.getItem("user_info")
      if (stored) return JSON.parse(stored) as CurrentUserProfile
    } catch {
      // Fail silently
    }

    const token = getAccessToken()
    if (!token) return null
    try {
      const decoded = atob(token)
      const parts = decoded.split(":")
      if (parts.length >= 2) {
        return {
          email: parts[0],
          role: parts[1],
          organizationId: null,
          outletId: null,
        }
      }
    } catch {
      // Fail silently
    }
    return null
  }, [])
}

// ── Main Page Component ───────────────────────────────────────────────────────

export default function MenuItems() {
  const profile = useCurrentUserProfile()
  const lockedOutletId = profile?.outletId ?? null

  // Filters State
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("ALL")

  // Dialogs State
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false)

  // Queries & Mutations
  const { data: menuItems = [], isLoading } = useMenuItems(
    lockedOutletId ?? undefined
  )
  const updateMutation = useUpdateMenuItem()
  const updateStatusMutation = useUpdateMenuItemStatus()
  const deleteMutation = useDeleteMenuItem()
  const restoreMutation = useRestoreMenuItem()

  // Filter local results based on category tabs
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        selectedCategoryFilter === "ALL" ||
        item.category === selectedCategoryFilter
      return matchesCategory
    })
  }, [menuItems, selectedCategoryFilter])

  // Handlers
  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      await updateMutation.mutateAsync({
        id: item._id,
        data: { isAvailable: !item.isAvailable },
      })
      toast.success(`Availability updated for ${item.name}.`)
    } catch {
      toast.error("Failed to update availability.")
    }
  }

  const handleStatusChange = async (
    item: MenuItem,
    newStatus: MenuItemStatus | null
  ) => {
    if (!newStatus) return
    try {
      await updateStatusMutation.mutateAsync({
        id: item._id,
        status: newStatus,
      })
      toast.success("Status updated successfully.")
    } catch {
      toast.error("Failed to update status.")
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return
    try {
      await deleteMutation.mutateAsync(deleteConfirmId)
      toast.success("Menu item soft-deleted successfully.")
      setDeleteConfirmId(null)
    } catch {
      toast.error("Failed to delete menu item.")
    }
  }

  const handleRestore = async (id: string) => {
    try {
      await restoreMutation.mutateAsync(id)
      toast.success("Menu item restored successfully.")
    } catch {
      toast.error("Failed to restore menu item.")
    }
  }

  const columns = useMemo<ColumnDef<MenuItem>[]>(
    () => [
      {
        header: "Item Details",
        accessorKey: "name",
        sortable: true,
        cell: ({ row: item }) => (
          <div className="flex items-center gap-2.5">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="size-8 rounded-md object-cover border shrink-0"
              />
            ) : (
              <div className="flex size-8 items-center justify-center rounded-md border bg-muted text-muted-foreground shrink-0">
                <IconChefHat className="size-4 text-primary/80" />
              </div>
            )}
            <span className="text-sm font-semibold text-foreground">
              {item.name}
            </span>
          </div>
        ),
      },
      {
        header: "Category",
        accessorKey: "category",
        sortable: true,
        cell: ({ row: item }) => {
          const catInfo = CATEGORY_STYLES[item.category] || {
            label: item.category,
            badgeClass: "",
          }
          return (
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
                catInfo.badgeClass
              )}
            >
              {catInfo.label}
            </span>
          )
        },
      },
      {
        header: "Price",
        accessorKey: "price",
        sortable: true,
        cell: ({ row: item }) => (
          <span className="text-sm font-medium text-foreground">
            ₹{item.price.toFixed(2)}
          </span>
        ),
      },
      {
        header: "Stock",
        accessorKey: "stock",
        sortable: true,
        cell: ({ row: item }) => (
          <span
            className={cn(
              "rounded-md px-2 py-0.5 text-xs font-semibold",
              item.stock < 5
                ? "bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400"
                : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
            )}
          >
            {item.stock} left
          </span>
        ),
      },
      {
        header: "Available",
        accessorKey: "isAvailable",
        cell: ({ row: item }) => (
          <Switch
            checked={item.isAvailable}
            disabled={item.isDeleted}
            onCheckedChange={() => handleToggleAvailability(item)}
            size="sm"
          />
        ),
      },
      {
        header: "Status",
        accessorKey: "status",
        sortable: true,
        cell: ({ row: item }) => {
          const deleted = item.isDeleted

          if (deleted) {
            return (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-rose-600 uppercase dark:bg-rose-900/30 dark:text-rose-400">
                Deleted
              </span>
            )
          }

          return (
            <StatusSelect
              value={item.status}
              onChange={(val) => handleStatusChange(item, val as MenuItemStatus)}
            />
          )
        },
      },
      {
        header: "Actions",
        className: "text-right",
        cell: ({ row: item }) => {
          const itemId = item._id || item.id || ""
          const deleted = item.isDeleted

          return (
            <div className="flex items-center justify-end gap-1.5 font-sans">
              {deleted ? (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  title="Restore menu item"
                  onClick={() => handleRestore(itemId)}
                >
                  <IconRotateDot className="size-3.5" />
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    title="Edit menu item"
                    onClick={() => {
                      setEditingItem(item)
                      setFormOpen(true)
                    }}
                  >
                    <IconPencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:bg-destructive/10"
                    title="Delete menu item"
                    onClick={() => setDeleteConfirmId(itemId)}
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
    []
  )

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Menu Management</h1>
          <p className="text-xs text-muted-foreground">
            Manage your restaurant outlet's food items, categories, pricing, and
            availability.
          </p>
        </div>
      </div>

      {/* ── Stats + Category Filters ── */}
      <StatPillGroup>
        {/* Stat pills */}
        <StatPill
          icon={IconChefHat}
          label="Total Items"
          value={menuItems.length}
          iconClassName="text-muted-foreground"
        />
        <StatPill
          icon={IconCircleCheckFilled}
          label="Available"
          value={menuItems.filter((i) => i.isAvailable && !i.isDeleted).length}
          iconClassName="text-emerald-500"
        />
        <StatPill
          icon={IconLeaf}
          label="Veg"
          value={menuItems.filter((i) => i.isVeg && !i.isDeleted).length}
          iconClassName="text-green-600"
        />
        <StatPill
          icon={IconCircleX}
          label="Deleted"
          value={menuItems.filter((i) => i.isDeleted).length}
          iconClassName="text-rose-500"
        />

        {/* Divider */}
        <div className="mx-1 w-px self-stretch bg-border/60" aria-hidden />

        {/* Category filter pills */}
        <button
          onClick={() => setSelectedCategoryFilter("ALL")}
          className={cn(
            "h-7 rounded-full border px-3 text-[11px] font-medium transition-all duration-150",
            selectedCategoryFilter === "ALL"
              ? "border-primary bg-primary text-primary-foreground shadow-sm"
              : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
          )}
        >
          All
        </button>
        {Object.values(MenuItemCategory).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategoryFilter(cat)}
            className={cn(
              "h-7 rounded-full border px-3 text-[11px] font-medium transition-all duration-150",
              selectedCategoryFilter === cat
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
          >
            {MENU_ITEM_CATEGORY_LABELS[cat]}
          </button>
        ))}
      </StatPillGroup>

      {/* ── Data Table ── */}
      <DataTable
        columns={columns}
        data={filteredItems}
        loading={isLoading}
        searchable={true}
        searchableKeys={["name"]}
        searchPlaceholder="Search menu items..."
        pagination={true}
        defaultPageSize={10}
        title={
          <div className="flex items-center gap-2 text-sm font-semibold">
            <IconChefHat className="size-4" />
            Menu Items
          </div>
        }
        headerActions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setBulkUploadOpen(true)}
              size="sm"
              className="gap-1.5"
            >
              <IconUpload className="size-3.5" />
              Bulk Upload
            </Button>
            <Button
              onClick={() => {
                setEditingItem(null)
                setFormOpen(true)
              }}
              size="sm"
              className="gap-1.5"
            >
              <IconPlus className="size-3.5" />
              Add Menu Item
            </Button>
          </div>
        }
      />

      {/* ── Dialogs ── */}
      <BulkUploadMenuItem
        open={bulkUploadOpen}
        onOpenChange={setBulkUploadOpen}
        lockedOutletId={lockedOutletId}
      />

      <CreateEditMenuItem
        open={formOpen}
        onOpenChange={setFormOpen}
        menuItem={editingItem}
        lockedOutletId={lockedOutletId}
      />

      <DeleteConfirmDialog
        open={!!deleteConfirmId}
        onOpenChange={(o) => !o && setDeleteConfirmId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Menu Item"
        description="Are you sure you want to delete this menu item? It will be soft-deleted and can be restored later."
      />
    </div>
  )
}
