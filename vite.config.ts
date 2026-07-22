import path from "path"
import fs from "fs"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"
import { VitePWA } from "vite-plugin-pwa"

// Get all folders in src to generate aliases like @pages, @components, etc.
const srcPath = path.resolve(__dirname, "src")
const folders = fs
  .readdirSync(srcPath)
  .filter((file) => fs.statSync(path.join(srcPath, file)).isDirectory())

const dynamicAliases = folders.reduce(
  (acc, folder) => {
    acc[`@${folder}`] = path.resolve(__dirname, `./src/${folder}`)
    return acc
  },
  {
    "@": path.resolve(__dirname, "./src"),
  } as Record<string, string>
)

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), "")

  return {
    plugins: [react(), tailwindcss(), VitePWA({ registerType: "autoUpdate" })],
    resolve: {
      alias: dynamicAliases,
    },
    server: {
      port: parseInt(env.PORT || "5173", 10),
      strictPort: false,
    },
  }
})
