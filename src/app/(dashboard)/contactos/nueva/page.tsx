'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useContactosIndice } from '@/hooks/useContactosIndice'
import { ContactoIndiceForm } from '@/components/contactos/ContactoIndiceForm'
import { ROLES } from '@/types/usuario.types'
import type { CreateContactoIndiceDTO, UpdateContactoIndiceDTO } from '@/types/contacto-indice.types'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'

export default function NuevaEntradaIndicePage() {
  const { user } = useAuth()
  const { crear, isSubmitting } = useContactosIndice()
  const router = useRouter()

  useEffect(() => {
    if (user && user.role !== ROLES.ADMIN) {
      router.push('/contactos')
    }
  }, [user, router])

  const handleSubmit = async (data: CreateContactoIndiceDTO | UpdateContactoIndiceDTO) => {
    await crear(data as CreateContactoIndiceDTO)
    router.push('/contactos')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/contactos"
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors w-fit"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Agregar nuevo anexo</h1>
        <p className="text-gray-500 mt-1">Agrega un anexo al índice telefónico público</p>
      </div>
      <ContactoIndiceForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Guardar nuevo anexo"
      />
    </div>
  )
}
