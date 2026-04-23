import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getStoreConfig } from "../../lib/store-config"

export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  res.json({
    store: getStoreConfig(),
    compliance: {
      ageGate: true,
      idCheckRequired: true,
      localFulfillmentOnly: true,
    },
  })
}
