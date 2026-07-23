import { create } from "zustand"
import { persist } from "zustand/middleware"

interface OutletState {
  selectedOutlet: string
  setSelectedOutlet: (outletId: string) => void
}

export const useOutletStore = create<OutletState>()(
  persist(
    (set) => ({
      selectedOutlet: "ALL",
      setSelectedOutlet: (outletId) => set({ selectedOutlet: outletId }),
    }),
    {
      name: "selected-outlet-storage",
    }
  )
)
