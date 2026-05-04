import type { CatalogContact } from '@/types/contacto-indice.types'
import { fullPhoneNumber } from '@/lib/directorio/phone'

export function compareExtensions(a: string, b: string): number {
  return (parseInt(a, 10) || 0) - (parseInt(b, 10) || 0)
}

export function uniqueDepartmentsSorted(contacts: readonly CatalogContact[]): string[] {
  const set = new Set(contacts.map((c) => c.department))
  return [...set].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }))
}

export function matchesContactSearch(contact: CatalogContact, rawQuery: string): boolean {
  const q = rawQuery.trim().toLowerCase()
  if (!q) return true
  return (
    contact.extension.includes(q) ||
    contact.department.toLowerCase().includes(q) ||
    contact.name.toLowerCase().includes(q) ||
    fullPhoneNumber(contact.extension).includes(q.replace(/\s/g, ''))
  )
}

export type DirectoryFilters = {
  query: string
  department: string
}

export function filterContacts(
  contacts: readonly CatalogContact[],
  filters: DirectoryFilters,
): CatalogContact[] {
  return contacts
    .filter((c) => (filters.department ? c.department === filters.department : true))
    .filter((c) => matchesContactSearch(c, filters.query))
}

export function filterAndSortContacts(
  contacts: readonly CatalogContact[],
  filters: DirectoryFilters,
): CatalogContact[] {
  return [...filterContacts(contacts, filters)].sort((a, b) =>
    compareExtensions(a.extension, b.extension),
  )
}
