import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function main() {
  const explicitPath = process.argv[2]
  const seedPath = explicitPath || path.resolve(__dirname, "../../data/catalog-seed.json")
  const raw = await fs.readFile(seedPath, "utf-8")
  const payload = JSON.parse(raw)

  const storeName = process.env.LIQUOR_STORE_NAME || "Mount Liquor"
  const markup = Number(process.env.DEFAULT_MARKUP_PERCENT || 20)
  const deliveryRadius = Number(process.env.DELIVERY_RADIUS_MILES || 10)

  console.log(`Prepared ${payload.products.length} products for import`)
  console.log(`Store: ${storeName}`)
  console.log(`Default markup: ${markup}%`)
  console.log(`Delivery radius: ${deliveryRadius} miles`)
  console.log(`Seed file: ${seedPath}`)
  console.log("Next integration step: connect this payload to your Medusa product upsert workflow.")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
