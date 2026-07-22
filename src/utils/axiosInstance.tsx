import axios from "axios"
import { getAccessToken } from "@/utils/tokens"
import { env } from "@/utils/env"

const axiosInstance = axios.create({
  baseURL: env.API_URL,
  headers: { "Content-Type": "application/json" },
})

// Attach auth token to every request
axiosInstance.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default axiosInstance
