import { useMutation } from "@tanstack/react-query"
import {
  authApi,
  type LoginDto,
  type RegisterDto,
  type ResendOtpDto,
  type VerifyOtpDto,
} from "@/api/auth.api"
import { setAccessToken, setRefreshToken, clearAllAuthData } from "@/utils/tokens"

export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginDto) => authApi.login(data),
    onSuccess: (data) => {
      if (data?.user) {
        localStorage.setItem("user_info", JSON.stringify(data.user))
      }
      if (data?.accessToken) {
        setAccessToken(data.accessToken)
      }
      if (data?.refreshToken) {
        setRefreshToken(data.refreshToken)
      }
    },
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterDto) => authApi.register(data),
  })
}

export function useLogout() {
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      clearAllAuthData()
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
    },
  })
}

export function useResendOtp() {
  return useMutation({
    mutationFn: (data: ResendOtpDto) => authApi.resendOtp(data),
  })
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: (data: VerifyOtpDto) => authApi.verifyOtp(data),
  })
}
