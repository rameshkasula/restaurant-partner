import { useState, useEffect } from "react"
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { removeAccessToken, getAccessToken } from "@/utils/tokens"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import {
  IconLogout,
  IconMenu2,
  IconX,
  IconSun,
  IconMoon,
} from "@tabler/icons-react"
import { BrandLogoSmall } from "@/components/BrandLogo"
import { toast } from "sonner"
import { APP_PATHS } from "@/router/paths"
import { useNavigation } from "@/hooks/useNavigation"
import { NAV_ITEMS } from "@/utils/permissions"

export default function PrivateLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, setTheme } = useTheme()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const { navItems } = useNavigation()

  // Get current user info from token
  const [userInfo, setUserInfo] = useState({
    email: "Admin",
    role: "User",
  })

  useEffect(() => {
    const token = getAccessToken()
    if (token) {
      try {
        const decoded = atob(token)
        const parts = decoded.split(":")
        if (parts.length >= 2) {
          const email = parts[0]
          const role = parts[1] === "superadmin" ? "Super Admin" : parts[1]
          setUserInfo({ email, role })
        }
      } catch (e) {
        // Fail silently
      }
    }
  }, [])

  // Route guard: Redirect to dashboard if the user tries to access a nav route they are not authorized for
  useEffect(() => {
    if (navItems.length > 0) {
      const isAllowed = navItems.some((item) => item.path === location.pathname)
      const isNavPath = NAV_ITEMS.some((item) => item.path === location.pathname)
      if (isNavPath && !isAllowed) {
        navigate(APP_PATHS.DASHBOARD)
      }
    }
  }, [location.pathname, navItems, navigate])

  // Close sidebar on path change (for mobile navigation)
  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    removeAccessToken()
    localStorage.removeItem("user_info")
    toast.success("Successfully logged out.")
    navigate("/login")
  }

  // Find active navigation label to display in header title
  const activeNavItem = navItems.find(
    (item) => item.path === location.pathname
  )
  const headerTitle = activeNavItem ? activeNavItem.label : "Portal"

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark")

  const sidebarContent = (
    <div className="flex h-full flex-col border-r border-border bg-sidebar text-sidebar-foreground">
      {/* Brand Header */}
      <div className="flex h-16 items-center px-6">
        <BrandLogoSmall />
      </div>

      <Separator />

      {/* Nav List */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-6">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/10"
                  : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" stroke={1.75} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <Separator />

      {/* Footer / User Profile & Logout */}
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground uppercase">
            {userInfo.email.charAt(0)}
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[11px] font-semibold text-foreground">
              {userInfo.email}
            </span>
            <span className="mt-0.5 truncate text-[9px] font-medium text-muted-foreground uppercase">
              {userInfo.role}
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="h-9 w-full justify-center gap-2 text-xs"
        >
          <IconLogout className="size-3.5" stroke={1.75} />
          Sign Out
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden h-full w-[240px] shrink-0 md:block">
        {sidebarContent}
      </aside>

      {/* ── Mobile Sidebar Overlay Drawer ── */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        >
          <div
            className="h-full w-[240px] animate-in shadow-2xl duration-200 slide-in-from-left"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
          <button
            className="absolute top-4 right-4 rounded-full bg-black/20 p-2 text-white hover:bg-black/40"
            aria-label="Close menu"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <IconX className="size-5" />
          </button>
        </div>
      )}

      {/* ── Main View Panel ── */}
      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/50 px-6 backdrop-blur-md">
          {/* Header Left: Menu Toggle + Title */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open menu"
            >
              <IconMenu2 className="size-5" />
            </Button>
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              {headerTitle}
            </h2>
          </div>

          {/* Header Right: Theme Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="rounded-full"
            >
              {theme === "dark" ? (
                <IconSun className="size-4.5" />
              ) : (
                <IconMoon className="size-4.5" />
              )}
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-muted/10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
