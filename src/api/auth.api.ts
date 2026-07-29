import axiosInstance from "@/utils/axiosInstance"

export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  email: string
  password: string
  role: string
  organizationId?: string
  outletId?: string
}

export interface ResendOtpDto {
  email: string
}

export interface VerifyOtpDto {
  email: string
  otp: string
}

export interface UserProfile {
  id: string
  email: string
  role: string
  status: string
  isVerified: boolean
  organizationId: string | null
  outletId: string | null
}

export interface LoginResponse {
  message: string
  user: UserProfile
  accessToken: string
  refreshToken?: string
}

export interface RefreshResponse {
  message: string
  accessToken: string
}

export interface MessageResponse {
  message: string
}

export const authApi = {
  register: (data: RegisterDto) =>
    axiosInstance.post<MessageResponse>("/auth/register", data).then((r) => r.data),

  login: (data: LoginDto) =>
    axiosInstance.post<LoginResponse>("/auth/login", data).then((r) => r.data),

  refresh: () =>
    axiosInstance.post<RefreshResponse>("/auth/refresh").then((r) => r.data),

  logout: () =>
    axiosInstance.post<MessageResponse>("/auth/logout").then((r) => r.data),

  resendOtp: (data: ResendOtpDto) =>
    axiosInstance.post<MessageResponse>("/auth/resend-otp", data).then((r) => r.data),

  verifyOtp: (data: VerifyOtpDto) =>
    axiosInstance.post<MessageResponse>("/auth/verify-otp", data).then((r) => r.data),

  forgotPassword: (email: string) =>
    axiosInstance.post<MessageResponse>("/auth/forgot-password", { email }).then((r) => r.data),

  verifyResetOtp: (data: { email: string; otp: string }) =>
    axiosInstance.post<{ message: string; resetToken: string }>("/auth/verify-reset-otp", data).then((r) => r.data),

  resetPassword: (data: { email: string; resetToken: string; newPassword: string }) =>
    axiosInstance.post<MessageResponse>("/auth/reset-password", data).then((r) => r.data),
}
