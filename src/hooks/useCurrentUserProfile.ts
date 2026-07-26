import { useMemo } from "react"
import { getAccessToken } from "@/utils/tokens"
import { useUsers } from "@/hooks/useUsers"

export interface CurrentUserProfile {
  id?: string
  email: string
  role: string
  organizationId: string | null
  outletId: string | null
  outletName?: string
}

export function useCurrentUserProfile() {
  const hasUserInfo =
    typeof window !== "undefined" && !!localStorage.getItem("user_info")
  const { data: users = [] } = useUsers(false, !hasUserInfo)

  return useMemo<CurrentUserProfile | null>(() => {
    try {
      const stored = localStorage.getItem("user_info")
      if (stored) return JSON.parse(stored) as CurrentUserProfile
    } catch {
      // Fail silently
    }

    const token = getAccessToken()
    if (!token) return null
    try {
      const base64Url = token.split(".")[1]
      if (base64Url) {
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
        const decoded = JSON.parse(atob(base64))
        const email = decoded.email
        const role = decoded.role
        if (email) {
          const match = users.find(
            (u) => u.email.toLowerCase() === email.toLowerCase()
          )
          if (match) {
            return {
              id: match._id || match.id,
              email: match.email,
              role: match.role,
              organizationId: match.organizationId,
              outletId: match.outletId,
            }
          }
          return {
            email,
            role: role || "",
            organizationId: decoded.organizationId || null,
            outletId: decoded.outletId || null,
          }
        }
      }
    } catch {
      // Fail silently
    }
    return null
  }, [users])
}
