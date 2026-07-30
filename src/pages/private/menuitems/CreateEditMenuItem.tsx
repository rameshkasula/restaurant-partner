import React, { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Switch } from "@/components/ui/switch"
import { IconAlertCircle } from "@tabler/icons-react"
import { toast } from "sonner"
import { useCreateMenuItem, useUpdateMenuItem } from "@/hooks/useMenuItems"
import {
  type MenuItem,
  MenuItemCategory,
  MenuItemStatus,
  MENU_ITEM_CATEGORY_LABELS,
} from "@/api/menu-items.api"
import { FormDialog } from "@/components/FormDialog"

// ─── Zod Schema ─────────────────────────────────────────────────────────────
const menuItemSchema = z.object({
  name: z.string().min(1, "Item name is required").max(150),
  category: z.nativeEnum(MenuItemCategory),
  price: z.number().min(0, "Price cannot be negative"),
  stock: z.number().min(0, "Stock cannot be negative"),
  isAvailable: z.boolean(),
  status: z.nativeEnum(MenuItemStatus),
  imageUrl: z.string().url("Invalid image URL").or(z.literal("")).optional().nullable(),
  outletId: z.string(),
})

type MenuItemFormData = z.infer<typeof menuItemSchema>

// ─── Inline Error Component ──────────────────────────────────────────────────
function InlineError({ error }: { error?: string }) {
  if (!error) return null
  return (
    <p className="mt-1 flex items-center gap-1 text-[11px] text-destructive">
      <IconAlertCircle className="size-3 shrink-0" stroke={2} />
      <span>{error}</span>
    </p>
  )
}

export default function CreateEditMenuItem({
  open,
  onOpenChange,
  menuItem,
  lockedOutletId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  menuItem: MenuItem | null
  lockedOutletId: string | null
}) {
  const isEdit = !!menuItem
  const [apiError, setApiError] = React.useState("")

  const createMutation = useCreateMenuItem()
  const updateMutation = useUpdateMenuItem()
  const isPending = createMutation.isPending || updateMutation.isPending

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: menuItem?.name || "",
      category: menuItem?.category || MenuItemCategory.STARTER,
      price: menuItem?.price || 0,
      stock: menuItem?.stock ?? 10,
      isAvailable: menuItem?.isAvailable ?? true,
      status: menuItem?.status || MenuItemStatus.ACTIVE,
      imageUrl: menuItem?.imageUrl || "",
      outletId: menuItem?.outletId || lockedOutletId || "",
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        name: menuItem?.name || "",
        category: menuItem?.category || MenuItemCategory.STARTER,
        price: menuItem?.price || 0,
        stock: menuItem?.stock ?? 10,
        isAvailable: menuItem?.isAvailable ?? true,
        status: menuItem?.status || MenuItemStatus.ACTIVE,
        imageUrl: menuItem?.imageUrl || "",
        outletId: menuItem?.outletId || lockedOutletId || "",
      })
      setApiError("")
    }
  }, [open, menuItem, lockedOutletId, reset])

  const onSubmit = async (data: MenuItemFormData) => {
    setApiError("")
    try {
      if (isEdit && menuItem) {
        await updateMutation.mutateAsync({
          id: menuItem._id,
          data: {
            name: data.name.trim(),
            category: data.category,
            price: Number(data.price),
            stock: Number(data.stock),
            isAvailable: data.isAvailable,
            status: data.status,
            imageUrl: data.imageUrl?.trim() || null,
            outletId: lockedOutletId || data.outletId,
          },
        })
        toast.success("Menu item updated successfully!")
      } else {
        await createMutation.mutateAsync({
          name: data.name.trim(),
          category: data.category,
          price: Number(data.price),
          stock: Number(data.stock),
          isAvailable: data.isAvailable,
          status: data.status,
          imageUrl: data.imageUrl?.trim() || null,
          outletId: lockedOutletId || data.outletId,
        })
        toast.success("Menu item created successfully!")
      }
      onOpenChange(false)
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err.message ||
        `Failed to ${isEdit ? "update" : "create"} menu item.`
      setApiError(msg)
      toast.error(msg)
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Menu Item" : "Add Menu Item"}
      description={
        isEdit
          ? "Update the details of this menu item."
          : "Create a new food or beverage item in the outlet menu."
      }
      onSubmit={handleSubmit(onSubmit)}
      isPending={isPending}
      submitLabel={isEdit ? "Save Changes" : "Add Item"}
    >
      {apiError && <p className="text-xs text-destructive">{apiError}</p>}

      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="item-name">Item Name *</Label>
        <Input
          id="item-name"
          placeholder="e.g. Butter Chicken"
          aria-invalid={!!errors.name}
          {...register("name")}
        />
        <InlineError error={errors.name?.message} />
      </div>

      {/* Category & Status Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Category */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="item-category">Category *</Label>
          <NativeSelect
            id="item-category"
            aria-invalid={!!errors.category}
            {...register("category")}
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
          <Label htmlFor="item-status">Status *</Label>
          <NativeSelect
            id="item-status"
            aria-invalid={!!errors.status}
            {...register("status")}
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
          <Label htmlFor="item-price">Price (₹) *</Label>
          <Input
            id="item-price"
            type="number"
            step="0.01"
            placeholder="0.00"
            aria-invalid={!!errors.price}
            {...register("price", { valueAsNumber: true })}
          />
          <InlineError error={errors.price?.message} />
        </div>

        {/* Stock */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="item-stock">Stock Count *</Label>
          <Input
            id="item-stock"
            type="number"
            placeholder="10"
            aria-invalid={!!errors.stock}
            {...register("stock", { valueAsNumber: true })}
          />
          <InlineError error={errors.stock?.message} />
        </div>
      </div>

      {/* Image URL (Optional) */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="item-imageUrl">Image URL (Optional)</Label>
        <Input
          id="item-imageUrl"
          placeholder="https://example.com/image.jpg"
          aria-invalid={!!errors.imageUrl}
          {...register("imageUrl")}
        />
        <InlineError error={errors.imageUrl?.message} />
      </div>

      {/* Is Available Toggle */}
      <div className="flex items-center justify-between rounded-lg border p-3">
        <div className="space-y-0.5">
          <Label htmlFor="item-available" className="cursor-pointer font-medium">
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
    </FormDialog>
  )
}
