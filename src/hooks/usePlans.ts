import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  plansApi,
  type CreatePlanDto,
  type UpdatePlanDto,
  type PlanStatus,
  type Plan,
} from "@/api/plans.api"
import { ensureArray } from "@/utils/arrays"

// ── Query Keys ───────────────────────────────────────────────────────────────

export const planKeys = {
  all: ["plans"] as const,
  lists: () => [...planKeys.all, "list"] as const,
  list: (includeDeleted?: boolean) =>
    [...planKeys.lists(), { includeDeleted }] as const,
  detail: (id: string) => [...planKeys.all, "detail", id] as const,
}

// ── Hooks ────────────────────────────────────────────────────────────────────

export function usePlans(includeDeleted = false, enabled = true) {
  return useQuery<Plan[]>({
    queryKey: planKeys.list(includeDeleted),
    queryFn: async () => ensureArray<Plan>(await plansApi.list(includeDeleted)),
    enabled,
  })
}

export function useCreatePlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePlanDto) => plansApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planKeys.lists() })
    },
  })
}

export function useUpdatePlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlanDto }) =>
      plansApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: planKeys.lists() })
      queryClient.invalidateQueries({ queryKey: planKeys.detail(variables.id) })
    },
  })
}

export function useUpdatePlanStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: PlanStatus }) =>
      plansApi.updateStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: planKeys.lists() })
      queryClient.invalidateQueries({ queryKey: planKeys.detail(variables.id) })
    },
  })
}

export function useDeletePlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => plansApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planKeys.lists() })
    },
  })
}

export function useRestorePlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => plansApi.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planKeys.lists() })
    },
  })
}
