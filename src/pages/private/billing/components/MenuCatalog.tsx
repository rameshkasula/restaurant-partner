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
}

export function MenuCatalog({
  searchItem,
  setSearchItem,
  menuLoading,
  filteredMenuItems,
  addToCart,
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
            {filteredMenuItems.map((item) => (
              <button
                key={item._id}
                type="button"
                onClick={() => addToCart(item._id)}
                className="group relative flex cursor-pointer flex-col justify-between rounded-xl border border-border/80 bg-card p-3.5 text-left transition-all duration-150 hover:border-primary/40 hover:bg-muted/40 hover:shadow-xs active:scale-[0.98]"
              >
                <div>
                  <span className="line-clamp-2 text-xs font-semibold text-foreground transition-colors group-hover:text-primary">
                    {item.name}
                  </span>
                  {item.category && (
                    <span className="mt-0.5 inline-block text-[10px] text-muted-foreground uppercase tracking-wider">
                      {item.category}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex w-full items-center justify-between border-t border-dashed border-border/60 pt-2.5">
                  <span className="text-xs font-bold text-foreground">
                    ₹{item.price.toFixed(2)}
                  </span>

                  <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <IconPlus className="size-2.5" />
                    Add
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
