import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { readSeedPayload } from "../../lib/catalog"

export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  const payload = await readSeedPayload()
  res.json(payload)
}
