import { AppRouter } from "./router"
import { Toaster } from "@/components/ui/sonner"

export function App() {
  return (
    <>
      <AppRouter />
      <Toaster richColors position="top-right" />
    </>
  )
}

export default App
