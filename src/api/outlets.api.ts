import axiosInstance from "@/utils/axiosInstance"

export interface Outlet {
  _id: string
  id?: string
  name: string
  organizationId: string | null
  address: string
  isCustomerapp: boolean
  gstin: string | null
  pan: string | null
  status: string
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateOutletDto {
  name: string
  organizationId: string | null
  address: string
  isCustomerapp: boolean
  gstin?: string | null
  pan?: string | null
  status?: string
}

export interface UpdateOutletDto {
  name?: string
  organizationId?: string | null
  address?: string
  isCustomerapp?: boolean
  gstin?: string | null
  pan?: string | null
  status?: string
}

export const outletApi = {
  list: () => axiosInstance.get<Outlet[]>("/outlet").then((r) => r.data),
  create: (data: CreateOutletDto) =>
    axiosInstance.post<Outlet>("/outlet", data).then((r) => r.data),
  update: (id: string, data: UpdateOutletDto) =>
    axiosInstance.patch<Outlet>(`/outlet/${id}`, data).then((r) => r.data),
  updateStatus: (id: string, status: string) =>
    axiosInstance.patch<Outlet>(`/outlet/${id}/status`, { status }).then((r) => r.data),
  delete: (id: string) => axiosInstance.delete(`/outlet/${id}`),
  restore: (id: string) => axiosInstance.post(`/outlet/${id}/restore`),
}
