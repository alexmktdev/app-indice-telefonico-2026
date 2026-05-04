'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useContactosIndice } from '@/hooks/useContactosIndice'
import { ADMIN_CONTACTOS_PAGE_SIZE } from '@/constants/catalog'
import { Pagination } from '@/components/directorio/Pagination'
import { ROLES } from '@/types/usuario.types'
import type { ContactoIndice } from '@/types/contacto-indice.types'
import { Search, Pencil, Trash2, Eye, Loader2, Phone } from 'lucide-react'

export default function ContactosIndicePage() {
  const { user } = useAuth()
  const { contactos, isLoading, isSubmitting, error, eliminar } = useContactosIndice()
  const [busqueda, setBusqueda] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const isAdmin = user?.role === ROLES.ADMIN

  const filtradas = useMemo(() => {
    const t = busqueda.toLowerCase()
    return contactos.filter(
      (c) =>
        c.extension.includes(t) ||
        c.department.toLowerCase().includes(t) ||
        (c.name ?? '').toLowerCase().includes(t)
    )
  }, [contactos, busqueda])

  const ordenadas = useMemo(
    () =>
      [...filtradas].sort(
        (a, b) => (parseInt(a.extension, 10) || 0) - (parseInt(b.extension, 10) || 0)
      ),
    [filtradas]
  )

  const totalPages = Math.max(1, Math.ceil(ordenadas.length / ADMIN_CONTACTOS_PAGE_SIZE))

  const paginadas = useMemo(() => {
    const start = (currentPage - 1) * ADMIN_CONTACTOS_PAGE_SIZE
    return ordenadas.slice(start, start + ADMIN_CONTACTOS_PAGE_SIZE)
  }, [ordenadas, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [busqueda])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const handleEliminar = async (id: string) => {
    try {
      await eliminar(id)
      setConfirmDelete(null)
    } catch {
      // hook
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Índice telefónico</h1>
        <p className="text-gray-500 mt-1">
          {contactos.length} entrada{contactos.length !== 1 ? 's' : ''} activa
          {contactos.length !== 1 ? 's' : ''}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por anexo, dependencia o nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {ordenadas.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Phone className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No hay resultados</p>
            <p className="text-sm mt-1">
              {busqueda ? 'Prueba otro término' : 'Crea la primera entrada del índice'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Anexo
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dependencia
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Nombre
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginadas.map((row) => (
                  <Row
                    key={row.id}
                    row={row}
                    isAdmin={isAdmin}
                    isDeleting={isSubmitting && confirmDelete === row.id}
                    onDelete={() => setConfirmDelete(row.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
        {ordenadas.length > 0 && (
          <div className="border-t border-gray-100 bg-gray-50/80 px-4 py-3">
            <p className="text-center text-xs text-gray-500 mb-2">
              Mostrando {(currentPage - 1) * ADMIN_CONTACTOS_PAGE_SIZE + 1}–
              {Math.min(currentPage * ADMIN_CONTACTOS_PAGE_SIZE, ordenadas.length)} de{' '}
              {ordenadas.length}
              {busqueda ? ` (filtrado de ${contactos.length})` : ''}
            </p>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              navClassName="mt-0 border-t-0 pb-0 pt-0"
            />
          </div>
        )}
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">¿Eliminar entrada?</h3>
            <p className="text-gray-500 text-sm mb-6">
              Se desactivará el anexo en el índice. No se borra el historial del sistema.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleEliminar(confirmDelete)}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({
  row,
  isAdmin,
  isDeleting,
  onDelete,
}: {
  row: ContactoIndice
  isAdmin: boolean
  isDeleting: boolean
  onDelete: () => void
}) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 text-sm font-mono font-medium text-gray-900">{row.extension}</td>
      <td className="px-6 py-4">
        <p className="text-sm font-medium text-gray-900">{row.department}</p>
        <p className="text-xs text-gray-400 md:hidden">{row.name || '—'}</p>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600 hidden md:table-cell">{row.name || '—'}</td>
      <td className="px-6 py-4">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Link
            href={`/contactos/${row.id}`}
            title="Ver ficha"
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-2.5 py-2 text-xs font-bold text-white shadow-md ring-1 ring-white/25 transition hover:bg-brand-dark hover:shadow-lg active:scale-[0.98]"
          >
            <Eye className="h-4 w-4 shrink-0" strokeWidth={2.25} />
            <span className="hidden min-[480px]:inline">Ver</span>
          </Link>
          {isAdmin && (
            <>
              <Link
                href={`/contactos/${row.id}/editar`}
                title="Editar anexo"
                className="inline-flex items-center gap-1.5 rounded-lg bg-corporate-green px-2.5 py-2 text-xs font-bold text-white shadow-md ring-1 ring-white/30 transition hover:bg-corporate-green-dark hover:shadow-lg active:scale-[0.98]"
              >
                <Pencil className="h-4 w-4 shrink-0" strokeWidth={2.25} />
                <span className="hidden min-[480px]:inline">Editar</span>
              </Link>
              <button
                type="button"
                onClick={onDelete}
                disabled={isDeleting}
                title="Desactivar anexo"
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-2.5 py-2 text-xs font-bold text-white shadow-md ring-1 ring-rose-400/40 transition hover:bg-rose-700 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:bg-rose-600"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 shrink-0" strokeWidth={2.25} />
                )}
                <span className="hidden min-[480px]:inline">
                  {isDeleting ? 'Eliminando' : 'Eliminar'}
                </span>
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  )
}
