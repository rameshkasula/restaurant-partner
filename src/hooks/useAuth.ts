import { useMutation } from "@tanstack/react-query"
import { authApi, type LoginDto } from "@/api/auth.api"
import { setAccessToken } from "@/utils/tokens"

export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginDto) => authApi.login(data),
    onSuccess: (data) => {
      if (data.token) {
        setAccessToken(data.token)
      }
      if (data.user) {
        localStorage.setItem("user_info", JSON.stringify(data.user))
      }
    },
  })
}
