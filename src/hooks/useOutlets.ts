import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { outletApi, type CreateOutletDto, type UpdateOutletDto } from "@/api/outlets.api"

export const outletKeys = {
  all: ["outlets"] as const,
  lists: () => [...outletKeys.all, "list"] as const,
  details: () => [...outletKeys.all, "detail"] as const,
  detail: (id: string) => [...outletKeys.details(), id] as const,
}

export function useOutlets() {
  return useQuery({
    queryKey: outletKeys.lists(),
    queryFn: outletApi.list,
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
