import { loadEnv, defineConfig } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

const storeCors = process.env.STORE_CORS || "http://localhost:3000"
const adminCors = process.env.ADMIN_CORS || "http://localhost:7001,http://localhost:3000"
const authCors = process.env.AUTH_CORS || "http://localhost:3000"
const databaseUrl = process.env.DATABASE_URL || "postgres://localhost/medusa-liquor"
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379"

export default defineConfig({
  projectConfig: {
    databaseUrl,
    redisUrl,
    http: {
      storeCors,
      adminCors,
      authCors,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  admin: {
    backendUrl: process.env.MEDUSA_BACKEND_URL || "http://localhost:9000",
    storefrontUrl: process.env.MEDUSA_STOREFRONT_URL || "http://localhost:3000",
    disable: process.env.ADMIN_DISABLED === "true",
  },
  plugins: [],
})
