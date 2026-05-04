'use client'

import type { SVGAttributes } from 'react'

export function SearchIcon({ className, ...rest }: SVGAttributes<SVGSVGElement>) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
      className={className}
      {...rest}
    >
      <circle cx="11" cy="11" r={7} />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  )
}
