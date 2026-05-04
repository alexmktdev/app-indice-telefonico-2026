export type ResultsMetaInput = {
  filteredCount: number
  totalInCatalog: number
  totalPages: number
  rangeStart: number
  rangeEnd: number
}

export function formatResultsMetaMessage(input: ResultsMetaInput): string {
  const { filteredCount, totalInCatalog, totalPages, rangeStart, rangeEnd } = input

  if (filteredCount === 0) return 'Sin resultados'

  if (filteredCount === totalInCatalog) {
    return totalPages > 1
      ? `Mostrando ${rangeStart}–${rangeEnd} de ${totalInCatalog} contactos`
      : `${totalInCatalog} contactos`
  }

  return totalPages > 1
    ? `Mostrando ${rangeStart}–${rangeEnd} de ${filteredCount} (filtrados de ${totalInCatalog})`
    : `${filteredCount} de ${totalInCatalog} contactos`
}
