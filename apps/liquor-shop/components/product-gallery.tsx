"use client"

import Image from "next/image"
import { useState } from "react"

type Props = {
  images: string[]
  alt: string
}

export function ProductGallery({ images, alt }: Props) {
  const [active, setActive] = useState(0)
  const current = images[active] ?? images[0]

  return (
    <div className="grid gap-4 md:grid-cols-[96px_1fr] md:items-start">
      <div className="flex md:flex-col gap-3 order-2 md:order-1">
        {images.map((src, index) => (
          <button
            key={`${src}-${index}`}
            type="button"
            aria-label={`View image ${index + 1}`}
            onClick={() => setActive(index)}
            className={`relative aspect-square w-20 overflow-hidden rounded-xl border transition-colors ${
              index === active
                ? "border-[color:var(--color-gold)]"
                : "border-[color:var(--color-line)] hover:border-[color:var(--color-gold)]"
            }`}
          >
            <Image src={src} alt={`${alt} thumbnail ${index + 1}`} fill sizes="80px" className="object-cover" />
          </button>
        ))}
      </div>
      <div className="relative order-1 md:order-2 aspect-square w-full overflow-hidden rounded-2xl bg-[color:var(--color-surface)]">
        <Image
          src={current}
          alt={alt}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 520px"
          className="object-cover"
        />
      </div>
    </div>
  )
}
