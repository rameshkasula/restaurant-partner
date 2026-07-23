import { useState, useMemo, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Select as CustomSelect,
  SelectContent as CustomSelectContent,
  SelectItem as CustomSelectItem,
  SelectTrigger as CustomSelectTrigger,
  SelectValue as CustomSelectValue,
} from "@/components/ui/select"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import {
  IconPlus,
  IconPencil,
  IconTrash,
  IconRotateDot,
  IconAlertCircle,
  IconLoader2,
  IconSearch,
  IconChefHat,
} from "@tabler/icons-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { getAccessToken } from "@/utils/tokens"
import { useUsers } from "@/hooks/useUsers"
import { useOutlets } from "@/hooks/useOutlets"
import {
  useMenuItems,
  useCreateMenuItem,
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

// ── Helpers & Styling Constants ──────────────────────────────────────────────

function InlineError({ error }: { error?: string }) {
  if (!error) return null
  return (
    <p className="mt-1 flex items-center gap-1 text-[11px] text-destructive">
      <IconAlertCircle className="size-3 shrink-0" stroke={2} />
      <span>{error}</span>
    </p>
  )
}

function ErrorMsg({ message }: { message: string }) {
  return (
    <Alert variant="destructive" className="my-2">
      <IconAlertCircle className="size-4" stroke={2} />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

const CATEGORY_STYLES = {
  [MenuItemCategory.STARTER]: {
    label: "Starter",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-900/40",
  },
  [MenuItemCategory.MAIN_COURSE]: {
    label: "Main Course",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900/40",
  },
  [MenuItemCategory.DESSERT]: {
    label: "Dessert",
    badgeClass: "bg-pink-50 text-pink-700 border-pink-200/60 dark:bg-pink-950/20 dark:text-pink-300 dark:border-pink-900/40",
  },
  [MenuItemCategory.BEVERAGE]: {
    label: "Beverage",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-900/40",
  },
  [MenuItemCategory.SIDES]: {
    label: "Sides",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200/60 dark:bg-purple-950/20 dark:text-purple-300 dark:border-purple-900/40",
  },
}

const STATUS_STYLES = {
  [MenuItemStatus.ACTIVE]: {
    label: "Active",
    badgeClass: "bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900/40",
    dotClass: "bg-emerald-500",
  },
  [MenuItemStatus.INACTIVE]: {
    label: "Inactive",
    badgeClass: "bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-950/20 dark:text-rose-300 dark:border-rose-900/40",
    dotClass: "bg-rose-500",
  },
  [MenuItemStatus.ON_HOLD]: {
    label: "On Hold",
    badgeClass: "bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-900/40",
    dotClass: "bg-amber-500",
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
  const { data: users = [] } = useUsers()

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
        const email = parts[0]
        const role = parts[1]
        const match = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
        if (match) {
          return {
            id: match._id || match.id,
            email: match.email,
            role: match.role,
            organizationId: match.organizationId,
            outletId: match.outletId,
          }
        }
        return {
          email,
          role,
          organizationId: null,
          outletId: null,
        }
      }
    } catch {
      // Fail silently
    }
    return null
  }, [users])
}

// ── Dialog Form ───────────────────────────────────────────────────────────────

interface MenuItemFormData {
  name: string
  category: MenuItemCategory
  price: number
  stock: number
  isAvailable: boolean
  status: MenuItemStatus
  outletId: string
}

interface MenuItemDialogFormProps {
  open: boolean
  onOpenChange: (o: boolean) => void
  defaultValues: MenuItemFormData
  onSubmit: (data: MenuItemFormData) => void
  isPending: boolean
  apiError: string
  isEdit?: boolean
  lockedOutletId: string | null
}

