import axiosInstance from "@/utils/axiosInstance"

// ── Enums ────────────────────────────────────────────────────────────────────

export const PlanBillingCycle = {
  MONTHLY: "monthly",
  YEARLY: "yearly",
} as const
export type PlanBillingCycle = typeof PlanBillingCycle[keyof typeof PlanBillingCycle]

export const PlanStatus = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  ARCHIVED: "archived",
} as const
export type PlanStatus = typeof PlanStatus[keyof typeof PlanStatus]

export const PLAN_STATUS_LABELS: Record<PlanStatus, string> = {
  [PlanStatus.ACTIVE]: "Active",
  [PlanStatus.INACTIVE]: "Inactive",
  [PlanStatus.ARCHIVED]: "Archived",
}

// ── Interfaces ───────────────────────────────────────────────────────────────

export interface Plan {
  _id: string
  id?: string
  name: string
  tagline: string
  monthlyPrice: number
  yearlyPrice: number
  maxOutlets: number | null       // null = unlimited
  maxMenuItems: number | null     // null = unlimited
  isHighlighted: boolean
  status: PlanStatus
  features: string[]
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface CreatePlanDto {
  name: string
  tagline: string
  monthlyPrice: number
  yearlyPrice: number
  maxOutlets: number | null
  maxMenuItems: number | null
  isHighlighted?: boolean
  status?: PlanStatus
  features: string[]
}

export interface UpdatePlanDto {
  name?: string
  tagline?: string
  monthlyPrice?: number
  yearlyPrice?: number
  maxOutlets?: number | null
  maxMenuItems?: number | null
  isHighlighted?: boolean
  status?: PlanStatus
  features?: string[]
}

// ── API ──────────────────────────────────────────────────────────────────────

export const plansApi = {
  list: (includeDeleted = false) => {
    const query = includeDeleted ? "?includeDeleted=true" : ""
    return axiosInstance.get<Plan[]>(`/plans${query}`).then((r) => r.data)
  },
  create: (data: CreatePlanDto) =>
    axiosInstance.post<Plan>("/plans", data).then((r) => r.data),
  update: (id: string, data: UpdatePlanDto) =>
    axiosInstance.patch<Plan>(`/plans/${id}`, data).then((r) => r.data),
  updateStatus: (id: string, status: PlanStatus) =>
    axiosInstance.patch<Plan>(`/plans/${id}/status`, { status }).then((r) => r.data),
  delete: (id: string) =>
    axiosInstance.delete(`/plans/${id}`).then((r) => r.data),
  restore: (id: string) =>
    axiosInstance.post<Plan>(`/plans/${id}/restore`).then((r) => r.data),
}
