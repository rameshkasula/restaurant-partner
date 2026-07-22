import axiosInstance from "@/utils/axiosInstance"

// ── User Roles ────────────────────────────────────────────────────────────────
export const UserRole = {
  SUPER_ADMIN: "SUPER_ADMIN",
  PLATFORM_MANAGER: "PLATFORM_MANAGER",
  RESTAURANT_OWNER: "RESTAURANT_OWNER",
  MANAGER: "MANAGER",
  POS_STAFF: "POS_STAFF",
  KITCHEN_STAFF: "KITCHEN_STAFF",
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: "Super Admin",
  [UserRole.PLATFORM_MANAGER]: "Platform Manager",
  [UserRole.RESTAURANT_OWNER]: "Restaurant Owner",
  [UserRole.MANAGER]: "Manager",
  [UserRole.POS_STAFF]: "POS Staff",
  [UserRole.KITCHEN_STAFF]: "Kitchen Staff",
}

// ── Types ─────────────────────────────────────────────────────────────────────
export interface User {
  _id: string
  id?: string
  organizationId: string | null
  outletId: string | null
  role: UserRole
  email: string
  isDeleted: boolean
  deletedAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateUserPayload {
  organizationId?: string | null
  outletId?: string | null
  role: UserRole
  email: string
  password: string
}

export interface UpdateUserPayload {
  organizationId?: string | null
  outletId?: string | null
  role?: UserRole
  email?: string
  password?: string
}

// ── API Functions ─────────────────────────────────────────────────────────────
export const userApi = {
  list: async (includeDeleted = false): Promise<User[]> => {
    const params = includeDeleted ? "?includeDeleted=true" : ""
    const res = await axiosInstance.get(`/user${params}`)
    return res.data
  },

  getById: async (id: string): Promise<User> => {
    const res = await axiosInstance.get(`/user/${id}`)
    return res.data
  },

  create: async (payload: CreateUserPayload): Promise<User> => {
    const res = await axiosInstance.post("/user", {
      organizationId: payload.organizationId || null,
      outletId: payload.outletId || null,
      role: payload.role,
      email: payload.email,
      passwordHash: payload.password,
    })
    return res.data
  },

  update: async (id: string, payload: UpdateUserPayload): Promise<User> => {
    const body: any = {}
    if (payload.organizationId !== undefined) body.organizationId = payload.organizationId
    if (payload.outletId !== undefined) body.outletId = payload.outletId
    if (payload.role) body.role = payload.role
    if (payload.email) body.email = payload.email
    if (payload.password) body.passwordHash = payload.password
    const res = await axiosInstance.patch(`/user/${id}`, body)
    return res.data
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const res = await axiosInstance.delete(`/user/${id}`)
    return res.data
  },

  restore: async (id: string): Promise<User> => {
    const res = await axiosInstance.post(`/user/${id}/restore`)
    return res.data
  },
}
