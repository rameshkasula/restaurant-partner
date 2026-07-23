import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  requestsApi,
  type CreateRestaurantRequestDto,
  type UpdateRestaurantRequestDto,
  type RestaurantRequestStatus,
} from "@/api/requests.api"

export const requestKeys = {
  all: ["restaurant-requests"] as const,
  lists: () => [...requestKeys.all, "list"] as const,
  details: () => [...requestKeys.all, "detail"] as const,
  detail: (id: string) => [...requestKeys.details(), id] as const,
}

export function useRequests() {
  return useQuery({
    queryKey: requestKeys.lists(),
    queryFn: requestsApi.list,
  })
}

export function useRequest(id: string) {
  return useQuery({
    queryKey: requestKeys.detail(id),
    queryFn: () => requestsApi.get(id),
    enabled: !!id,
  })
}

export function useCreateRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateRestaurantRequestDto) => requestsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requestKeys.lists() })
    },
  })
}

export function useUpdateRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: UpdateRestaurantRequestDto
    }) => requestsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: requestKeys.detail(variables.id),
      })
    },
  })
}

export function useUpdateRequestStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string
      status: RestaurantRequestStatus
    }) => requestsApi.updateStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: requestKeys.detail(variables.id),
      })
    },
  })
}

export function useDeleteRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => requestsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requestKeys.lists() })
    },
  })
}
