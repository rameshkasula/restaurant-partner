import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { userApi, type CreateUserPayload, type UpdateUserPayload } from "@/api/users.api"

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (includeDeleted: boolean) => [...userKeys.lists(), { includeDeleted }] as const,
  detail: (id: string) => [...userKeys.all, "detail", id] as const,
}

export function useUsers(includeDeleted = false) {
  return useQuery({
    queryKey: userKeys.list(includeDeleted),
    queryFn: () => userApi.list(includeDeleted),
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => userApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      userApi.update(id, payload),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: userKeys.lists() })
      qc.invalidateQueries({ queryKey: userKeys.detail(variables.id) })
    },
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => userApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

export function useRestoreUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => userApi.restore(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}
