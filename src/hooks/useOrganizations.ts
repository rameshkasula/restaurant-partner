import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { orgApi } from "@/api/organizations.api"
import axiosInstance from "@/utils/axiosInstance"

export const orgKeys = {
  all: ["organizations"] as const,
  lists: () => [...orgKeys.all, "list"] as const,
  list: (filters: any) => [...orgKeys.lists(), filters] as const,
  details: () => [...orgKeys.all, "detail"] as const,
  detail: (id: string) => [...orgKeys.details(), id] as const,
}

export function useOrganizations() {
  return useQuery({
    queryKey: orgKeys.lists(),
    queryFn: orgApi.list,
  })
}

export function useCreateOrganization() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => orgApi.create(name),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: orgKeys.lists() })
    },
  })
}

export function useUpdateOrganization() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      axiosInstance.patch(`/organization/${id}`, { name }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: orgKeys.lists() })
      qc.invalidateQueries({ queryKey: orgKeys.detail(variables.id) })
    },
  })
}

export function useUpdateOrganizationStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      axiosInstance.patch(`/organization/${id}/status`, { status }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: orgKeys.lists() })
      qc.invalidateQueries({ queryKey: orgKeys.detail(variables.id) })
    },
  })
}

export function useDeleteOrganization() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => orgApi.delete(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: orgKeys.lists() })
      qc.invalidateQueries({ queryKey: orgKeys.detail(id) })
    },
  })
}

export function useRestoreOrganization() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => orgApi.restore(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: orgKeys.lists() })
      qc.invalidateQueries({ queryKey: orgKeys.detail(id) })
    },
  })
}
