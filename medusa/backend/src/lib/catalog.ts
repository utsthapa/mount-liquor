import fs from "node:fs/promises"
import path from "node:path"
import { z } from "zod"

const priceSchema = z.object({
  currency_code: z.string(),
  amount: z.number(),
})

const variantSchema = z.object({
  title: z.string(),
  sku: z.string(),
  manage_inventory: z.boolean().default(false),
  options: z.record(z.string(), z.string()),
  prices: z.array(priceSchema),
})

const productSchema = z.object({
  external_id: z.string(),
  handle: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  description: z.string().default(""),
  status: z.enum(["published", "draft"]).default("published"),
  thumbnail: z.string().nullable().optional(),
  brand: z.string().default(""),
  collection: z.string().default(""),
  categories: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.string(), z.any()).default({}),
  variants: z.array(variantSchema).min(1),
})

const payloadSchema = z.object({
  store_settings: z.record(z.string(), z.any()).optional(),
  products: z.array(productSchema),
})

export type SeedPayload = z.infer<typeof payloadSchema>

export async function readSeedPayload(filePath?: string): Promise<SeedPayload> {
  const target = filePath || path.join(process.cwd(), "data", "catalog-seed.json")
  const raw = await fs.readFile(target, "utf-8")
  return payloadSchema.parse(JSON.parse(raw))
}

type ProductService = {
  list: (input: { filters: { sku: string[] } }) => Promise<Array<{ id: string; variants?: Array<{ id: string; sku?: string }> }>>
  createProducts: (input: { products: unknown[] }) => Promise<unknown>
  updateProducts: (input: { selector: { id: string }; update: unknown }) => Promise<unknown>
}

export async function upsertCatalog(productService: ProductService, payload: SeedPayload): Promise<void> {
  for (const product of payload.products) {
    const sku = product.variants[0]?.sku
    if (!sku) continue
    const existing = await productService.list({ filters: { sku: [sku] } })
    if (existing.length > 0) {
      await productService.updateProducts({
        selector: { id: existing[0].id },
        update: {
          title: product.title,
          subtitle: product.subtitle,
          description: product.description,
          handle: product.handle,
          status: product.status,
          metadata: product.metadata,
          variants: product.variants,
        },
      })
      continue
    }
    await productService.createProducts({ products: [product] })
  }
}
