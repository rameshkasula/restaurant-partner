import axiosInstance from "@/utils/axiosInstance"

export interface LoginDto {
  email: string
  password: string
}

export interface LoginResponse {
  message: string
  user: {
    id: string
    email: string
    role: string
    organizationId: string | null
    outletId: string | null
  }
  token: string
}

export const authApi = {
  login: (data: LoginDto) =>
    axiosInstance.post<LoginResponse>("/auth/login", data).then((r) => r.data),
}
