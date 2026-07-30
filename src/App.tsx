/// <reference types="vite-plugin-pwa/client" />
import { useEffect } from "react"
import { registerSW } from "virtual:pwa-register"
import { AppRouter } from "./router"
import { Toaster } from "@/components/ui/sonner"

export function App() {
  useEffect(() => {
    const updateSW = registerSW({
      onNeedRefresh() {
        if (confirm("New menu updates or app improvements are available! Reload to update?")) {
          updateSW(true)
        }
      },
      onOfflineReady() {
        console.log("Restaurant Partner App is ready to work offline!")
      },
    })
  }, [])

  return (
    <>
      <AppRouter />
      <Toaster richColors position="top-right" />
    </>
  )
}

export default App
