import { useState, useMemo, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
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
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  IconPlus,
  IconMinus,
  IconTrash,
  IconRotateDot,
  IconAlertCircle,
  IconLoader2,
  IconSearch,
  IconShoppingCart,
  IconCash,
  IconCreditCard,
  IconDeviceMobile,
  IconFileText,
  IconPrinter,
  IconChefHat,
  IconCalendar,
  IconPencil,
} from "@tabler/icons-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { getAccessToken } from "@/utils/tokens"
import { useUsers } from "@/hooks/useUsers"
import { useOutlets } from "@/hooks/useOutlets"
import { useMenuItems } from "@/hooks/useMenuItems"
import {
  useOrders,
  useSales,
  useCreateOrder,
  useUpdateOrder,
  useDeleteOrder,
  useRestoreOrder,
} from "@/hooks/useOrders"
import { Pagination } from "@/components/DataTable/Pagination"
import {
  type Order,
  type OrderItem,
  type Bill,
  OrderStatus,
  PaymentMode,
} from "@/api/orders.api"
import { type MenuItem } from "@/api/menu-items.api"
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog"

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
        const match = users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        )
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

// ── Helpers ───────────────────────────────────────────────────────────────────

const ORDER_STATUS_COLORS = {
  [OrderStatus.PENDING]:
    "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-900/50",
  [OrderStatus.PREPARING]:
    "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900/50",
  [OrderStatus.READY]:
    "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-900/50",
  [OrderStatus.COMPLETED]:
    "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-900/50",
  [OrderStatus.CANCELLED]:
    "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-900/50",
}

const PAYMENT_MODE_ICONS = {
  [PaymentMode.CASH]: <IconCash className="size-3.5 text-emerald-600" />,
  [PaymentMode.CARD]: <IconCreditCard className="size-3.5 text-blue-600" />,
  [PaymentMode.UPI]: <IconDeviceMobile className="size-3.5 text-purple-600" />,
}

// ── Receipt Modal Component ───────────────────────────────────────────────────

interface ReceiptModalProps {
  order: Order | null
  open: boolean
  onClose: () => void
  outletName: string
}

