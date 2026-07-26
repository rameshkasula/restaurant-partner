import { useQuery, useMutation, useQueryClient, type UseQueryResult } from "@tanstack/react-query"
import { outletApi, type CreateOutletDto, type UpdateOutletDto, type Outlet, type PaginatedOutlets } from "@/api/outlets.api"

export const outletKeys = {
  all: ["outlets"] as const,
  lists: () => [...outletKeys.all, "list"] as const,
  details: () => [...outletKeys.all, "detail"] as const,
  detail: (id: string) => [...outletKeys.details(), id] as const,
}

export function useOutlets(
  enabled?: boolean
): UseQueryResult<Outlet[], Error>

export function useOutlets(
  enabled: boolean,
  page: number,
  limit: number
): UseQueryResult<PaginatedOutlets, Error>

export function useOutlets(
  enabled = true,
  page?: number,
  limit?: number
): UseQueryResult<any, Error> {
  return useQuery({
    queryKey:
      page !== undefined && limit !== undefined
        ? [...outletKeys.lists(), { page, limit }]
        : outletKeys.lists(),
    queryFn: () => outletApi.list(page as any, limit as any),
    enabled,
  })
}

export function useCreateOutlet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateOutletDto) => outletApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: outletKeys.lists() })
    },
  })
}

export function useUpdateOutlet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOutletDto }) =>
      outletApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: outletKeys.lists() })
      queryClient.invalidateQueries({ queryKey: outletKeys.detail(variables.id) })
    },
  })
}

export function useUpdateOutletStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      outletApi.updateStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: outletKeys.lists() })
      queryClient.invalidateQueries({ queryKey: outletKeys.detail(variables.id) })
    },
  })
}

export function useDeleteOutlet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => outletApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: outletKeys.lists() })
    },
  })
}

export function useRestoreOutlet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => outletApi.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: outletKeys.lists() })
    },
  })
}

export function useOutlet(id: string | null, enabled = true) {
  return useQuery({
    queryKey: outletKeys.detail(id || ""),
    queryFn: () => outletApi.get(id || ""),
    enabled: enabled && !!id,
  })
}
