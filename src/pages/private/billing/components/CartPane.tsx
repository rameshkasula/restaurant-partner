import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { IconShoppingCart, IconMinus, IconPlus, IconLoader2, IconTrash } from "@tabler/icons-react"
import { OrderStatus, PaymentMode } from "@/api/orders.api"
import { type MenuItem } from "@/api/menu-items.api"

interface CartPaneProps {
  cart: Record<string, number>
  menuMap: Record<string, MenuItem>
  billCalculations: { subtotal: number; tax: number; total: number }
  paymentMode: PaymentMode
  setPaymentMode: (pm: PaymentMode) => void
  orderStatus: OrderStatus
  setOrderStatus: (os: OrderStatus) => void
  handlePlaceOrder: () => void
  clearCart: () => void
  removeFromCart: (id: string) => void
  addToCart: (id: string) => void
  isPending: boolean
}

export function CartPane({
  cart,
  menuMap,
  billCalculations,
  paymentMode,
  setPaymentMode,
  orderStatus,
  setOrderStatus,
  handlePlaceOrder,
  clearCart,
  removeFromCart,
  addToCart,
  isPending,
}: CartPaneProps) {
  const itemCount = Object.values(cart).reduce((acc, qty) => acc + qty, 0)

  return (
    <Card className="border-primary/30 shadow-xs dark:border-primary/40 bg-card">
      <CardContent className="flex flex-col gap-4 pt-5 pb-5">
        <div className="flex items-center justify-between border-b pb-3.5">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconShoppingCart className="size-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-foreground">Cart Summary</h3>
              <p className="text-[10px] text-muted-foreground">{itemCount} items in cart</p>
            </div>
          </div>

          {Object.keys(cart).length > 0 && (
            <Button
              variant="ghost"
              size="xs"
              onClick={clearCart}
              className="text-xs text-destructive hover:bg-destructive/10 gap-1 h-7 px-2 cursor-pointer"
            >
              <IconTrash className="size-3" />
              Clear Cart
            </Button>
          )}
        </div>

        {/* Selected Items */}
        <div className="space-y-2.5">
          {Object.keys(cart).length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-muted-foreground">
              <IconShoppingCart className="size-8 opacity-25" />
              <p className="text-xs font-medium text-foreground">Cart is empty</p>
              <p className="text-[11px] text-muted-foreground">
                Click menu items on the left to add them to this order.
              </p>
            </div>
          ) : (
            Object.entries(cart).map(([itemId, qty]) => {
              const item = menuMap[itemId]
              if (!item) return null
              return (
                <div
                  key={itemId}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-2.5 text-xs transition-colors hover:bg-muted/40"
                >
                  <div className="flex flex-col gap-0.5 max-w-[140px] sm:max-w-[160px]">
                    <span className="truncate font-semibold text-foreground">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      ₹{item.price.toFixed(2)} each
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center overflow-hidden rounded-md border border-border bg-background shadow-2xs">
                      <button
                        type="button"
                        onClick={() => removeFromCart(itemId)}
                        className="px-2 py-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
                      >
                        <IconMinus className="size-3" />
                      </button>
                      <span className="min-w-[22px] px-1.5 text-center font-mono text-xs font-bold text-foreground">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => addToCart(itemId)}
                        className="px-2 py-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
                      >
                        <IconPlus className="size-3" />
                      </button>
                    </div>

                    <span className="min-w-[65px] text-right font-bold text-foreground">
                      ₹{(item.price * qty).toFixed(2)}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Totals & Calculations */}
        <div className="space-y-2 border-t border-border pt-3.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Subtotal:</span>
            <span className="font-medium text-foreground">
              ₹{billCalculations.subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">GST Tax (5%):</span>
            <span className="font-medium text-foreground">
              ₹{billCalculations.tax.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between border-t border-dashed border-border pt-2 text-sm font-bold">
            <span>Grand Total:</span>
            <span className="text-primary text-base">₹{billCalculations.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Checkout Configuration & Action */}
        {Object.keys(cart).length > 0 && (
          <div className="space-y-3 border-t border-border pt-3.5">
            <div className="grid grid-cols-2 gap-3">
              {/* Payment Mode */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cart-payment" className="text-xs font-semibold">
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
                <Label htmlFor="cart-status" className="text-xs font-semibold">
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
              className="mt-1 w-full gap-2 text-xs font-bold py-2.5 h-10 shadow-xs cursor-pointer"
              disabled={isPending}
            >
              {isPending ? (
                <IconLoader2 className="size-4 animate-spin" />
              ) : (
                <IconShoppingCart className="size-4" />
              )}
              Process Payment & Save Bill
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
