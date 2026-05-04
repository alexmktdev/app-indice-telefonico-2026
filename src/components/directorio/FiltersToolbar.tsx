'use client'

import { VisuallyHidden } from './VisuallyHidden'
import { SearchIcon } from './SearchIcon'

export type FiltersToolbarProps = {
  query: string
  onQueryChange: (value: string) => void
  department: string
  onDepartmentChange: (value: string) => void
  departments: readonly string[]
  searchInputId?: string
  departmentSelectId?: string
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

export function FiltersToolbar({
  query,
  onQueryChange,
  department,
  onDepartmentChange,
  departments,
  searchInputId = 'directory-search',
  departmentSelectId = 'directory-department',
}: FiltersToolbarProps) {
  return (
    <section
      className="flex flex-col gap-4 md:flex-row md:items-end"
      aria-label="Filtros del directorio"
    >
      <div className="relative min-w-0 flex-1">
        <VisuallyHidden as="label" htmlFor={searchInputId}>
          Buscar
        </VisuallyHidden>
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          id={searchInputId}
          type="search"
          placeholder="Nombre, dependencia, anexo o número completo…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          autoComplete="off"
          className="w-full rounded-xl border border-border-molina bg-white py-3.5 pl-11 pr-4 text-base text-foreground transition focus:border-corporate-green focus:outline-none focus:ring-4 focus:ring-corporate-green/35"
        />
      </div>
      <div className="flex min-w-0 flex-col gap-1.5 md:min-w-[280px]">
        <label
          htmlFor={departmentSelectId}
          className="text-xs font-semibold uppercase tracking-wide text-muted"
        >
          Dependencia
        </label>
        <div className="relative">
          <select
            id={departmentSelectId}
            value={department}
            onChange={(e) => onDepartmentChange(e.target.value)}
            className="w-full cursor-pointer appearance-none rounded-xl border border-border-molina bg-white py-3.5 pl-4 pr-10 text-[0.9375rem] text-foreground transition focus:border-corporate-green focus:outline-none focus:ring-4 focus:ring-corporate-green/35"
          >
            <option value="">Todas</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-brand" />
        </div>
      </div>
    </section>
  )
}
