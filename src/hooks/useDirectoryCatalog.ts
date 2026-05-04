'use client'

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { CatalogContact } from '@/types/contacto-indice.types'
import { MOBILE_PAGINATION_SCROLL_MQ } from '@/constants/catalog'
import { filterAndSortContacts, uniqueDepartmentsSorted } from '@/lib/directorio/contactQueries'

function isMobileViewportForPaginationScroll(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia(MOBILE_PAGINATION_SCROLL_MQ).matches
}

function scrollWindowToTop(): void {
  window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
}

export function useDirectoryCatalog(source: readonly CatalogContact[], pageSize: number) {
  const [query, setQueryState] = useState('')
  const [department, setDepartmentState] = useState('')
  const [page, setPage] = useState(1)
  const scrollAfterPageChangeRef = useRef(false)

  const setQuery = useCallback((value: string) => {
    setQueryState(value)
    setPage(1)
  }, [])

  const setDepartment = useCallback((value: string) => {
    setDepartmentState(value)
    setPage(1)
  }, [])

  const resetFilters = useCallback(() => {
    setQueryState('')
    setDepartmentState('')
    setPage(1)
  }, [])

  const departments = useMemo(() => uniqueDepartmentsSorted(source), [source])

  const filtered = useMemo(
    () => filterAndSortContacts(source, { query, department }),
    [source, query, department],
  )

  const totalPages =
    filtered.length === 0 ? 0 : Math.max(1, Math.ceil(filtered.length / pageSize))

  const currentPage = totalPages === 0 ? 1 : Math.min(Math.max(1, page), totalPages)

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, currentPage, pageSize])

  const rangeStart = filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const rangeEnd = Math.min(currentPage * pageSize, filtered.length)

  const goToPage = useCallback(
    (targetPage: number) => {
      if (totalPages < 1) return
      const next = Math.min(Math.max(1, targetPage), totalPages)
      if (next === currentPage) return
      scrollAfterPageChangeRef.current = true
      setPage(next)
    },
    [totalPages, currentPage],
  )

  useLayoutEffect(() => {
    if (!scrollAfterPageChangeRef.current) return
    scrollAfterPageChangeRef.current = false
    if (!isMobileViewportForPaginationScroll()) return
    requestAnimationFrame(() => {
      scrollWindowToTop()
    })
  }, [currentPage])

  return {
    query,
    setQuery,
    department,
    setDepartment,
    departments,
    filtered,
    pageItems,
    totalInCatalog: source.length,
    totalPages,
    currentPage,
    goToPage,
    resetFilters,
    rangeStart,
    rangeEnd,
  }
}
