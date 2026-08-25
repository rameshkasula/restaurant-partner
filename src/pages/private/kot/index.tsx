import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IconToolsKitchen2, IconAlertTriangle, IconNotebook } from "@tabler/icons-react"

export default function KotPage() {
  return (
    <div className="flex flex-col gap-8 p-6 max-w-5xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <IconNotebook className="size-6 text-primary" stroke={2} />
          Kitchen Order Ticket (KOT)
        </h1>
        <p className="text-sm text-muted-foreground">
          Understanding the official work order driving kitchen preparation, dispatch, and billing isolation.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-12 items-start">
        {/* ── Left Column: Definition & Importance (7 Cols) ── */}
        <div className="flex flex-col gap-6 md:col-span-7">
          {/* Card: What is KOT */}
          <Card className="border border-border/40 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                <IconToolsKitchen2 className="size-4.5 text-primary" />
                What is a KOT?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                A <strong className="text-foreground font-semibold">Kitchen Order Ticket (KOT)</strong> is the official work order sent directly to the kitchen staff and chefs whenever an order is placed.
              </p>
              <p>
                In a traditional restaurant or a modern QR-ordering system, the moment an order is punched:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  A physical <span className="text-foreground font-medium">thermal docket prints</span> inside the kitchen, <strong className="text-foreground font-semibold">OR</strong>
                </li>
                <li>
                  A <span className="text-foreground font-medium">digital card appears</span> on a Kitchen Display System (KDS) screen mounted above the prep counter.
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Card: Why KOT is Critical */}
          <Card className="border border-border/40 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                <IconAlertTriangle className="size-4.5 text-amber-500" />
                Why KOT is Critical
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  1. Separates Cooking from Billing
                </h4>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Chefs only see the food items, quantities, and cooking instructions—not prices or tax calculations. This keeps the kitchen focused solely on preparation.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  2. Prevents Food Leakage & Theft
                </h4>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Kitchen staff will never fire a burner or plate a dish without a generated KOT. If 50 biryanis leave the kitchen, exactly 50 biryani KOT dockets must exist in the system.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  3. Multi-Kitchen Routing
                </h4>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  If an order has both food and drinks, the platform splits the KOT: food items route to the main kitchen printer, while mocktails/beverages route to the bar counter printer.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Right Column: Interactive Thermal Docket Mockup (5 Cols) ── */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
            Thermal Docket Specimen
          </span>
          
          <div className="relative rounded-lg overflow-hidden bg-zinc-950 p-6 flex justify-center border border-zinc-800">
            {/* Background Grid Pattern to make it premium */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            {/* Thermal Ticket Paper */}
            <div className="relative w-full max-w-[280px] bg-amber-50/95 dark:bg-amber-100/90 text-zinc-900 p-5 shadow-2xl rounded-sm border-t-[3px] border-zinc-400 font-mono text-[11px] leading-normal select-none transform rotate-1">
              
              {/* Torn Edge Effect Bottom */}
              <div 
                className="absolute left-0 right-0 bottom-[-8px] h-2 bg-repeat-x pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(circle, transparent, transparent 50%, #fefcf0 50%, #fefcf0)",
                  backgroundSize: "6px 8px"
                }}
              />

              {/* Header */}
              <div className="text-center space-y-1">
                <h3 className="text-sm font-black tracking-widest border-b border-dashed border-zinc-400 pb-1.5">
                  KOT #104
                </h3>
                <div className="grid grid-cols-2 text-left pt-1.5 gap-y-0.5">
                  <span>Table: <strong className="font-extrabold text-black">T-04</strong></span>
                  <span className="text-right">Server: <strong className="font-semibold">QR / Self</strong></span>
                  <span>Time: 08:45 PM</span>
                  <span className="text-right">Type: Dine-In</span>
                </div>
              </div>

              <div className="my-2.5 border-t border-dashed border-zinc-400" />

              {/* Items List */}
              <div className="space-y-2">
                <div className="grid grid-cols-12 font-bold border-b border-zinc-300 pb-1">
                  <span className="col-span-2">Qty</span>
                  <span className="col-span-6">Item</span>
                  <span className="col-span-4 text-right">Notes</span>
                </div>

                <div className="grid grid-cols-12 items-start py-0.5">
                  <span className="col-span-2 font-bold">1</span>
                  <span className="col-span-6 font-semibold">Butter Chicken</span>
                  <span className="col-span-4 text-right text-[10px] text-zinc-700 italic">Less Spicy</span>
                </div>

                <div className="grid grid-cols-12 items-start py-0.5">
                  <span className="col-span-2 font-bold">2</span>
                  <span className="col-span-6 font-semibold">Garlic Naan</span>
                  <span className="col-span-4 text-right text-[10px] text-zinc-700 italic">—</span>
                </div>

                <div className="grid grid-cols-12 items-start py-0.5">
                  <span className="col-span-2 font-bold">1</span>
                  <span className="col-span-6 font-semibold">Fresh Lime Soda</span>
                  <span className="col-span-4 text-right text-[10px] text-zinc-700 italic">No Ice</span>
                </div>
              </div>

              <div className="my-2.5 border-t border-dashed border-zinc-400" />

              {/* Ticket Footer */}
              <div className="text-center text-[9px] text-zinc-600 font-semibold space-y-0.5 uppercase tracking-wider">
                <p>DO NOT SERVE WITHOUT KOT</p>
                <p className="font-mono text-[8px] text-zinc-500">BILLING BY THSMARTBILLS</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
