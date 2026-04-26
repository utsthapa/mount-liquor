import crypto from "node:crypto"
import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DEFAULT_DELAY_MS = 900
const DEFAULT_MAX_RETRIES = 4
const DEFAULT_FAILURE_COOLDOWN_HOURS = 24
const DEFAULT_MAX_RETRY_DELAY_MS = 60_000
const UPCITEMDB_TRIAL_URL = "https://api.upcitemdb.com/prod/trial/lookup"
const OPEN_FOOD_FACTS_URL = "https://world.openfoodfacts.org/api/v2/product"
const BARCODE_SPIDER_URL = "https://api.barcodespider.com/v1/lookup"
const BARCODE_FINDER_URL = "https://docs.barcodefinder.info/product"
const BARCODE_LOOKUP_URL = "https://api.barcodelookup.com/v3/products"
const LOCAL_IMAGE_ROUTE = "/catalog-images"

function defaultSeedPath() {
  return path.resolve(__dirname, "../../data/catalog-seed.json")
}

function defaultCachePath(seedPath) {
  return path.join(path.dirname(seedPath), "catalog-image-cache.json")
}

function defaultImageDir(seedPath) {
  return path.join(path.dirname(seedPath), "catalog-images")
}

function parseProviderList(raw) {
  return String(raw || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
}

function parseArgs(argv) {
  const seedPath = defaultSeedPath()
  const options = {
    seedPath,
    cachePath: defaultCachePath(seedPath),
    imageDir: defaultImageDir(seedPath),
    backendBaseUrl: process.env.MEDUSA_BACKEND_URL || "http://localhost:9000",
    delayMs: Number(process.env.IMAGE_LOOKUP_DELAY_MS || DEFAULT_DELAY_MS),
    maxRetries: Number(process.env.IMAGE_LOOKUP_MAX_RETRIES || DEFAULT_MAX_RETRIES),
    maxRetryDelayMs: Number(process.env.IMAGE_LOOKUP_MAX_RETRY_DELAY_MS || DEFAULT_MAX_RETRY_DELAY_MS),
    failureCooldownHours: Number(process.env.IMAGE_LOOKUP_FAILURE_COOLDOWN_HOURS || DEFAULT_FAILURE_COOLDOWN_HOURS),
    limit: undefined,
    overwrite: false,
    providers: parseProviderList(
      process.env.IMAGE_LOOKUP_PROVIDERS || "barcodelookup,upcitemdb,barcodespider,barcodefinder,openfoodfacts"
    ),
  }

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === "--seed" && argv[i + 1]) {
      options.seedPath = path.resolve(process.cwd(), argv[i + 1])
      options.cachePath = defaultCachePath(options.seedPath)
      options.imageDir = defaultImageDir(options.seedPath)
      i += 1
      continue
    }
    if (arg === "--cache" && argv[i + 1]) {
      options.cachePath = path.resolve(process.cwd(), argv[i + 1])
      i += 1
      continue
    }
    if (arg === "--image-dir" && argv[i + 1]) {
      options.imageDir = path.resolve(process.cwd(), argv[i + 1])
      i += 1
      continue
    }
    if (arg === "--limit" && argv[i + 1]) {
      options.limit = Number(argv[i + 1])
      i += 1
      continue
    }
    if (arg === "--delay-ms" && argv[i + 1]) {
      options.delayMs = Number(argv[i + 1])
      i += 1
      continue
    }
    if (arg === "--providers" && argv[i + 1]) {
      options.providers = parseProviderList(argv[i + 1])
      i += 1
      continue
    }
    if (arg === "--max-retries" && argv[i + 1]) {
      options.maxRetries = Number(argv[i + 1])
      i += 1
      continue
    }
    if (arg === "--max-retry-delay-ms" && argv[i + 1]) {
      options.maxRetryDelayMs = Number(argv[i + 1])
      i += 1
      continue
    }
    if (arg === "--failure-cooldown-hours" && argv[i + 1]) {
      options.failureCooldownHours = Number(argv[i + 1])
      i += 1
      continue
    }
    if (arg === "--backend-base-url" && argv[i + 1]) {
      options.backendBaseUrl = argv[i + 1].replace(/\/$/, "")
      i += 1
      continue
    }
    if (arg === "--overwrite") {
      options.overwrite = true
    }
  }

  if (!Number.isFinite(options.delayMs) || options.delayMs < 0) {
    throw new Error(`Invalid --delay-ms value: ${options.delayMs}`)
  }
  if (!Number.isInteger(options.maxRetries) || options.maxRetries < 0) {
    throw new Error(`Invalid --max-retries value: ${options.maxRetries}`)
  }
  if (!Number.isFinite(options.maxRetryDelayMs) || options.maxRetryDelayMs < 0) {
    throw new Error(`Invalid --max-retry-delay-ms value: ${options.maxRetryDelayMs}`)
  }
  if (!Number.isFinite(options.failureCooldownHours) || options.failureCooldownHours < 0) {
    throw new Error(`Invalid --failure-cooldown-hours value: ${options.failureCooldownHours}`)
  }
  if (options.limit !== undefined && (!Number.isInteger(options.limit) || options.limit <= 0)) {
    throw new Error(`Invalid --limit value: ${options.limit}`)
  }
  if (options.providers.length === 0) {
    throw new Error("At least one provider must be configured")
  }

  return options
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function normalizeBarcode(upc) {
  return String(upc || "").replace(/\D/g, "")
}

function isHttpUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

function firstValidUrl(values) {
  for (const value of values || []) {
    if (typeof value === "string" && isHttpUrl(value)) {
      return value
    }
  }
  return null
}

function localImageUrl(filename, backendBaseUrl) {
  return `${backendBaseUrl.replace(/\/$/, "")}${LOCAL_IMAGE_ROUTE}?file=${encodeURIComponent(filename)}`
}

function isManagedLocalUrl(url, backendBaseUrl) {
  if (typeof url !== "string" || !url) return false
  return url.startsWith(localImageUrl("", backendBaseUrl)) || url.startsWith(`${LOCAL_IMAGE_ROUTE}?file=`)
}

function extensionFromMimeType(contentType) {
  const type = String(contentType || "").split(";")[0].trim().toLowerCase()
  if (type === "image/jpeg") return "jpg"
  if (type === "image/png") return "png"
  if (type === "image/webp") return "webp"
  if (type === "image/gif") return "gif"
  if (type === "image/avif") return "avif"
  if (type === "image/svg+xml") return "svg"
  return ""
}

function extensionFromUrl(value) {
  try {
    const pathname = new URL(value).pathname.toLowerCase()
    const ext = path.extname(pathname).replace(".", "")
    return ext || ""
  } catch {
    return ""
  }
}

function buildImageFilename(upc, source, remoteUrl, contentType) {
  const ext = extensionFromMimeType(contentType) || extensionFromUrl(remoteUrl) || "jpg"
  const digest = crypto.createHash("sha1").update(`${source}:${remoteUrl}`).digest("hex").slice(0, 10)
  return `${upc}-${source}-${digest}.${ext}`
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options)
  if (!response.ok) {
    const body = await response.text().catch(() => "")
    const error = new Error(`HTTP ${response.status} for ${url}${body ? `: ${body.slice(0, 240)}` : ""}`)
    error.status = response.status
    error.retryAfterSeconds = Number(response.headers.get("retry-after") || 0)
    error.body = body
    error.headers = Object.fromEntries(response.headers.entries())
    throw error
  }
  return response.json()
}

function computeRetryDelayMs(error, attempt, baseDelayMs) {
  const retryAfterMs = Number(error?.retryAfterSeconds || 0) * 1000
  if (retryAfterMs > 0) {
    return retryAfterMs
  }
  return baseDelayMs * Math.max(2, attempt + 1)
}

function isRateLimitError(error) {
  return error?.status === 429 || String(error?.message || "").includes("TOO_FAST")
}

async function loadCache(cachePath) {
  try {
    const raw = await fs.readFile(cachePath, "utf-8")
    const data = JSON.parse(raw)
    if (!data || typeof data !== "object") return {}

    for (const [upc, entry] of Object.entries(data)) {
      if (
        entry &&
        typeof entry === "object" &&
        entry.status === "error" &&
        typeof entry.error === "string" &&
        entry.error.includes("world.openfoodfacts.org/api/v2/product") &&
        entry.error.includes("HTTP 404")
      ) {
        data[upc] = {
          ...entry,
          status: "not_found",
          error: undefined,
        }
      }
    }

    return data
  } catch (error) {
    if (error?.code === "ENOENT") return {}
    throw error
  }
}

async function writeCache(cachePath, cache) {
  await fs.writeFile(cachePath, `${JSON.stringify(cache, null, 2)}\n`, "utf-8")
}

