import { z } from "zod"

const schema = z.object({
  name: z.string().default("Mount Liquor"),
  address: z.string().default("535 W Airport Fwy, Irving, TX 75062"),
  phone: z.string().default("469-276-7525"),
  hours: z.string().default("Mon-Sat 10am-9pm, Sun 12pm-7pm"),
  defaultMarkupPercent: z.coerce.number().default(20),
  deliveryRadiusMiles: z.coerce.number().default(10),
  deliveryFeeUsd: z.coerce.number().default(9.99),
  offlinePaymentEnabled: z.coerce.boolean().default(true),
  stripeEnabled: z.boolean(),
})

export type LiquorStoreConfig = z.infer<typeof schema>

export function getStoreConfig(): LiquorStoreConfig {
  return schema.parse({
    name: process.env.LIQUOR_STORE_NAME,
    address: process.env.LIQUOR_STORE_ADDRESS,
    phone: process.env.LIQUOR_STORE_PHONE,
    hours: process.env.LIQUOR_STORE_HOURS,
    defaultMarkupPercent: process.env.DEFAULT_MARKUP_PERCENT,
    deliveryRadiusMiles: process.env.DELIVERY_RADIUS_MILES,
    deliveryFeeUsd: process.env.DELIVERY_FEE_USD,
    offlinePaymentEnabled: process.env.OFFLINE_PAYMENT_ENABLED,
    stripeEnabled: Boolean(process.env.STRIPE_API_KEY),
  })
}
