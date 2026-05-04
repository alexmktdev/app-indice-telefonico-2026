'use client'

import { use } from 'react'
import Link from 'next/link'
import { useContactoIndice } from '@/hooks/useContactosIndice'
import { useAuth } from '@/context/AuthContext'
import { ROLES } from '@/types/usuario.types'
import { ArrowLeft, Pencil, Hash, Building2, User, Loader2, Calendar } from 'lucide-react'
import { fullPhoneNumber, PHONE_PREFIX } from '@/lib/directorio/phone'

function DetailField({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
        <Icon className="h-4 w-4 text-gray-500" />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-sm text-gray-900 mt-0.5 font-medium">{value}</p>
      </div>
    </div>
  )
}

export default function ContactoIndiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { contacto, isLoading, error } = useContactoIndice(id)
  const { user } = useAuth()
  const isAdmin = user?.role === ROLES.ADMIN

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error || !contacto) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Link
          href="/contactos"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al índice
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6">
          {error ?? 'Entrada no encontrada'}
        </div>
      </div>
    )
  }

  const numeroCompleto = fullPhoneNumber(contacto.extension)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/contactos"
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors w-fit"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al índice
      </Link>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0 font-mono text-xl font-bold text-blue-800">
            {contacto.extension}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{contacto.department}</h1>
            <p className="text-gray-500 mt-1">
              Prefijo municipal <span className="font-mono font-semibold">{PHONE_PREFIX}</span>
            </p>
          </div>
        </div>
        {isAdmin && (
          <Link
            href={`/contactos/${id}/editar`}
            className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Pencil className="h-4 w-4" />
            Editar
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-5">Datos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <DetailField label="Anexo" value={contacto.extension} icon={Hash} />
          <DetailField label="Número completo" value={numeroCompleto} icon={Hash} />
          <DetailField label="Dependencia" value={contacto.department} icon={Building2} />
          <DetailField
            label="Nombre en índice"
            value={contacto.name?.trim() ? contacto.name : '—'}
            icon={User}
          />
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
          Registro
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-500">
          <p className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            Creado:{' '}
            {new Date(contacto.createdAt).toLocaleDateString('es-CL', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </p>
          <p>
            Actualizado:{' '}
            {new Date(contacto.updatedAt).toLocaleDateString('es-CL', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>
    </div>
  )
}
