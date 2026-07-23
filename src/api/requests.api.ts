import axiosInstance from "@/utils/axiosInstance";

export const RestaurantRequestStatus = {
  WAITING_FOR_CALL: 'still waiting for call',
  CONTACTED: 'contacted',
  DECLINED: 'declined',
} as const

export type RestaurantRequestStatus = typeof RestaurantRequestStatus[keyof typeof RestaurantRequestStatus]

// Types
export interface RestaurantRequest {
  _id: string;
  id?: string;
  name: string;
  email: string;
  phone: string;
  restaurantName: string;
  city?: string | null;
  state?: string | null;
  message?: string | null;
  status?: RestaurantRequestStatus;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRestaurantRequestDto {
  name: string;
  email: string;
  phone: string;
  restaurantName: string;
  city?: string;
  state?: string;
  message?: string;
  status?: RestaurantRequestStatus;
}

export interface UpdateRestaurantRequestDto {
  name?: string;
  email?: string;
  phone?: string;
  restaurantName?: string;
  city?: string;
  state?: string;
  message?: string;
  status?: RestaurantRequestStatus;
}

export const requestsApi = {
  create: (data: CreateRestaurantRequestDto) =>
    axiosInstance.post<RestaurantRequest>("/restaurant-requests", data).then((r) => r.data),

  list: () =>
    axiosInstance.get<RestaurantRequest[]>("/restaurant-requests").then((r) => r.data),

  get: (id: string) =>
    axiosInstance.get<RestaurantRequest>(`/restaurant-requests/${id}`).then((r) => r.data),

  update: (id: string, data: UpdateRestaurantRequestDto) =>
    axiosInstance.patch<RestaurantRequest>(`/restaurant-requests/${id}`, data).then((r) => r.data),

  updateStatus: (id: string, status: RestaurantRequestStatus) =>
    axiosInstance.patch<RestaurantRequest>(`/restaurant-requests/${id}/status`, { status }).then((r) => r.data),

  delete: (id: string) =>
    axiosInstance.delete<void>(`/restaurant-requests/${id}`).then((r) => r.data),
};
