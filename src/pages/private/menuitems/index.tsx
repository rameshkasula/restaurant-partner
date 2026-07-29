import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {
  IconPlus,
  IconPencil,
  IconTrash,
  IconRotateDot,
  IconChefHat,
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
import CreateEditMenuItem from "./CreateEditMenuItem"
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

      {/* ── Filters Card ── */}
      <Card className="shadow-sm border-border/40">
        <CardContent className="p-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5">
            <Button
              variant={selectedCategoryFilter === "ALL" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategoryFilter("ALL")}
              className="h-8 rounded-full px-4 text-xs"
            >
              All Categories
            </Button>
            {Object.values(MenuItemCategory).map((cat) => (
              <Button
                key={cat}
                variant={selectedCategoryFilter === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategoryFilter(cat)}
                className="h-8 rounded-full px-4 text-xs"
              >
                {MENU_ITEM_CATEGORY_LABELS[cat]}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

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
        }
      />

      {/* ── Dialogs ── */}
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