function ReceiptModal({ order, open, onClose, outletName }: ReceiptModalProps) {
  if (!order) return null

  const handlePrint = () => {
    window.print()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm print:max-w-full print:border-none print:shadow-none">
        <DialogHeader className="print:hidden">
          <DialogTitle>Order Receipt</DialogTitle>
          <DialogDescription>
            Print or view the generated customer invoice.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 rounded-lg border bg-card p-5 font-mono text-xs text-foreground shadow-sm">
          {/* Outlet details */}
          <div className="space-y-1 text-center">
            <h3 className="text-sm font-bold tracking-wider uppercase">
              {outletName}
            </h3>
            <p className="text-[10px] text-muted-foreground">
              GSTIN: STANDALONE
            </p>
            <p className="text-[10px] text-muted-foreground">
              Order ID: {order._id.slice(-6).toUpperCase()}
            </p>
          </div>

          <div className="my-1 border-t border-dashed" />

          {/* Date & Status */}
          <div className="flex justify-between text-[11px]">
            <span>
              Date: {new Date(order.createdAt).toLocaleString("en-IN")}
            </span>
            <span className="font-bold uppercase">{order.status}</span>
          </div>

          <div className="my-1 border-t border-dashed" />

          {/* Items */}
          <div className="space-y-2">
            <div className="grid grid-cols-12 text-[10px] font-bold text-muted-foreground uppercase">
              <span className="col-span-6">Item</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-4 text-right">Price</span>
            </div>
            {order.items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 text-[11px]">
                <span className="col-span-6 truncate font-medium">
                  {item.menuItemId.slice(-4).toUpperCase()} (Item)
                </span>
                <span className="col-span-2 text-center">{item.quantity}</span>
                <span className="col-span-4 text-right">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="my-1 border-t border-dashed" />

          {/* Calculations */}
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{order.bill.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (5%):</span>
              <span>₹{order.bill.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-1 text-sm font-bold">
              <span>TOTAL:</span>
              <span>₹{order.bill.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="my-1 border-t border-dashed" />

          {/* Payment info */}
          <div className="flex justify-between text-[11px]">
            <span>Payment Mode:</span>
            <span className="font-bold">
              {order.bill.paymentMode ?? "UNPAID"}
            </span>
          </div>

          <div className="mt-3 text-center text-[10px] text-muted-foreground italic">
            Thank you for dining with us!
          </div>
        </div>

        <DialogFooter className="print:hidden">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handlePrint} className="gap-1.5">
            <IconPrinter className="size-4" />
            Print Bill
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Order Dialog Edit Component ───────────────────────────────────────────────

interface EditOrderDialogProps {
  open: boolean
  onOpenChange: (o: boolean) => void
  order: Order | null
  onSubmit: (data: {
    status: OrderStatus
    paymentMode: PaymentMode | null
  }) => void
  isPending: boolean
}

function EditOrderDialog({
  open,
  onOpenChange,
  order,
  onSubmit,
  isPending,
}: EditOrderDialogProps) {
  const { register, handleSubmit, reset } = useForm<{
    status: OrderStatus
    paymentMode: PaymentMode | ""
  }>()

  useEffect(() => {
    if (open && order) {
      reset({
        status: order.status,
        paymentMode: order.bill.paymentMode ?? "",
      })
    }
  }, [open, order, reset])

  const onFormSubmit = (data: {
    status: OrderStatus
    paymentMode: PaymentMode | ""
  }) => {
    onSubmit({
      status: data.status,
      paymentMode: data.paymentMode === "" ? null : data.paymentMode,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
          <DialogDescription>
            Update the payment or preparation status of this order.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className="flex flex-col gap-4 py-1"
        >
          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-status">Preparation Status</Label>
            <NativeSelect id="edit-status" {...register("status")}>
              {Object.values(OrderStatus).map((stat) => (
                <NativeSelectOption key={stat} value={stat}>
                  {stat}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>

          {/* Payment Mode */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-payment">Payment Mode</Label>
            <NativeSelect id="edit-payment" {...register("paymentMode")}>
              <NativeSelectOption value="">— Unpaid —</NativeSelectOption>
              {Object.values(PaymentMode).map((pm) => (
                <NativeSelectOption key={pm} value={pm}>
                  {pm}
                </NativeSelectOption>
              ))}
            </NativeSelect>
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
              {isPending && <IconLoader2 className="size-3.5 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Main Page Component ───────────────────────────────────────────────────────

export default function Billing() {
  const profile = useCurrentUserProfile()
  const lockedOutletId = profile?.outletId ?? null

  const { data: outlets = [] } = useOutlets()

  // Selected Outlet & Cart State
  const [selectedOutlet, setSelectedOutlet] = useState("ALL")
  const activeOutletId = useMemo(() => {
    if (lockedOutletId) return lockedOutletId
    return selectedOutlet === "ALL" ? null : selectedOutlet
  }, [lockedOutletId, selectedOutlet])

  // Menu items list for selected outlet
  const { data: menuItems = [], isLoading: menuLoading } = useMenuItems(
    activeOutletId ?? undefined
  )

  // Filter available items only
  const availableItems = useMemo(() => {
    return menuItems.filter(
      (i) => !i.isDeleted && i.isAvailable && i.status === "active"
    )
  }, [menuItems])

  // Cart State: record of menuItemId -> quantity
  const [cart, setCart] = useState<Record<string, number>>({})
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(PaymentMode.CASH)
  const [orderStatus, setOrderStatus] = useState<OrderStatus>(
    OrderStatus.COMPLETED
  )
  const [searchItem, setSearchItem] = useState("")

  // Invoice History State
  const [includeDeleted, setIncludeDeleted] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const { data: ordersData, isLoading: ordersLoading } = useSales(
    page,
    limit,
    activeOutletId ?? undefined,
    includeDeleted,
    startDate || undefined,
    endDate || undefined
  )
  const orders = useMemo<Order[]>(() => {
    if (Array.isArray(ordersData)) return ordersData
    if (
      ordersData &&
      typeof ordersData === "object" &&
      "data" in ordersData &&
      Array.isArray((ordersData as any).data)
    ) {
      return (ordersData as any).data
    }
    return []
  }, [ordersData])

  const paginationMeta = ordersData?.pagination

  // Mutations
  const createOrderMutation = useCreateOrder()
  const updateOrderMutation = useUpdateOrder()
  const deleteOrderMutation = useDeleteOrder()
  const restoreOrderMutation = useRestoreOrder()

  // Modals state
  const [viewReceipt, setViewReceipt] = useState<Order | null>(null)
  const [editOrder, setEditingOrder] = useState<Order | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Automatically select first outlet if not admin
  useEffect(() => {
    if (lockedOutletId) {
      setSelectedOutlet(lockedOutletId)
    } else if (outlets.length > 0 && selectedOutlet === "ALL") {
      const active = outlets.find((o) => !o.deletedAt)
      if (active) setSelectedOutlet(active._id)
    }
  }, [lockedOutletId, outlets])

  // Map of menuItems for quick calculations
  const menuMap = useMemo(() => {
    const m: Record<string, MenuItem> = {}
    menuItems.forEach((i) => {
      m[i._id] = i
    })
    return m
  }, [menuItems])

  // Map of outlets for quick lookup
  const outletMap = useMemo(() => {
    const m: Record<string, string> = {}
    outlets.forEach((o) => {
      m[o._id] = o.name
    })
    return m
  }, [outlets])

  // Cart Actions
  const addToCart = (itemId: string) => {
    setCart((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }))
  }

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const next = { ...prev }
      if (next[itemId] > 1) {
        next[itemId] -= 1
      } else {
        delete next[itemId]
      }
      return next
    })
  }

  const clearCart = () => setCart({})

  // Calculations
  const billCalculations = useMemo(() => {
    let subtotal = 0
    Object.entries(cart).forEach(([itemId, qty]) => {
      const item = menuMap[itemId]
      if (item) {
        subtotal += item.price * qty
      }
    })
    const tax = Number((subtotal * 0.05).toFixed(2))
    const total = Number((subtotal + tax).toFixed(2))

    return { subtotal, tax, total }
  }, [cart, menuMap])

  // Submit order
  const handlePlaceOrder = async () => {
    if (!activeOutletId) {
      toast.error("Please select a restaurant outlet first.")
      return
    }
    const orderItems: OrderItem[] = Object.entries(cart).map(
      ([itemId, qty]) => {
        const item = menuMap[itemId]
        return {
          menuItemId: itemId,
          quantity: qty,
          price: item ? item.price : 0,
        }
      }
    )

    if (orderItems.length === 0) {
      toast.error("Cart is empty.")
      return
    }

    const billPayload: Bill = {
      subtotal: billCalculations.subtotal,
      tax: billCalculations.tax,
      total: billCalculations.total,
      paymentMode: paymentMode,
      paidAt:
        orderStatus === OrderStatus.COMPLETED ? new Date().toISOString() : null,
    }

    try {
      const order = await createOrderMutation.mutateAsync({
        outletId: activeOutletId,
        items: orderItems,
        status: orderStatus,
        bill: billPayload,
      })
      toast.success("Order processed successfully!")
      setViewReceipt(order)
      clearCart()
    } catch (err: any) {
      toast.error("Failed to place order.")
    }
  }

  // Update order status/payment
  const handleEditOrderSubmit = async (data: {
    status: OrderStatus
    paymentMode: PaymentMode | null
  }) => {
    if (!editOrder) return
    try {
      await updateOrderMutation.mutateAsync({
        id: editOrder._id,
        data: {
          status: data.status,
          bill: {
            paymentMode: data.paymentMode,
            paidAt:
              data.status === OrderStatus.COMPLETED
                ? new Date().toISOString()
                : editOrder.bill.paidAt,
          },
        },
      })
      toast.success("Order updated successfully.")
      setEditingOrder(null)
    } catch {
      toast.error("Failed to update order.")
    }
  }

  // Delete Order
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return
    try {
      await deleteOrderMutation.mutateAsync(deleteConfirmId)
      toast.success("Order deleted successfully.")
      setDeleteConfirmId(null)
    } catch {
      toast.error("Failed to delete order.")
    }
  }

  // Restore Order
  const handleRestoreOrder = async (id: string) => {
    try {
      await restoreOrderMutation.mutateAsync(id)
      toast.success("Order restored successfully.")
    } catch {
      toast.error("Failed to restore order.")
    }
  }

  // Filter local menu items
  const filteredMenuItems = availableItems.filter((i) =>
    i.name.toLowerCase().includes(searchItem.toLowerCase())
  )

  const activeOutletName =
    outletMap[activeOutletId ?? ""] || "Restaurant Outlet"

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* ── Outlet Selection Header ── */}
      <div className="flex flex-col gap-4 border-b pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            Billing Dashboard
          </h1>
          <p className="text-xs text-muted-foreground">
            Place new orders and review transaction history.
          </p>
        </div>

        {/* Outlet selector */}
        {!lockedOutletId && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Billing Outlet:
            </span>
            <NativeSelect
              value={selectedOutlet}
              onChange={(e) => setSelectedOutlet(e.target.value)}
              className="h-9 min-w-[160px] text-xs"
            >
              <NativeSelectOption value="ALL">
                — Choose Outlet —
              </NativeSelectOption>
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
      </div>

      {!activeOutletId ? (
        <Alert className="mx-auto my-12 max-w-md">
          <IconAlertCircle className="size-4" />
          <AlertDescription>
            Please select an outlet from the top filter to load the Billing
            System.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-12">
          {/* ── Left Column: POS Menu Catalog (7 Cols) ── */}
          <div className="flex flex-col gap-4 lg:col-span-7">
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <div className="mb-4 flex items-center gap-3 border-b pb-4">
                  <div className="relative flex-1">
                    <IconSearch className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search menu catalogue..."
                      className="pl-9"
                      value={searchItem}
                      onChange={(e) => setSearchItem(e.target.value)}
                    />
                  </div>
                </div>

                {menuLoading ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Skeleton key={i} className="h-20 w-full rounded-lg" />
                    ))}
                  </div>
                ) : filteredMenuItems.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
                    <IconChefHat className="size-8 opacity-25" />
                    <p className="text-xs">
                      No items available in this outlet menu.
                    </p>
                  </div>
                ) : (
                  <div className="grid max-h-[360px] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3">
                    {filteredMenuItems.map((item) => (
                      <button
                        key={item._id}
                        onClick={() => addToCart(item._id)}
                        className="group flex cursor-pointer flex-col items-start justify-between rounded-lg border p-3 text-left transition-colors hover:bg-muted/40"
                      >
                        <span className="line-clamp-2 text-xs font-semibold text-foreground transition-colors group-hover:text-primary">
                          {item.name}
                        </span>
                        <div className="mt-3 flex w-full items-center justify-between border-t border-dashed border-border pt-2">
                          <span className="text-xs font-bold text-foreground">
                            ₹{item.price.toFixed(2)}
                          </span>
                          <span className="text-[10px] font-medium text-muted-foreground">
                            {item.stock} left
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Right Column: Cart / Checkout Pane (5 Cols) ── */}
          <div className="flex flex-col gap-4 lg:col-span-5">
            <Card className="border-primary/20 shadow-sm dark:border-primary/30">
              <CardContent className="flex flex-col gap-4 pt-6">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <IconShoppingCart className="size-4 text-primary" />
                    <span>Cart Summary</span>
                  </div>
                  {Object.keys(cart).length > 0 && (
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={clearCart}
                      className="text-xs text-destructive hover:bg-destructive/10"
                    >
                      Clear Cart
                    </Button>
                  )}
                </div>

                {/* Selected Items */}
                <div className="max-h-[200px] space-y-3 overflow-y-auto pr-1">
                  {Object.keys(cart).length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
                      <IconShoppingCart className="size-8 opacity-25" />
                      <p className="text-xs">
                        Cart is empty. Click menu items to add.
                      </p>
                    </div>
                  ) : (
                    Object.entries(cart).map(([itemId, qty]) => {
                      const item = menuMap[itemId]
                      if (!item) return null
                      return (
                        <div
                          key={itemId}
                          className="flex items-center justify-between text-xs"
                        >
                          <div className="flex max-w-[160px] flex-col gap-0.5">
                            <span className="truncate font-semibold text-foreground">
                              {item.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              ₹{item.price.toFixed(2)} each
                            </span>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <div className="flex items-center overflow-hidden rounded-md border bg-background">
                              <button
                                onClick={() => removeFromCart(itemId)}
                                className="px-1.5 py-1 text-muted-foreground hover:bg-muted"
                              >
                                <IconMinus className="size-3" />
                              </button>
                              <span className="min-w-[20px] px-2 text-center font-mono text-xs font-bold">
                                {qty}
                              </span>
                              <button
                                onClick={() => addToCart(itemId)}
                                className="px-1.5 py-1 text-muted-foreground hover:bg-muted"
                              >
                                <IconPlus className="size-3" />
                              </button>
                            </div>
                            <span className="min-w-[60px] text-right font-bold">
                              ₹{(item.price * qty).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-medium">
                      ₹{billCalculations.subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Tax (5%):</span>
                    <span className="font-medium">
                      ₹{billCalculations.tax.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-sm font-bold">
                    <span>Grand Total:</span>
                    <span>₹{billCalculations.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout config */}
                {Object.keys(cart).length > 0 && (
                  <div className="space-y-3 border-t pt-4">
                    <div className="grid grid-cols-2 gap-3">
                      {/* Payment Mode */}
                      <div className="flex flex-col gap-1.5">
                        <Label
                          htmlFor="cart-payment"
                          className="text-xs font-semibold"
                        >
                          Payment Mode
                        </Label>
                        <NativeSelect
                          id="cart-payment"
                          value={paymentMode}
                          onChange={(e) =>
                            setPaymentMode(e.target.value as PaymentMode)
                          }
                          className="h-8 text-xs"
                        >
                          {Object.values(PaymentMode).map((pm) => (
                            <NativeSelectOption key={pm} value={pm}>
                              {pm}
                            </NativeSelectOption>
                          ))}
                        </NativeSelect>
                      </div>

                      {/* Status */}
                      <div className="flex flex-col gap-1.5">
                        <Label
                          htmlFor="cart-status"
                          className="text-xs font-semibold"
                        >
                          Order Status
                        </Label>
                        <NativeSelect
                          id="cart-status"
                          value={orderStatus}
                          onChange={(e) =>
                            setOrderStatus(e.target.value as OrderStatus)
                          }
                          className="h-8 text-xs"
                        >
                          {Object.values(OrderStatus).map((os) => (
                            <NativeSelectOption key={os} value={os}>
                              {os}
                            </NativeSelectOption>
                          ))}
                        </NativeSelect>
                      </div>
                    </div>

                    <Button
                      onClick={handlePlaceOrder}
                      className="mt-2 w-full gap-1.5 text-xs font-semibold"
                      disabled={createOrderMutation.isPending}
                    >
                      {createOrderMutation.isPending ? (
                        <IconLoader2 className="size-3.5 animate-spin" />
                      ) : (
                        <IconShoppingCart className="size-3.5" />
                      )}
                      Process Payment & Save Bill
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ── Transaction / Past Bills History (Full Width) ── */}
      {activeOutletId && (
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="mb-4 flex flex-col gap-4 border-b pb-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <IconFileText className="size-4 text-primary" />
                <span className="text-sm font-bold">
                  Past Orders & Invoices
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-xs">
                  <Input 
                    type="date" 
                    value={startDate} 
                    onChange={e => { setStartDate(e.target.value); setPage(1); }} 
                    className="h-8 text-xs w-[130px]" 
                  />
                  <span className="text-muted-foreground">to</span>
                  <Input 
                    type="date" 
                    value={endDate} 
                    onChange={e => { setEndDate(e.target.value); setPage(1); }} 
                    className="h-8 text-xs w-[130px]" 
                  />
                </div>
                <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground select-none">
                  <input
                    type="checkbox"
                    checked={includeDeleted}
                    onChange={(e) => { setIncludeDeleted(e.target.checked); setPage(1); }}
                    className="rounded border-muted-foreground text-primary focus:ring-primary"
                  />
                  Include Deleted
                </label>
              </div>
            </div>

            {ordersLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
                <IconFileText className="size-8 opacity-25" />
                <p className="text-xs">
                  No orders processed yet for this outlet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Items Count</TableHead>
                      <TableHead>Bill Amount</TableHead>
                      <TableHead>Payment Mode</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="pr-6 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((ord) => {
                      const ordId = ord._id || ord.id || ""
                      const deleted = ord.isDeleted
                      const paymentIcon = ord.bill.paymentMode
                        ? PAYMENT_MODE_ICONS[ord.bill.paymentMode]
                        : null

                      return (
                        <TableRow
                          key={ordId}
                          className={cn(deleted && "opacity-55")}
                        >
                          {/* Order ID */}
                          <TableCell className="font-mono text-xs font-semibold text-primary">
                            #{ordId.slice(-6).toUpperCase()}
                          </TableCell>

                          {/* Date & Time */}
                          <TableCell className="text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <IconCalendar className="size-3.5" />
                              {new Date(ord.createdAt).toLocaleString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </TableCell>

                          {/* Items Count */}
                          <TableCell className="text-xs font-medium">
                            {ord.items.reduce(
                              (acc, curr) => acc + curr.quantity,
                              0
                            )}{" "}
                            items
                          </TableCell>

                          {/* Bill Amount */}
                          <TableCell className="text-sm font-bold">
                            ₹{ord.bill.total.toFixed(2)}
                          </TableCell>

                          {/* Payment Mode */}
                          <TableCell>
                            {paymentIcon ? (
                              <span className="inline-flex items-center gap-1 text-xs capitalize">
                                {paymentIcon}
                                {ord.bill.paymentMode}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">
                                Unpaid
                              </span>
                            )}
                          </TableCell>

                          {/* Status */}
                          <TableCell>
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
                                ORDER_STATUS_COLORS[ord.status]
                              )}
                            >
                              {ord.status}
                            </span>
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="pr-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {deleted ? (
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  title="Restore invoice"
                                  onClick={() => handleRestoreOrder(ordId)}
                                >
                                  <IconRotateDot className="size-3.5" />
                                </Button>
                              ) : (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    title="View receipt"
                                    onClick={() => setViewReceipt(ord)}
                                  >
                                    <IconPrinter className="size-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    title="Update status"
                                    onClick={() => setEditingOrder(ord)}
                                  >
                                    <IconPencil className="size-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    className="text-destructive hover:bg-destructive/10"
                                    title="Delete invoice"
                                    onClick={() => setDeleteConfirmId(ordId)}
                                  >
                                    <IconTrash className="size-3.5" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
                
                {paginationMeta && orders.length > 0 && (
                  <Pagination
                    currentPage={paginationMeta.page}
                    totalPages={paginationMeta.totalPages}
                    pageSize={paginationMeta.limit}
                    totalEntries={paginationMeta.total}
                    onPageChange={(p) => setPage(p)}
                    onPageSizeChange={(s) => {
                      setLimit(s)
                      setPage(1)
                    }}
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Dialog: Receipt ── */}
      <ReceiptModal
        order={viewReceipt}
        open={!!viewReceipt}
        onClose={() => setViewReceipt(null)}
        outletName={activeOutletName}
      />

      {/* ── Dialog: Edit Order Status ── */}
      <EditOrderDialog
        open={!!editOrder}
        onOpenChange={(o) => !o && setEditingOrder(null)}
        order={editOrder}
        onSubmit={handleEditOrderSubmit}
        isPending={updateOrderMutation.isPending}
      />

      {/* ── Dialog: Delete Confirm ── */}
      <DeleteConfirmDialog
        open={!!deleteConfirmId}
        onOpenChange={(o) => !o && setDeleteConfirmId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Order Invoice"
        description="Are you sure you want to delete this order? It will be soft-deleted and can be restored later."
      />
    </div>
  )
}
