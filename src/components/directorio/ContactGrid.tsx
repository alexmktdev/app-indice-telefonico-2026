'use client'

import type { ReactNode } from 'react'

export function ContactGrid({ children }: { children: ReactNode }) {
  return (
    <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 min-[560px]:grid-cols-2 min-[900px]:grid-cols-3">
      {children}
    </ul>
  )
}
