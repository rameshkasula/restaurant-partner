import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { IconSearch, IconChefHat, IconX, IconPlus } from "@tabler/icons-react"
import { type MenuItem } from "@/api/menu-items.api"


interface MenuCatalogProps {
  searchItem: string
  setSearchItem: (val: string) => void
  menuLoading: boolean
  filteredMenuItems: MenuItem[]
  addToCart: (itemId: string) => void
  cart: Record<string, number>
}

export function MenuCatalog({
  searchItem,
  setSearchItem,
  menuLoading,
  filteredMenuItems,
  addToCart,
  cart,
}: MenuCatalogProps) {
  return (
    <Card className="shadow-xs border-border/70">
      <CardContent className="pt-5 pb-5">
        {/* Search header */}
        <div className="mb-4 flex items-center justify-between gap-3 border-b pb-3.5">
          <div className="relative flex-1">
            <IconSearch className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search dishes or menu items..."
              className="pl-9 pr-8 h-9 text-xs"
              value={searchItem}
              onChange={(e) => setSearchItem(e.target.value)}
            />
            {searchItem && (
              <button
                type="button"
                onClick={() => setSearchItem("")}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <IconX className="size-3.5" />
              </button>
            )}
          </div>
          <span className="text-xs text-muted-foreground font-medium shrink-0">
            {filteredMenuItems.length} items
          </span>
        </div>

        {menuLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : filteredMenuItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-muted-foreground">
            <IconChefHat className="size-9 opacity-30" />
            <p className="text-xs font-medium text-foreground">
              {searchItem ? `No menu items matching "${searchItem}"` : "No menu items available in this outlet"}
            </p>
            {searchItem && (
              <button
                type="button"
                onClick={() => setSearchItem("")}
                className="text-xs text-primary hover:underline font-medium cursor-pointer"
              >
                Clear search filter
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {filteredMenuItems.map((item) => {
              const inCartQty = cart[item._id] || 0
              const isOutOfStock = item.stock <= 0
              const isMaxedOut = inCartQty >= item.stock
              const remainingStock = Math.max(0, item.stock - inCartQty)

              return (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => !isMaxedOut && addToCart(item._id)}
                  disabled={isMaxedOut}
                  className={`group relative flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all duration-150 ${
                    isMaxedOut
                      ? "cursor-not-allowed border-border/40 bg-muted/20 opacity-60"
                      : "cursor-pointer border-border/80 bg-card hover:border-primary/40 hover:bg-muted/40 hover:shadow-xs active:scale-[0.98]"
                  }`}
                >
                  <div className="w-full">
                    <div className="flex items-start justify-between gap-1">
                      <span className={`line-clamp-2 text-xs font-semibold transition-colors ${
                        isMaxedOut ? "text-muted-foreground" : "text-foreground group-hover:text-primary"
                      }`}>
                        {item.name}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      {item.category && (
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          {item.category}
                        </span>
                      )}
                      
                      {isOutOfStock ? (
                        <span className="rounded bg-destructive/10 px-1 py-0.5 text-[9px] font-bold text-destructive">
                          Out of stock
                        </span>
                      ) : isMaxedOut ? (
                        <span className="rounded bg-amber-500/10 px-1 py-0.5 text-[9px] font-bold text-amber-600">
                          Max reached
                        </span>
                      ) : remainingStock <= 5 ? (
                        <span className="text-[9px] font-semibold text-amber-600">
                          Only {remainingStock} left
                        </span>
                      ) : (
                        <span className="text-[9px] text-muted-foreground">
                          Stock: {remainingStock}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex w-full items-center justify-between border-t border-dashed border-border/60 pt-2.5">
                    <span className={`text-xs font-bold ${isMaxedOut ? "text-muted-foreground" : "text-foreground"}`}>
                      ₹{item.price.toFixed(2)}
                    </span>

                    {!isMaxedOut && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <IconPlus className="size-2.5" />
                        Add
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
