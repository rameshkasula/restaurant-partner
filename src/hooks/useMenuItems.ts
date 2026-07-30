import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { menuItemApi, type CreateMenuItemDto, type UpdateMenuItemDto, type MenuItemStatus } from "@/api/menu-items.api"

export const menuItemKeys = {
  all: ["menuItems"] as const,
  lists: () => [...menuItemKeys.all, "list"] as const,
  list: (outletId?: string, includeDeleted?: boolean) => [...menuItemKeys.lists(), { outletId, includeDeleted }] as const,
  details: () => [...menuItemKeys.all, "detail"] as const,
  detail: (id: string) => [...menuItemKeys.details(), id] as const,
}

import { saveMenuItems, getMenuItems } from "@/utils/indexedDB"

export function useMenuItems(outletId?: string, includeDeleted = false, enabled = true) {
  return useQuery({
    queryKey: menuItemKeys.list(outletId, includeDeleted),
    queryFn: async () => {
      try {
        const items = await menuItemApi.list(outletId, includeDeleted)
        saveMenuItems(items).catch(console.error)
        return items
      } catch (error) {
        console.warn("Menu items API failed. Falling back to IndexedDB.", error)
        const cached = await getMenuItems()
        if (cached && cached.length > 0) {
          if (outletId) {
            return cached.filter((item) => item.outletId === outletId)
          }
          return cached
        }
        throw error
      }
    },
    enabled,
  })
}

export function useCreateMenuItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateMenuItemDto) => menuItemApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuItemKeys.lists() })
    },
  })
}

export function useUpdateMenuItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMenuItemDto }) =>
      menuItemApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: menuItemKeys.lists() })
      queryClient.invalidateQueries({ queryKey: menuItemKeys.detail(variables.id) })
    },
  })
}

export function useUpdateMenuItemStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: MenuItemStatus }) =>
      menuItemApi.updateStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: menuItemKeys.lists() })
      queryClient.invalidateQueries({ queryKey: menuItemKeys.detail(variables.id) })
    },
  })
}

export function useDeleteMenuItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => menuItemApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuItemKeys.lists() })
    },
  })
}

export function useRestoreMenuItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => menuItemApi.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuItemKeys.lists() })
    },
  })
}
