'use client'

import { useMemo } from 'react'
import { fullPhoneNumber, PHONE_PREFIX, telHref } from '@/lib/directorio/phone'
import { DIRECTORY_PAGE_SIZE, LOGO_SRC } from '@/constants/catalog'
import { formatResultsMetaMessage } from '@/lib/formatResultsMeta'
import { useCopyFeedback } from '@/hooks/useCopyFeedback'
import { useDirectoryCatalog } from '@/hooks/useDirectoryCatalog'
import type { CatalogContact } from '@/types/contacto-indice.types'
import { ContactCard } from '@/components/directorio/ContactCard'
import { ContactGrid } from '@/components/directorio/ContactGrid'
import { EmptyState } from '@/components/directorio/EmptyState'
import { FiltersToolbar } from '@/components/directorio/FiltersToolbar'
import { Hero } from '@/components/directorio/Hero'
import { Pagination } from '@/components/directorio/Pagination'
import { ResultsMeta } from '@/components/directorio/ResultsMeta'

type Props = {
  initialContacts: CatalogContact[]
}

export function DirectoryHome({ initialContacts }: Props) {
  const {
    query,
    setQuery,
    department,
    setDepartment,
    departments,
    filtered,
    pageItems,
    totalInCatalog,
    totalPages,
    currentPage,
    goToPage,
    resetFilters,
    rangeStart,
    rangeEnd,
  } = useDirectoryCatalog(initialContacts, DIRECTORY_PAGE_SIZE)

  const { copiedKey, copy } = useCopyFeedback()

  const metaMessage = useMemo(
    () =>
      formatResultsMetaMessage({
        filteredCount: filtered.length,
        totalInCatalog,
        totalPages,
        rangeStart,
        rangeEnd,
      }),
    [filtered.length, totalInCatalog, totalPages, rangeStart, rangeEnd],
  )

  return (
    <div className="font-sans flex w-full flex-col overflow-x-clip">
      <Hero
        logoSrc={LOGO_SRC}
        logoAlt="Logotipo oficial Municipalidad de Molina"
        eyebrow="Municipalidad de Molina"
        title="Índice telefónico"
        phonePrefix={PHONE_PREFIX}
      />

      <div className="flex flex-col overflow-x-clip bg-[linear-gradient(180deg,var(--color-surface-2)_0%,var(--color-surface)_320px)]">
        <div className="app-zoom-content w-full">
          <main className="mx-auto w-full max-w-[1100px] px-4 py-5 sm:px-5 md:py-8">
            <FiltersToolbar
              query={query}
              onQueryChange={setQuery}
              department={department}
              onDepartmentChange={setDepartment}
              departments={departments}
            />

            <ResultsMeta message={metaMessage} />

            {filtered.length === 0 ? (
              <EmptyState
                message="No hay resultados para tu búsqueda."
                actionLabel="Limpiar filtros"
                onAction={resetFilters}
              />
            ) : (
              <section className="scroll-mt-8 scroll-pt-2" aria-label="Listado de contactos">
                <ContactGrid>
                  {pageItems.map((contact) => (
                    <ContactCard
                      key={contact.extension}
                      contact={contact}
                      fullNumber={fullPhoneNumber(contact.extension)}
                      callHref={telHref(contact.extension)}
                      onCopyNumber={() =>
                        copy(fullPhoneNumber(contact.extension), contact.extension)
                      }
                      copyButtonLabel={
                        copiedKey === contact.extension ? 'Copiado' : 'Copiar número'
                      }
                    />
                  ))}
                </ContactGrid>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={goToPage}
                />
              </section>
            )}

            <p className="mt-10 text-center text-sm text-muted">
              Desarrollado por departamento de informática - Ilustre Municipalidad de Molina
            </p>
          </main>
        </div>
      </div>
    </div>
  )
}
