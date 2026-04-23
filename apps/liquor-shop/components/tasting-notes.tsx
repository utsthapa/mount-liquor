import type { TastingNote } from "../lib/store"

type Props = {
  notes: TastingNote
  compact?: boolean
}

const icons = {
  nose: (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.4">
      <path d="M12 3v9a3 3 0 0 1-3 3H7" strokeLinecap="round" />
      <path d="M12 3v9a3 3 0 0 0 3 3h2" strokeLinecap="round" />
    </svg>
  ),
  palate: (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.4">
      <path d="M4 11c0-4 3.5-7 8-7s8 3 8 7v1a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6v-1Z" />
    </svg>
  ),
  finish: (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.4">
      <path d="M4 12h16" strokeLinecap="round" />
      <path d="m14 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
}

const rows = [
  { key: "nose", label: "Nose" },
  { key: "palate", label: "Palate" },
  { key: "finish", label: "Finish" },
] as const

export function TastingNotes({ notes, compact = false }: Props) {
  return (
    <div className={compact ? "space-y-4" : "grid gap-6 md:grid-cols-3"}>
      {rows.map((row) => (
        <div key={row.key} className="flex gap-4">
          <span className="text-[color:var(--color-gold)]">{icons[row.key]}</span>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--color-gold)]">
              {row.label}
            </p>
            <p className="mt-1 text-sm text-[color:var(--color-ink)] leading-relaxed">
              {notes[row.key]}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
