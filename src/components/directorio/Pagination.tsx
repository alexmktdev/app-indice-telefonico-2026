'use client'

import { twMerge } from 'tailwind-merge'

const NAV_BTN =
  'cursor-pointer rounded-[10px] border border-border-molina bg-white px-4 py-2 text-sm font-semibold text-brand transition hover:border-corporate-green hover:bg-corporate-green/15 hover:text-brand-dark disabled:cursor-not-allowed disabled:opacity-40'

const PAGE_BTN_BASE =
  'min-h-[2.35rem] min-w-[2.35rem] cursor-pointer rounded-[10px] px-2 text-sm font-semibold transition'

const PAGE_BTN_INACTIVE = `${PAGE_BTN_BASE} border border-border-molina bg-white text-foreground hover:border-brand hover:text-brand`

const PAGE_BTN_ACTIVE = `${PAGE_BTN_BASE} z-10 border border-brand bg-brand text-white shadow-md ring-2 ring-corporate-green ring-offset-2 ring-offset-white hover:border-brand-dark hover:bg-brand-dark hover:text-white hover:ring-offset-white`

export type PaginationProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  /** Clases extra para el `<nav>` (p. ej. márgenes en tablas admin) */
  navClassName?: string
  labels?: {
    previous: string
    next: string
  }
}

const DEFAULT_LABELS = {
  previous: 'Anterior',
  next: 'Siguiente',
} as const

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  navClassName,
  labels = DEFAULT_LABELS,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <nav
      className={twMerge(
        'mt-7 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-border-light pb-1 pt-4',
        navClassName
      )}
      aria-label="Paginación de resultados"
    >
      <button
        type="button"
        className={NAV_BTN}
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        {labels.previous}
      </button>
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {pages.map((n) => (
          <button
            key={n}
            type="button"
            className={n === currentPage ? PAGE_BTN_ACTIVE : PAGE_BTN_INACTIVE}
            onClick={() => onPageChange(n)}
            aria-current={n === currentPage ? 'page' : undefined}
          >
            {n}
          </button>
        ))}
      </div>
      <button
        type="button"
        className={NAV_BTN}
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        {labels.next}
      </button>
    </nav>
  )
}
