import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  orderApi,
  type CreateOrderDto,
  type UpdateOrderDto,
} from "@/api/orders.api"

export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (
    outletId?: string,
    includeDeleted?: boolean,
    startDate?: string,
    endDate?: string
  ) =>
    [
      ...orderKeys.lists(),
      { outletId, includeDeleted, startDate, endDate },
    ] as const,
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  sales: () => [...orderKeys.all, "sales"] as const,
  sale: (id: string) => [...orderKeys.sales(), id] as const,
}

export function useOrders(
  outletId?: string,
  includeDeleted = false,
  startDate?: string,
  endDate?: string
) {
  return useQuery({
    queryKey: orderKeys.list(outletId, includeDeleted, startDate, endDate),
    queryFn: () => orderApi.list(outletId, includeDeleted, startDate, endDate),
  })
}

// use Sales
export function useSales(
  page?: number,
  limit?: number,
  outletId?: string,
  includeDeleted = false,
  startDate?: string,
  endDate?: string
) {
  return useQuery({
    queryKey: orderKeys.sales(
      page,
      limit,
      outletId,
      includeDeleted,
      startDate,
      endDate
    ),
    queryFn: () =>
      orderApi.sales(page, limit, outletId, includeDeleted, startDate, endDate),
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateOrderDto) => orderApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
    },
  })
}

export function useUpdateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderDto }) =>
      orderApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: orderKeys.detail(variables.id),
      })
    },
  })
}

export function useDeleteOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => orderApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
    },
  })
}

export function useRestoreOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => orderApi.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
    },
  })
}
