"use client"

import { useEffect, useRef, useState } from "react"
import { trapFocus } from "../lib/focus-trap"

const COOKIE = "ml_age_verified"
const MAX_AGE = 60 * 60 * 24 * 30 // 30 days

function hasCookie(name: string) {
  if (typeof document === "undefined") return false
  return document.cookie.split("; ").some((c) => c.startsWith(`${name}=`))
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=${MAX_AGE}; samesite=lax`
}

export function AgeGate() {
  const [open, setOpen] = useState(false)
  const [denied, setDenied] = useState(false)
  const panelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!hasCookie(COOKIE)) setOpen(true)
  }, [])

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = "hidden"
    const release = panelRef.current ? trapFocus(panelRef.current) : null
    return () => {
      document.body.style.overflow = ""
      release?.()
    }
  }, [open])

  if (!open) return null

  const confirm = () => {
    setCookie(COOKIE, "1")
    setOpen(false)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="w-full max-w-md rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-8 text-center shadow-2xl"
      >
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-gold)]">Mount Liquor</p>
        <h2
          id="age-gate-title"
          className="mt-4 font-serif text-3xl text-[color:var(--color-ink)] md:text-4xl"
        >
          Are you 21 or older?
        </h2>
        <p className="mt-4 text-sm text-[color:var(--color-muted)] leading-relaxed">
          You must be of legal drinking age to enter this site. A valid government-issued ID is required at
          pickup or delivery.
        </p>

        {denied ? (
          <div className="mt-6 rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-bg)] p-5 text-sm text-[color:var(--color-muted)]">
            We&apos;re sorry — you must be 21+ to access this site.
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={confirm}
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-gold)] px-8 py-3 text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--color-bg)] hover:bg-[color:var(--color-gold-hover)] transition-colors"
            >
              I am 21 or older
            </button>
            <button
              type="button"
              onClick={() => setDenied(true)}
              className="inline-flex items-center justify-center rounded-full border border-[color:var(--color-line)] px-8 py-3 text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)] transition-colors"
            >
              I am under 21
            </button>
          </div>
        )}

        <p className="mt-6 text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-muted)]">
          Please drink responsibly
        </p>
      </div>
    </div>
  )
}
