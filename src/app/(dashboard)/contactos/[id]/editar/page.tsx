'use client'

import { use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useContactoIndice, useContactosIndice } from '@/hooks/useContactosIndice'
import { useAuth } from '@/context/AuthContext'
import { ContactoIndiceForm } from '@/components/contactos/ContactoIndiceForm'
import { ROLES } from '@/types/usuario.types'
import type { CreateContactoIndiceDTO, UpdateContactoIndiceDTO } from '@/types/contacto-indice.types'
import { ArrowLeft, Loader2 } from 'lucide-react'

export default function EditarContactoIndicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { user } = useAuth()
  const router = useRouter()
  const { contacto, isLoading, error } = useContactoIndice(id)
  const { actualizar, isSubmitting } = useContactosIndice()

  useEffect(() => {
    if (user && user.role !== ROLES.ADMIN) {
      router.push(`/contactos/${id}`)
    }
  }, [user, router, id])

  const handleSubmit = async (data: CreateContactoIndiceDTO | UpdateContactoIndiceDTO) => {
    await actualizar(id, data as UpdateContactoIndiceDTO)
    router.push(`/contactos/${id}`)
  }

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
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6">
          {error ?? 'No encontrado'}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href={`/contactos/${id}`}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors w-fit"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al detalle
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Editar entrada</h1>
        <p className="text-gray-500 mt-1">
          Anexo <span className="font-mono font-medium text-gray-700">{contacto.extension}</span>
        </p>
      </div>
      <ContactoIndiceForm
        initialData={contacto}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Guardar cambios"
      />
    </div>
  )
}
