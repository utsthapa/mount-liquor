import Medusa from "@medusajs/js-sdk"

const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

export const MEDUSA_REGION_ID = process.env.NEXT_PUBLIC_MEDUSA_REGION_ID

export const isMedusaConfigured = Boolean(baseUrl && publishableKey)

export const medusa = isMedusaConfigured
  ? new Medusa({
      baseUrl: baseUrl!,
      publishableKey,
      debug: process.env.NODE_ENV === "development",
    })
  : null

export const CART_COOKIE = "ml_cart_id"
