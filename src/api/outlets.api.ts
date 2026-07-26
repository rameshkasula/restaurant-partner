import axiosInstance from "@/utils/axiosInstance"

export interface OutletOrgInfo {
  _id: string
  id?: string
  name: string
  isDeleted?: boolean
  status?: string
}

export interface Outlet {
  _id: string
  id?: string
  name: string
  organizationId: string | OutletOrgInfo | null
  address: string
  isCustomerapp: boolean
  gstin: string | null
  pan: string | null
  isTaxRequired?: boolean
  taxPercentage?: number
  isDeleted?: boolean
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

export interface PaginatedOutlets {
  data: Outlet[]
  pagination: {
    total: number
    page: number
    limit: number
    skip: number
    totalPages: number
  }
}

export interface OutletApi {
  list(): Promise<Outlet[]>
  list(page: number, limit: number): Promise<PaginatedOutlets>
  get(id: string): Promise<Outlet>
  create(data: CreateOutletDto): Promise<Outlet>
  update(id: string, data: UpdateOutletDto): Promise<Outlet>
  updateStatus(id: string, status: string): Promise<Outlet>
  delete(id: string): Promise<any>
  restore(id: string): Promise<any>
}

export const outletApi: OutletApi = {
  list(page?: number, limit?: number): any {
    const params = new URLSearchParams()
    if (page !== undefined) params.append("page", page.toString())
    if (limit !== undefined) params.append("limit", limit.toString())
    const query = params.toString() ? `?${params.toString()}` : ""

    if (page !== undefined && limit !== undefined) {
      return axiosInstance.get<PaginatedOutlets>(`/outlet${query}`).then((r) => r.data)
    }
    return axiosInstance.get<PaginatedOutlets>("/outlet?limit=1000").then((r) => r.data.data)
  },
  get: (id: string) =>
    axiosInstance.get<Outlet>(`/outlet/${id}`).then((r) => r.data),
  create: (data: CreateOutletDto) =>
    axiosInstance.post<Outlet>("/outlet", data).then((r) => r.data),
  update: (id: string, data: UpdateOutletDto) =>
    axiosInstance.patch<Outlet>(`/outlet/${id}`, data).then((r) => r.data),
  updateStatus: (id: string, status: string) =>
    axiosInstance.patch<Outlet>(`/outlet/${id}/status`, { status }).then((r) => r.data),
  delete: (id: string) => axiosInstance.delete(`/outlet/${id}`),
  restore: (id: string) => axiosInstance.post(`/outlet/${id}/restore`),
}
