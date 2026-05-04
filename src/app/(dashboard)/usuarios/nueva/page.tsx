'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useUsuarios } from '@/hooks/useUsuarios'
import { UsuarioModal } from '@/components/usuarios/UsuarioModal'
import { ROLES } from '@/types/usuario.types'
import type { CreateUsuarioDTO, UpdateUsuarioDTO } from '@/types/usuario.types'

export default function NuevaUsuarioPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { crear, isSubmitting, error } = useUsuarios()

  useEffect(() => {
    if (user && user.role !== ROLES.ADMIN) {
      router.replace('/')
    }
  }, [user, router])

  const handleSave = async (data: CreateUsuarioDTO | UpdateUsuarioDTO) => {
    await crear(data as CreateUsuarioDTO)
    router.push('/usuarios')
  }

  if (!user || user.role !== ROLES.ADMIN) {
    return null
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Link
        href="/usuarios"
        className="inline-flex w-fit items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al listado
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo usuario</h1>
        <p className="mt-1 text-sm text-gray-500">Completa los datos para dar acceso al panel.</p>
      </div>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <UsuarioModal
        variant="inline"
        usuario={null}
        onClose={() => router.push('/usuarios')}
        onSave={handleSave}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}
