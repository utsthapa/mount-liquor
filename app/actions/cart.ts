"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { medusa, MEDUSA_REGION_ID, isMedusaConfigured, CART_COOKIE } from "../../lib/medusa"

async function getOrCreateCartId(): Promise<string | null> {
  if (!isMedusaConfigured || !medusa) return null
  const jar = await cookies()
  const existing = jar.get(CART_COOKIE)?.value
  if (existing) {
    try {
      await medusa.store.cart.retrieve(existing)
      return existing
    } catch {
      // fall through and create new
    }
  }
  const { cart } = await medusa.store.cart.create({
    ...(MEDUSA_REGION_ID ? { region_id: MEDUSA_REGION_ID } : {}),
  })
  jar.set(CART_COOKIE, cart.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  })
  return cart.id
}

export async function getCart() {
  if (!isMedusaConfigured || !medusa) return null
  const jar = await cookies()
  const id = jar.get(CART_COOKIE)?.value
  if (!id) return null
  try {
    const { cart } = await medusa.store.cart.retrieve(id)
    return cart
  } catch {
    return null
  }
}

export async function addToCart(variantId: string, quantity = 1) {
  if (!isMedusaConfigured || !medusa) {
    return { ok: false, error: "Medusa not configured" }
  }
  const cartId = await getOrCreateCartId()
  if (!cartId) return { ok: false, error: "Could not create cart" }
  try {
    const { cart } = await medusa.store.cart.createLineItem(cartId, {
      variant_id: variantId,
      quantity,
    })
    revalidatePath("/")
    return { ok: true, cart }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" }
  }
}

export async function updateLineItem(lineItemId: string, quantity: number) {
  if (!isMedusaConfigured || !medusa) return { ok: false, error: "Medusa not configured" }
  const jar = await cookies()
  const cartId = jar.get(CART_COOKIE)?.value
  if (!cartId) return { ok: false, error: "No cart" }
  try {
    const { cart } = await medusa.store.cart.updateLineItem(cartId, lineItemId, { quantity })
    revalidatePath("/")
    return { ok: true, cart }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" }
  }
}

type AddressInput = {
  first_name: string
  last_name: string
  address_1: string
  address_2?: string
  city: string
  province: string
  postal_code: string
  country_code?: string
  phone?: string
}

export async function setCartContact(input: { email: string; phone?: string }) {
  if (!isMedusaConfigured || !medusa) return { ok: false, error: "Medusa not configured" }
  const jar = await cookies()
  const cartId = jar.get(CART_COOKIE)?.value
  if (!cartId) return { ok: false, error: "No cart" }
  try {
    const { cart } = await medusa.store.cart.update(cartId, { email: input.email })
    return { ok: true, cart }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" }
  }
}

export async function setCartAddress(input: { shipping: AddressInput; billing?: AddressInput }) {
  if (!isMedusaConfigured || !medusa) return { ok: false, error: "Medusa not configured" }
  const jar = await cookies()
  const cartId = jar.get(CART_COOKIE)?.value
  if (!cartId) return { ok: false, error: "No cart" }
  try {
    const shipping = { country_code: "us", ...input.shipping }
    const billing = input.billing ? { country_code: "us", ...input.billing } : shipping
    const { cart } = await medusa.store.cart.update(cartId, {
      shipping_address: shipping,
      billing_address: billing,
    })
    return { ok: true, cart }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" }
  }
}

export async function listShippingOptions() {
  if (!isMedusaConfigured || !medusa) return { ok: false, error: "Medusa not configured", options: [] }
  const jar = await cookies()
  const cartId = jar.get(CART_COOKIE)?.value
  if (!cartId) return { ok: false, error: "No cart", options: [] }
  try {
    const { shipping_options } = await medusa.store.fulfillment.listCartOptions({ cart_id: cartId })
    return { ok: true, options: shipping_options }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error", options: [] }
  }
}

export async function setShippingMethod(optionId: string) {
  if (!isMedusaConfigured || !medusa) return { ok: false, error: "Medusa not configured" }
  const jar = await cookies()
  const cartId = jar.get(CART_COOKIE)?.value
  if (!cartId) return { ok: false, error: "No cart" }
  try {
    const { cart } = await medusa.store.cart.addShippingMethod(cartId, { option_id: optionId })
    return { ok: true, cart }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" }
  }
}

export async function initPaymentSession(providerId: string) {
  if (!isMedusaConfigured || !medusa) return { ok: false, error: "Medusa not configured" }
  const jar = await cookies()
  const cartId = jar.get(CART_COOKIE)?.value
  if (!cartId) return { ok: false, error: "No cart" }
  try {
    const { cart } = await medusa.store.cart.retrieve(cartId)
    const { payment_collection } = await medusa.store.payment.initiatePaymentSession(cart, {
      provider_id: providerId,
    })
    return { ok: true, paymentCollection: payment_collection }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" }
  }
}

export async function completeCart() {
  if (!isMedusaConfigured || !medusa) return { ok: false, error: "Medusa not configured" }
  const jar = await cookies()
  const cartId = jar.get(CART_COOKIE)?.value
  if (!cartId) return { ok: false, error: "No cart" }
  try {
    const result = await medusa.store.cart.complete(cartId)
    if (result.type === "order") {
      jar.delete(CART_COOKIE)
      return { ok: true, order: result.order }
    }
    return { ok: false, error: "Cart not completed" }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" }
  }
}
