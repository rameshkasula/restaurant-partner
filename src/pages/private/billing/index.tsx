/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { IconAlertCircle } from "@tabler/icons-react"
import { toast } from "sonner"
import { useOutlets } from "@/hooks/useOutlets"
import { useMenuItems } from "@/hooks/useMenuItems"
import {
  useCreateOrder,
  useUpdateOrder,
  useDeleteOrder,
} from "@/hooks/useOrders"
import {
  type Order,
  type OrderItem,
  type Bill,
  OrderStatus,
  PaymentMode,
} from "@/api/orders.api"
import { type MenuItem } from "@/api/menu-items.api"
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog"

import { useCurrentUserProfile } from "@/hooks/useCurrentUserProfile"
import { ReceiptModal } from "./components/ReceiptModal"
import { EditOrderDialog } from "./components/EditOrderDialog"
import { BillingHeader } from "./components/BillingHeader"
import { MenuCatalog } from "./components/MenuCatalog"
import { CartPane } from "./components/CartPane"

export default function Billing() {
  const profile = useCurrentUserProfile()
  const lockedOutletId = profile?.outletId ?? null

  const { data: outlets = [] } = useOutlets(!lockedOutletId)

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

  // Mutations
  const createOrderMutation = useCreateOrder()
  const updateOrderMutation = useUpdateOrder()
  const deleteOrderMutation = useDeleteOrder()

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

  // Filter local menu items
  const filteredMenuItems = availableItems.filter((i) =>
    i.name.toLowerCase().includes(searchItem.toLowerCase())
  )

  const activeOutletName =
    activeOutletId === profile?.outletId && profile?.outletName
      ? profile.outletName
      : outletMap[activeOutletId ?? ""] || "Restaurant Outlet"

  return (
    <div className="flex w-full flex-col gap-6">
      <BillingHeader
        outlets={outlets}
        selectedOutlet={selectedOutlet}
        setSelectedOutlet={setSelectedOutlet}
        lockedOutletId={lockedOutletId}
      />

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
            <MenuCatalog
              searchItem={searchItem}
              setSearchItem={setSearchItem}
              menuLoading={menuLoading}
              filteredMenuItems={filteredMenuItems}
              addToCart={addToCart}
            />
          </div>

          {/* ── Right Column: Cart / Checkout Pane (5 Cols) ── */}
          <div className="flex flex-col gap-4 lg:col-span-5">
            <CartPane
              cart={cart}
              menuMap={menuMap}
              billCalculations={billCalculations}
              paymentMode={paymentMode}
              setPaymentMode={setPaymentMode}
              orderStatus={orderStatus}
              setOrderStatus={setOrderStatus}
              handlePlaceOrder={handlePlaceOrder}
              clearCart={clearCart}
              removeFromCart={removeFromCart}
              addToCart={addToCart}
              isPending={createOrderMutation.isPending}
            />
          </div>
        </div>
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
