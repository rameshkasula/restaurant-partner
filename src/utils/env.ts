export const env = {
  API_URL: import.meta.env.VITE_API_URL || "http://localhost:9001/api/v1",
  APP_VERSION: import.meta.env.VITE_APP_VERSION || "1.0.0",
  MODE: import.meta.env.MODE,
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
}
