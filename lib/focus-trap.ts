const FOCUSABLE =
  'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function trapFocus(container: HTMLElement): () => void {
  const previouslyFocused = document.activeElement as HTMLElement | null

  const focusables = () =>
    Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => !el.hasAttribute("aria-hidden") && el.offsetParent !== null,
    )

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return
    const els = focusables()
    if (els.length === 0) {
      e.preventDefault()
      container.focus()
      return
    }
    const first = els[0]
    const last = els[els.length - 1]
    const active = document.activeElement as HTMLElement | null
    if (e.shiftKey && active === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && active === last) {
      e.preventDefault()
      first.focus()
    }
  }

  document.addEventListener("keydown", onKeyDown)
  const initial = focusables()[0] ?? container
  initial.focus({ preventScroll: true })

  return () => {
    document.removeEventListener("keydown", onKeyDown)
    previouslyFocused?.focus({ preventScroll: true })
  }
}
