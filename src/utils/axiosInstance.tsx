import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios"
import {
  getAccessToken,
  setAccessToken,
  clearAllAuthData,
} from "@/utils/tokens"
import { env } from "@/utils/env"

interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

const axiosInstance = axios.create({
  baseURL: env.API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // Send HttpOnly cookies for refresh token & session handling
})

// Request Interceptor: Attach Access Token to Authorization header
axiosInstance.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response Interceptor: Handle Token Refresh & Silent Retry on 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      ExtendedAxiosRequestConfig | undefined

    // Skip retry logic for auth endpoints or if original request is missing
    const isAuthEndpoint = originalRequest?.url?.includes("/auth/")
    if (
      !originalRequest ||
      error.response?.status !== 401 ||
      originalRequest._retry ||
      isAuthEndpoint
    ) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      // Call backend refresh endpoint (sends HttpOnly cookie automatically)
      const { data } = await axios.post<{ accessToken: string }>(
        `${env.API_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      )

      if (data?.accessToken) {
        setAccessToken(data.accessToken)
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        return axiosInstance(originalRequest)
      }
    } catch (refreshError) {
      // Refresh token is expired or revoked -> clear local storage & redirect to login
      clearAllAuthData()
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login")
      ) {
        window.location.href = "/login"
      }
      return Promise.reject(refreshError)
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
