import { useQuery, useMutation, useQueryClient, type UseQueryResult } from "@tanstack/react-query"
import {
  userApi,
  type CreateUserPayload,
  type UpdateUserPayload,
  type UserStatus,
  type User,
  type PaginatedUsers,
} from "@/api/users.api"

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (includeDeleted: boolean, page?: number, limit?: number) =>
    [...userKeys.lists(), { includeDeleted, page, limit }] as const,
  detail: (id: string) => [...userKeys.all, "detail", id] as const,
}

export function useUsers(
  includeDeleted?: boolean,
  enabled?: boolean
): UseQueryResult<User[], Error>

export function useUsers(
  includeDeleted: boolean,
  page: number,
  limit: number,
  enabled?: boolean
): UseQueryResult<PaginatedUsers, Error>

export function useUsers(
  includeDeleted = false,
  pageOrEnabled?: number | boolean,
  limit?: number,
  enabled = true
): UseQueryResult<any, Error> {
  const isPaginated = typeof pageOrEnabled === "number" && limit !== undefined
  const actualPage = isPaginated ? (pageOrEnabled as number) : undefined
  const actualLimit = isPaginated ? limit : undefined
  const actualEnabled = typeof pageOrEnabled === "boolean" ? pageOrEnabled : enabled

  return useQuery({
    queryKey: userKeys.list(includeDeleted, actualPage, actualLimit),
    queryFn: () => userApi.list(includeDeleted, actualPage, actualLimit),
    enabled: actualEnabled,
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

export function useUpdateUserStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) =>
      userApi.updateStatus(id, status),
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
