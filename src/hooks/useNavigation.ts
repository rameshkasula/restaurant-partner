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

function parseJwtPayload(token: string): any {
  try {
    const base64Url = token.split(".")[1]
    if (!base64Url) return null
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

export function useNavigation() {
  const userRole = useMemo(() => {
    // 1. Try reading stored user_info from localStorage
    try {
      const stored = localStorage.getItem("user_info")
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed?.role) {
          return normalizeRole(parsed.role)
        }
      }
    } catch {
      // Fail silently
    }

    // 2. Fallback: Parse JWT payload from accessToken
    const token = getAccessToken()
    if (!token) return null
    
    const payload = parseJwtPayload(token)
    if (payload?.role) {
      return normalizeRole(payload.role)
    }

    return null
  }, [])

  const filteredNavItems = useMemo(() => {
    if (!userRole) return []
    return NAV_ITEMS.filter((item) => {
      if (!item.allowedRoles) return true
      return (item.allowedRoles as readonly string[]).includes(userRole)
    })
  }, [userRole])

  return { navItems: filteredNavItems, userRole }
}
