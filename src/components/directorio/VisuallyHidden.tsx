'use client'

import type { ReactNode } from 'react'

type VisuallyHiddenProps = {
  children: ReactNode
  as?: 'span' | 'label'
  htmlFor?: string
}

export function VisuallyHidden({ children, as: Tag = 'span', htmlFor }: VisuallyHiddenProps) {
  if (Tag === 'label') {
    return (
      <label className="sr-only" htmlFor={htmlFor}>
        {children}
      </label>
    )
  }
  return <span className="sr-only">{children}</span>
}