function shouldSkipCachedLookup(cacheEntry, overwrite, failureCooldownHours) {
  if (!cacheEntry || overwrite) return false
  if (cacheEntry.status === "found") return true
  if (cacheEntry.status === "not_found") return true
  if (cacheEntry.status !== "error" || !cacheEntry.checkedAt) return false

  const checkedAt = Date.parse(cacheEntry.checkedAt)
  if (Number.isNaN(checkedAt)) return false
  return Date.now() - checkedAt < failureCooldownHours * 60 * 60 * 1000
}

function annotateProduct(product, fields) {
  product.metadata = {
    ...(product.metadata || {}),
    ...fields,
  }
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true })
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function downloadImage(remoteUrl, upc, source, options) {
  const response = await fetch(remoteUrl)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for image ${remoteUrl}`)
  }
  const contentType = response.headers.get("content-type") || ""
  if (!contentType.toLowerCase().startsWith("image/")) {
    throw new Error(`Expected image content-type for ${remoteUrl}, got ${contentType || "unknown"}`)
  }

  const filename = buildImageFilename(upc, source, remoteUrl, contentType)
  const filePath = path.join(options.imageDir, filename)
  await ensureDir(options.imageDir)
  const buffer = Buffer.from(await response.arrayBuffer())
  await fs.writeFile(filePath, buffer)

  return {
    localPath: filePath,
    localFilename: filename,
    localUrl: localImageUrl(filename, options.backendBaseUrl),
  }
}

async function materializeImage(product, upc, source, remoteUrl, cache, options) {
  const downloaded = await downloadImage(remoteUrl, upc, source, options)
  product.thumbnail = downloaded.localUrl
  annotateProduct(product, {
    image_source: source,
    image_lookup_status: "found",
    image_url: remoteUrl,
    image_local_file: downloaded.localFilename,
    image_last_checked_at: new Date().toISOString(),
  })
  cache[upc] = {
    status: "found",
    checkedAt: product.metadata.image_last_checked_at,
    source,
    imageUrl: remoteUrl,
    localImagePath: downloaded.localPath,
    localImageUrl: downloaded.localUrl,
    localFilename: downloaded.localFilename,
  }
}

async function maybeDownloadExistingThumbnail(product, upc, cache, options) {
  if (!isHttpUrl(product.thumbnail)) return false

  const source = String(product.metadata?.image_source || "existing").toLowerCase()
  try {
    await materializeImage(product, upc, source, product.thumbnail, cache, options)
    console.log(`downloaded existing thumbnail for ${upc}`)
    return true
  } catch (error) {
    console.error(`failed downloading existing thumbnail for ${upc}: ${error.message}`)
    return false
  }
}

async function applyCachedResult(product, upc, cacheEntry, cache, options) {
  if (!cacheEntry) return false

  if (cacheEntry.status === "found") {
    const cachedFilePath = cacheEntry.localPath || cacheEntry.localImagePath
    const cachedUrl = cacheEntry.localUrl || cacheEntry.localImageUrl
    if (cachedFilePath && cachedUrl && (await fileExists(cachedFilePath))) {
      product.thumbnail = cachedUrl
      annotateProduct(product, {
        image_source: cacheEntry.source || product.metadata?.image_source,
        image_lookup_status: "found",
        image_url: cacheEntry.imageUrl || product.metadata?.image_url,
        image_local_file: cacheEntry.localFilename || path.basename(cachedFilePath),
        image_last_checked_at: cacheEntry.checkedAt || product.metadata?.image_last_checked_at,
      })
      return true
    }

    if (isHttpUrl(cacheEntry.imageUrl)) {
      await materializeImage(product, upc, cacheEntry.source || "cache", cacheEntry.imageUrl, cache, options)
      return true
    }
  }

  if (cacheEntry.status === "not_found") {
    annotateProduct(product, {
      image_source: cacheEntry.source || product.metadata?.image_source,
      image_lookup_status: "not_found",
      image_last_checked_at: cacheEntry.checkedAt || product.metadata?.image_last_checked_at,
    })
    return true
  }

  if (cacheEntry.status === "error") {
    annotateProduct(product, {
      image_source: cacheEntry.source || product.metadata?.image_source,
      image_lookup_status: "error",
      image_last_checked_at: cacheEntry.checkedAt || product.metadata?.image_last_checked_at,
    })
    return true
  }

  return false
}

async function lookupUpcItemDb(upc) {
  const url = new URL(UPCITEMDB_TRIAL_URL)
  url.searchParams.set("upc", upc)
  const data = await fetchJson(url)
  const item = data?.items?.[0]
  if (!item) return null

  return {
    imageUrl: firstValidUrl(item.images),
    source: "upcitemdb",
    title: item.title || null,
  }
}

async function lookupBarcodeSpider(upc) {
  const token = process.env.BARCODE_SPIDER_TOKEN
  if (!token) return null

  const url = new URL(BARCODE_SPIDER_URL)
  url.searchParams.set("upc", upc)
  const data = await fetchJson(url, { headers: { token } })
  const attrs = data?.item_attributes || {}
  const stores = Array.isArray(data?.Stores) ? data.Stores : []

  return {
    imageUrl: firstValidUrl([attrs.image, ...stores.map((store) => store?.image)]),
    source: "barcodespider",
    title: attrs.title || null,
  }
}

async function lookupBarcodeFinder(upc) {
  try {
    const data = await fetchJson(`${BARCODE_FINDER_URL}/${upc}`)
    return {
      imageUrl: firstValidUrl(data?.product?.images),
      source: "barcodefinder",
      title: data?.product?.title || null,
    }
  } catch (error) {
    if (
      error?.status === 404 ||
      error?.status === 401 ||
      error?.status === 403 ||
      error instanceof SyntaxError ||
      String(error?.message || "").includes("Unexpected token '<'")
    ) {
      return null
    }
    throw error
  }
}

async function lookupBarcodeLookup(upc) {
  const apiKey = process.env.BARCODE_LOOKUP_KEY
  if (!apiKey) return null

  const url = new URL(BARCODE_LOOKUP_URL)
  url.searchParams.set("barcode", upc)
  url.searchParams.set("key", apiKey)

  let data
  try {
    data = await fetchJson(url, {
      headers: {
        Accept: "application/json",
      },
    })
  } catch (error) {
    if (error?.status === 404 || error?.status === 403) {
      return null
    }
    throw error
  }

  const product = Array.isArray(data?.products) ? data.products[0] : null
  if (!product) return null

  return {
    imageUrl: firstValidUrl(product.images),
    source: "barcodelookup",
    title: product.title || null,
  }
}

async function lookupOpenFoodFacts(upc) {
  const url = new URL(`${OPEN_FOOD_FACTS_URL}/${upc}`)
  url.searchParams.set("fields", "code,product_name,image_front_url,image_url,selected_images")
  let data
  try {
    data = await fetchJson(url)
  } catch (error) {
    if (error?.status === 404) return null
    throw error
  }
  if (data?.status !== 1 || !data.product) return null

  const product = data.product
  const selectedFront =
    product.selected_images?.front?.display?.en ||
    product.selected_images?.front?.display?.["en-us"] ||
    product.selected_images?.front?.small?.en ||
    product.selected_images?.front?.thumb?.en

  return {
    imageUrl: firstValidUrl([product.image_front_url, selectedFront, product.image_url]),
    source: "openfoodfacts",
    title: product.product_name || null,
  }
}

const providerLookups = {
  barcodelookup: lookupBarcodeLookup,
  upcitemdb: lookupUpcItemDb,
  barcodespider: lookupBarcodeSpider,
  barcodefinder: lookupBarcodeFinder,
  openfoodfacts: lookupOpenFoodFacts,
}

async function lookupWithRetry(upc, providerName, options) {
  const provider = providerLookups[providerName]
  if (!provider) {
    throw new Error(`Unsupported provider: ${providerName}`)
  }

  for (let attempt = 0; attempt <= options.maxRetries; attempt += 1) {
    try {
      return await provider(upc)
    } catch (error) {
      if (!isRateLimitError(error) || attempt === options.maxRetries) {
        throw error
      }

      const waitMs = computeRetryDelayMs(error, attempt, options.delayMs)
      if (waitMs > options.maxRetryDelayMs) {
        throw new Error(
          `Rate limit retry delay ${waitMs}ms exceeds configured max ${options.maxRetryDelayMs}ms for ${providerName}`
        )
      }

      console.log(`rate limited for ${upc} via ${providerName}; retrying in ${waitMs}ms`)
      await sleep(waitMs)
    }
  }

  return null
}

async function lookupImage(upc, options) {
  let lastError = null

  for (const providerName of options.providers) {
    try {
      const result = await lookupWithRetry(upc, providerName, options)
      if (result?.imageUrl) {
        return result
      }
    } catch (error) {
      lastError = error
      console.log(`provider ${providerName} failed for ${upc}: ${error.message}`)
    }
  }

  if (lastError) {
    throw lastError
  }

  return null
}

function shouldProcessProduct(product, overwrite, backendBaseUrl) {
  if (!product?.variants?.[0]?.sku) return false
  if (overwrite) return true
  if (!product.thumbnail) return true
  return !isManagedLocalUrl(product.thumbnail, backendBaseUrl)
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const raw = await fs.readFile(options.seedPath, "utf-8")
  const payload = JSON.parse(raw)
  const cache = await loadCache(options.cachePath)
  const products = Array.isArray(payload.products) ? payload.products : []

  const targets = products
    .filter((product) => shouldProcessProduct(product, options.overwrite, options.backendBaseUrl))
    .slice(0, options.limit ?? products.length)

  console.log(`Loaded ${products.length} products from ${options.seedPath}`)
  console.log(`Processing ${targets.length} products with providers=${options.providers.join(",")} overwrite=${options.overwrite}`)
  console.log(`Using cache file ${options.cachePath}`)
  console.log(`Downloading images to ${options.imageDir}`)

  let updated = 0
  let skipped = 0
  let failed = 0
  let cached = 0
  let downloaded = 0

  for (let index = 0; index < targets.length; index += 1) {
    const product = targets[index]
    const upc = normalizeBarcode(product?.variants?.[0]?.sku || product?.external_id || product?.metadata?.upc)

    if (!upc) {
      skipped += 1
      console.log(`[${index + 1}/${targets.length}] skipped missing UPC for "${product?.title || "unknown"}"`)
      continue
    }

    if (!options.overwrite && isHttpUrl(product.thumbnail)) {
      const didDownloadExisting = await maybeDownloadExistingThumbnail(product, upc, cache, options)
      if (didDownloadExisting) {
        updated += 1
        downloaded += 1
        await writeCache(options.cachePath, cache)
        continue
      }
    }

    const cacheEntry = cache[upc]
    if (shouldSkipCachedLookup(cacheEntry, options.overwrite, options.failureCooldownHours)) {
      await applyCachedResult(product, upc, cacheEntry, cache, options)
      cached += 1
      if (cacheEntry?.status === "found") {
        downloaded += 1
      }
      console.log(`[${index + 1}/${targets.length}] cached ${cacheEntry.status} for ${upc}`)
      await writeCache(options.cachePath, cache)
      continue
    }

    try {
      const result = await lookupImage(upc, options)
      const checkedAt = new Date().toISOString()

      if (result?.imageUrl) {
        await materializeImage(product, upc, result.source, result.imageUrl, cache, options)
        cache[upc].checkedAt = checkedAt
        cache[upc].title = result.title || null
        updated += 1
        downloaded += 1
        console.log(`[${index + 1}/${targets.length}] image found for ${upc} via ${result.source}`)
      } else {
        annotateProduct(product, {
          image_lookup_status: "not_found",
          image_last_checked_at: checkedAt,
        })
        cache[upc] = {
          status: "not_found",
          checkedAt,
          source: options.providers.join(","),
          imageUrl: null,
        }
        skipped += 1
        console.log(`[${index + 1}/${targets.length}] no image for ${upc}`)
      }
    } catch (error) {
      const checkedAt = new Date().toISOString()
      annotateProduct(product, {
        image_lookup_status: "error",
        image_last_checked_at: checkedAt,
      })
      cache[upc] = {
        status: "error",
        checkedAt,
        source: options.providers.join(","),
        imageUrl: null,
        error: error.message,
      }
      failed += 1
      console.error(`[${index + 1}/${targets.length}] lookup failed for ${upc}: ${error.message}`)
    }

    await writeCache(options.cachePath, cache)

    if (index < targets.length - 1 && options.delayMs > 0) {
      await sleep(options.delayMs)
    }
  }

  await fs.writeFile(options.seedPath, `${JSON.stringify(payload, null, 2)}\n`, "utf-8")
  await writeCache(options.cachePath, cache)

  console.log(`Done. updated=${updated} skipped=${skipped} failed=${failed} cached=${cached} downloaded=${downloaded}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
