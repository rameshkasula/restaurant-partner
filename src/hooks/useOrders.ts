import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  orderApi,
  type CreateOrderDto,
  type UpdateOrderDto,
} from "@/api/orders.api"
import { getDefaultDateRangeStrings } from "@/utils/formatters"

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
  saleList: (
    page?: number,
    limit?: number,
    outletId?: string,
    includeDeleted?: boolean,
    startDate?: string,
    endDate?: string
  ) =>
    [
      ...orderKeys.sales(),
      { page, limit, outletId, includeDeleted, startDate, endDate },
    ] as const,
  sale: (id: string) => [...orderKeys.sales(), id] as const,
}

export function useOrders(
  outletId?: string,
  includeDeleted = false,
  startDate?: string,
  endDate?: string
) {
  const defaults = getDefaultDateRangeStrings()
  const sDate = startDate ?? defaults.startDate
  const eDate = endDate ?? defaults.endDate

  return useQuery({
    queryKey: orderKeys.list(outletId, includeDeleted, sDate, eDate),
    queryFn: () => orderApi.list(outletId, includeDeleted, sDate, eDate),
  })
}

// use Live Orders (polling supported)
export function useLiveOrders(
  outletId?: string,
  startDate?: string,
  endDate?: string,
  page?: number,
  limit?: number,
  refetchInterval: number | false = 6000
) {
  const defaults = getDefaultDateRangeStrings()
  const sDate = startDate ?? defaults.startDate
  const eDate = endDate ?? defaults.endDate

  return useQuery({
    queryKey: [
      ...orderKeys.all,
      "live",
      { outletId, startDate: sDate, endDate: eDate, page, limit },
    ],
    queryFn: () => orderApi.live(outletId, sDate, eDate, page, limit),
    refetchInterval,
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
  const defaults = getDefaultDateRangeStrings()
  const sDate = startDate ?? defaults.startDate
  const eDate = endDate ?? defaults.endDate

  return useQuery({
    queryKey: orderKeys.saleList(
      page,
      limit,
      outletId,
      includeDeleted,
      sDate,
      eDate
    ),
    queryFn: () =>
      orderApi.sales(page, limit, outletId, includeDeleted, sDate, eDate),
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
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: orderKeys.all })

      // Optimistically update all lists/live/sales queries
      queryClient.setQueriesData({ queryKey: orderKeys.all }, (oldData: any) => {
        if (!oldData) return oldData
        if (Array.isArray(oldData)) {
          return oldData.map((order: any) =>
            order._id === variables.id ? { ...order, ...variables.data } : order
          )
        }
        if (oldData.data && Array.isArray(oldData.data)) {
          return {
            ...oldData,
            data: oldData.data.map((order: any) =>
              order._id === variables.id ? { ...order, ...variables.data } : order
            )
          }
        }
        return oldData
      })
    },
    onSettled: () => {
      // Re-fetch all order queries to ensure client is in sync with server
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
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
