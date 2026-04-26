import fs from "node:fs/promises"
import path from "node:path"
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

const IMAGE_DIR = path.join(process.cwd(), "data", "catalog-images")

const contentTypes: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
}

function sanitizeFilename(value: string) {
  return path.basename(String(value || ""))
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const file = sanitizeFilename(String(req.query.file || ""))
  if (!file) {
    res.status(400).json({ message: "Missing file query parameter" })
    return
  }

  const target = path.join(IMAGE_DIR, file)
  if (!target.startsWith(IMAGE_DIR)) {
    res.status(400).json({ message: "Invalid file path" })
    return
  }

  try {
    const buffer = await fs.readFile(target)
    const ext = path.extname(file).toLowerCase()
    res.setHeader("Content-Type", contentTypes[ext] || "application/octet-stream")
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable")
    res.send(buffer)
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      res.status(404).json({ message: "Image not found" })
      return
    }
    throw error
  }
}
