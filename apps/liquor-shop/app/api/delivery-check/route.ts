import { NextRequest, NextResponse } from "next/server"
import { storeConfig } from "../../../lib/store"

const serviceableZips = new Set(["75038", "75039", "75060", "75061", "75062", "75063"])

export async function GET(request: NextRequest) {
  const zip = request.nextUrl.searchParams.get("zip")?.trim() || ""
  const available = serviceableZips.has(zip)
  return NextResponse.json({
    available,
    radiusMiles: storeConfig.deliveryRadiusMiles,
    message: available
      ? `Delivery is available to ${zip} within our ${storeConfig.deliveryRadiusMiles}-mile service area.`
      : `Delivery is not currently available to ${zip}. Pickup is still available at ${storeConfig.address}.`,
  })
}
