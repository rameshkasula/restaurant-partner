import axiosInstance from "@/utils/axiosInstance"

export interface Organization {
  _id?: string
  id: string
  name: string
  deletedAt: string | null
  status?: string
  createdAt: string
  updatedAt: string
}

export const orgApi = {
  list: () =>
    axiosInstance.get<Organization[]>("/organization").then((r) => r.data),
  get: (id: string) =>
    axiosInstance.get<Organization>(`/organization/${id}`).then((r) => r.data),
  create: (name: string) =>
    axiosInstance
      .post<Organization>("/organization", { name })
      .then((r) => r.data),
  delete: (id: string) => axiosInstance.delete(`/organization/${id}`),
  restore: (id: string) => axiosInstance.post(`/organization/${id}/restore`),
}