function MenuItemDialogForm({
  open,
  onOpenChange,
  defaultValues,
  onSubmit,
  isPending,
  apiError,
  isEdit = false,
  lockedOutletId,
}: MenuItemDialogFormProps) {
  const { data: outlets = [] } = useOutlets()
  const activeOutlets = outlets.filter((o) => !o.deletedAt)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<MenuItemFormData>({ defaultValues })

  useEffect(() => {
    if (open) {
      reset({
        ...defaultValues,
        outletId: lockedOutletId || defaultValues.outletId || (activeOutlets[0]?._id ?? ""),
      })
    }
  }, [open, lockedOutletId, activeOutlets.length]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details of this menu item."
              : "Create a new food or beverage item in the outlet menu."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 py-1" noValidate>
          {apiError && <ErrorMsg message={apiError} />}

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="item-name" className="font-medium text-foreground">
              Item Name *
            </Label>
            <Input
              id="item-name"
              type="text"
              placeholder="e.g. Butter Chicken"
              aria-invalid={!!errors.name}
              {...register("name", { required: "Item name is required." })}
            />
            <InlineError error={errors.name?.message} />
          </div>

          {/* Category & Status Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="item-category" className="font-medium text-foreground">
                Category *
              </Label>
              <NativeSelect
                id="item-category"
                aria-invalid={!!errors.category}
                {...register("category", { required: "Category is required." })}
                className="h-9 w-full text-sm"
              >
                {Object.values(MenuItemCategory).map((cat) => (
                  <NativeSelectOption key={cat} value={cat}>
                    {MENU_ITEM_CATEGORY_LABELS[cat]}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <InlineError error={errors.category?.message} />
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="item-status" className="font-medium text-foreground">
                Status *
              </Label>
              <NativeSelect
                id="item-status"
                aria-invalid={!!errors.status}
                {...register("status", { required: "Status is required." })}
                className="h-9 w-full text-sm"
              >
                {Object.values(MenuItemStatus).map((stat) => (
                  <NativeSelectOption key={stat} value={stat}>
                    {stat.charAt(0).toUpperCase() + stat.slice(1)}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <InlineError error={errors.status?.message} />
            </div>
          </div>

          {/* Price & Stock Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Price */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="item-price" className="font-medium text-foreground">
                Price (₹) *
              </Label>
              <Input
                id="item-price"
                type="number"
                step="0.01"
                placeholder="0.00"
                aria-invalid={!!errors.price}
                {...register("price", {
                  required: "Price is required.",
                  valueAsNumber: true,
                  validate: (val) => val >= 0 || "Price cannot be negative.",
                })}
              />
              <InlineError error={errors.price?.message} />
            </div>

            {/* Stock */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="item-stock" className="font-medium text-foreground">
                Stock Count *
              </Label>
              <Input
                id="item-stock"
                type="number"
                placeholder="10"
                aria-invalid={!!errors.stock}
                {...register("stock", {
                  required: "Stock is required.",
                  valueAsNumber: true,
                  validate: (val) => val >= 0 || "Stock cannot be negative.",
                })}
              />
              <InlineError error={errors.stock?.message} />
            </div>
          </div>

          {/* Outlet Selection (only if not locked) */}
          {!lockedOutletId ? (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="item-outlet" className="font-medium text-foreground">
                Outlet *
              </Label>
              <NativeSelect
                id="item-outlet"
                aria-invalid={!!errors.outletId}
                {...register("outletId", { required: "Outlet is required." })}
                className="h-9 w-full text-sm"
              >
                {activeOutlets.map((o) => (
                  <NativeSelectOption key={o._id} value={o._id}>
                    {o.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <InlineError error={errors.outletId?.message} />
            </div>
          ) : null}

          {/* Is Available Toggle */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="item-available" className="font-medium text-foreground cursor-pointer">
                Available for Ordering
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Toggles whether clients can see and order this item right now.
              </p>
            </div>
            <Controller
              name="isAvailable"
              control={control}
              render={({ field }) => (
                <Switch
                  id="item-available"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          <DialogFooter className="mt-2">
            <DialogClose
              render={
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              }
            />
            <Button type="submit" disabled={isPending} className="gap-1.5">
              {isPending && <IconLoader2 className="size-3.5 animate-spin" stroke={2} />}
              {isPending ? (isEdit ? "Saving…" : "Adding…") : isEdit ? "Save Changes" : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Skeleton Loader ──────────────────────────────────────────────────────────

function SkeletonRows() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((idx) => (
        <TableRow key={idx}>
          <TableCell><Skeleton className="h-4 w-36" /></TableCell>
          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
          <TableCell><Skeleton className="h-4 w-12" /></TableCell>
          <TableCell><Skeleton className="h-4 w-10" /></TableCell>
          <TableCell><Skeleton className="h-4 w-8" /></TableCell>
          <TableCell><Skeleton className="h-6 w-24" /></TableCell>
          <TableCell className="text-right"><Skeleton className="ml-auto h-7 w-16" /></TableCell>
        </TableRow>
      ))}
    </>
  )
}

// ── Main Page Component ───────────────────────────────────────────────────────

export default function MenuItems() {
  const profile = useCurrentUserProfile()
  const lockedOutletId = profile?.outletId ?? null

  const { data: outlets = [] } = useOutlets()

  // Filters State
  const [selectedOutletFilter, setSelectedOutletFilter] = useState("ALL")
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("ALL")
  const [search, setSearch] = useState("")
  const [includeDeleted, setIncludeDeleted] = useState(false)

  // Dialogs State
  const [createOpen, setCreateOpen] = useState(false)
  const [createApiError, setCreateApiError] = useState("")
  const [editOpen, setEditOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [editApiError, setEditApiError] = useState("")
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Determine query parameters
  const queryOutletId = useMemo(() => {
    if (lockedOutletId) return lockedOutletId
    return selectedOutletFilter === "ALL" ? undefined : selectedOutletFilter
  }, [lockedOutletId, selectedOutletFilter])

  // Queries & Mutations
  const { data: menuItems = [], isLoading } = useMenuItems(queryOutletId, includeDeleted)
  const createMutation = useCreateMenuItem()
  const updateMutation = useUpdateMenuItem()
  const updateStatusMutation = useUpdateMenuItemStatus()
  const deleteMutation = useDeleteMenuItem()
  const restoreMutation = useRestoreMenuItem()

  // Quick lookup maps
  const outletMap = useMemo(() => {
    const m: Record<string, string> = {}
    outlets.forEach((o) => {
      m[o._id] = o.name
    })
    return m
  }, [outlets])

  // Reset filter when locked outlet loads
  useEffect(() => {
    if (lockedOutletId) {
      setSelectedOutletFilter(lockedOutletId)
    }
  }, [lockedOutletId])

  // Filter local results based on name and category tabs
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const q = search.toLowerCase()
      const matchesSearch = item.name.toLowerCase().includes(q)
      const matchesCategory =
        selectedCategoryFilter === "ALL" || item.category === selectedCategoryFilter
      return matchesSearch && matchesCategory
    })
  }, [menuItems, search, selectedCategoryFilter])

  // handlers
  const handleCreateSubmit = async (data: MenuItemFormData) => {
    setCreateApiError("")
    try {
      await createMutation.mutateAsync({
        name: data.name.trim(),
        category: data.category,
        price: Number(data.price),
        stock: Number(data.stock),
        isAvailable: data.isAvailable,
        status: data.status,
        outletId: lockedOutletId || data.outletId,
      })
      toast.success("Menu item created successfully!")
      setCreateOpen(false)
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || "Failed to create menu item."
      setCreateApiError(msg)
    }
  }

  const handleEditSubmit = async (data: MenuItemFormData) => {
    if (!editingItem) return
    setEditApiError("")
    try {
      await updateMutation.mutateAsync({
        id: editingItem._id,
        data: {
          name: data.name.trim(),
          category: data.category,
          price: Number(data.price),
          stock: Number(data.stock),
          isAvailable: data.isAvailable,
          status: data.status,
          outletId: lockedOutletId || data.outletId,
        },
      })
      toast.success("Menu item updated successfully!")
      setEditOpen(false)
      setEditingItem(null)
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || "Failed to update menu item."
      setEditApiError(msg)
    }
  }

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

  const handleStatusChange = async (item: MenuItem, newStatus: MenuItemStatus | null) => {
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

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Menu Management</h1>
          <p className="text-xs text-muted-foreground">
            Manage your restaurant outlet's food items, categories, pricing, and availability.
          </p>
        </div>
        <Button
          onClick={() => {
            setCreateApiError("")
            setCreateOpen(true)
          }}
          className="gap-1.5"
        >
          <IconPlus className="size-3.5" />
          Add Menu Item
        </Button>
      </div>

      {/* ── Filters Card ── */}
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search menu items..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Outlet filter (visible only if no locked outlet) */}
              {!lockedOutletId && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Outlet:</span>
                  <NativeSelect
                    value={selectedOutletFilter}
                    onChange={(e) => setSelectedOutletFilter(e.target.value)}
                    className="h-8 text-xs min-w-[130px]"
                  >
                    <NativeSelectOption value="ALL">All Outlets</NativeSelectOption>
                    {outlets
                      .filter((o) => !o.deletedAt)
                      .map((o) => (
                        <NativeSelectOption key={o._id} value={o._id}>
                          {o.name}
                        </NativeSelectOption>
                      ))}
                  </NativeSelect>
                </div>
              )}

              {/* Include deleted checkbox */}
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeDeleted}
                  onChange={(e) => setIncludeDeleted(e.target.checked)}
                  className="rounded border-muted-foreground text-primary focus:ring-primary"
                />
                Include Deleted Items
              </label>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="mt-4 flex flex-wrap gap-1.5 border-t pt-4">
            <Button
              variant={selectedCategoryFilter === "ALL" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategoryFilter("ALL")}
              className="text-xs rounded-full h-8 px-4"
            >
              All Categories
            </Button>
            {Object.values(MenuItemCategory).map((cat) => (
              <Button
                key={cat}
                variant={selectedCategoryFilter === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategoryFilter(cat)}
                className="text-xs rounded-full h-8 px-4"
              >
                {MENU_ITEM_CATEGORY_LABELS[cat]}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Table Card ── */}
      <Card className="shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Details</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>Status</TableHead>
              {!lockedOutletId && <TableHead>Outlet</TableHead>}
              <TableHead className="pr-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <SkeletonRows />
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={lockedOutletId ? 7 : 8}
                  className="py-20 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <IconChefHat className="size-9 opacity-25" stroke={1.25} />
                    <p className="text-xs">No menu items found matching the filter criteria.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => {
                const itemId = item._id || item.id || ""
                const deleted = item.isDeleted
                const catInfo = CATEGORY_STYLES[item.category] || { label: item.category, badgeClass: "" }
                const statusInfo = STATUS_STYLES[item.status] || STATUS_STYLES[MenuItemStatus.ACTIVE]

                return (
                  <TableRow key={itemId} className={cn(deleted && "opacity-55")}>
                    {/* Item Details */}
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground border">
                          <IconChefHat className="size-4 text-primary/80" />
                        </div>
                        <span className="font-semibold text-sm text-foreground">
                          {item.name}
                        </span>
                      </div>
                    </TableCell>

                    {/* Category */}
                    <TableCell>
                      <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide border", catInfo.badgeClass)}>
                        {catInfo.label}
                      </span>
                    </TableCell>

                    {/* Price */}
                    <TableCell>
                      <span className="font-medium text-sm text-foreground">
                        ₹{item.price.toFixed(2)}
                      </span>
                    </TableCell>

                    {/* Stock */}
                    <TableCell>
                      <span className={cn(
                        "text-xs font-semibold px-2 py-0.5 rounded-md",
                        item.stock < 5 ? "bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                      )}>
                        {item.stock} left
                      </span>
                    </TableCell>

                    {/* Available */}
                    <TableCell>
                      <Switch
                        checked={item.isAvailable}
                        disabled={deleted}
                        onCheckedChange={() => handleToggleAvailability(item)}
                        size="sm"
                      />
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      {deleted ? (
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
                          Deleted
                        </span>
                      ) : (
                        <CustomSelect
                          value={item.status}
                          onValueChange={(val) => handleStatusChange(item, val)}
                        >
                          <CustomSelectTrigger className={cn("h-6 rounded-md px-2 font-medium shadow-none hover:bg-muted/50 border-0 flex items-center justify-between min-w-[95px] w-fit text-xs cursor-pointer", statusInfo.badgeClass)}>
                            <CustomSelectValue />
                          </CustomSelectTrigger>
                          <CustomSelectContent className="bg-popover text-popover-foreground border border-border shadow-md rounded-md p-1 min-w-[120px]">
                            {Object.entries(STATUS_STYLES).map(([value, info]) => (
                              <CustomSelectItem key={value} value={value} className="cursor-pointer hover:bg-accent hover:text-accent-foreground py-1 px-2.5 rounded-sm flex items-center text-xs">
                                <span className={cn("inline-block w-2.5 h-2.5 rounded-full mr-2 shrink-0", info.dotClass)} />
                                {info.label}
                              </CustomSelectItem>
                            ))}
                          </CustomSelectContent>
                        </CustomSelect>
                      )}
                    </TableCell>

                    {/* Outlet (if admin view) */}
                    {!lockedOutletId && (
                      <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate" title={outletMap[item.outletId] || "—"}>
                        {outletMap[item.outletId] || "Standalone"}
                      </TableCell>
                    )}

                    {/* Actions */}
                    <TableCell className="pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
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
                                setEditApiError("")
                                setEditOpen(true)
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
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* ── Dialog: Create MenuItem ── */}
      <MenuItemDialogForm
        open={createOpen}
        onOpenChange={(o) => {
          setCreateOpen(o)
          if (!o) setCreateApiError("")
        }}
        defaultValues={{
          name: "",
          category: MenuItemCategory.STARTER,
          price: 0,
          stock: 10,
          isAvailable: true,
          status: MenuItemStatus.ACTIVE,
          outletId: "",
        }}
        onSubmit={handleCreateSubmit}
        isPending={createMutation.isPending}
        apiError={createApiError}
        lockedOutletId={lockedOutletId}
      />

      {/* ── Dialog: Edit MenuItem ── */}
      {editingItem && (
        <MenuItemDialogForm
          open={editOpen}
          onOpenChange={(o) => {
            setEditOpen(o)
            if (!o) {
              setEditingItem(null)
              setEditApiError("")
            }
          }}
          defaultValues={{
            name: editingItem.name,
            category: editingItem.category,
            price: editingItem.price,
            stock: editingItem.stock,
            isAvailable: editingItem.isAvailable,
            status: editingItem.status,
            outletId: editingItem.outletId,
          }}
          onSubmit={handleEditSubmit}
          isPending={updateMutation.isPending}
          apiError={editApiError}
          isEdit={true}
          lockedOutletId={lockedOutletId}
        />
      )}

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
