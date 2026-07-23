import { useMemo } from "react"
import { getAccessToken } from "@/utils/tokens"
import { NAV_ITEMS, ROLES } from "@/utils/permissions"

/**
 * Normalizes different representations of user roles to match the keys of the ROLES object.
 * E.g., "superadmin" or "Super Admin" -> "SUPER_ADMIN"
 */
export function normalizeRole(roleStr: string): string {
  const upper = roleStr.toUpperCase()
  if (upper === "SUPERADMIN" || upper === "SUPER_ADMIN" || upper === "SUPER ADMIN") {
    return ROLES.SUPER_ADMIN
  }
  if (upper === "PLATFORMMANAGER" || upper === "PLATFORM_MANAGER" || upper === "PLATFORM MANAGER") {
    return ROLES.PLATFORM_MANAGER
  }
  if (upper === "RESTAURANTOWNER" || upper === "RESTAURANT_OWNER" || upper === "RESTAURANT OWNER") {
    return ROLES.RESTAURANT_OWNER
  }
  if (upper === "POSSTAFF" || upper === "POS_STAFF" || upper === "POS STAFF") {
    return ROLES.POS_STAFF
  }
  if (upper === "KITCHENSTAFF" || upper === "KITCHEN_STAFF" || upper === "KITCHEN STAFF") {
    return ROLES.KITCHEN_STAFF
  }
  // Remove spaces, hyphens, and ensure it uses underscores
  return upper.replace(/[\s-]/g, "_")
}

export function useNavigation() {
  const userRole = useMemo(() => {
    const token = getAccessToken()
    if (!token) return null
    try {
      const decoded = atob(token)
      const parts = decoded.split(":")
      if (parts.length >= 2) {
        return normalizeRole(parts[1])
      }
    } catch (e) {
      // Fail silently
    }
    return null
  }, [])

  const filteredNavItems = useMemo(() => {
    if (!userRole) return []
    return NAV_ITEMS.filter((item) => {
      if (!item.allowedRoles) return true
      return item.allowedRoles.includes(userRole as any)
    })
  }, [userRole])

  return { navItems: filteredNavItems, userRole }
}
