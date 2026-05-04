'use client'

import { useState } from 'react'
import { ROLES } from '@/types/usuario.types'
import type { Usuario, CreateUsuarioDTO, UpdateUsuarioDTO } from '@/types/usuario.types'
import { Shield, Eye, Loader2 } from 'lucide-react'

type UsuarioModalProps = {
  usuario: Usuario | null
  onClose: () => void
  onSave: (data: CreateUsuarioDTO | UpdateUsuarioDTO) => Promise<void>
  isSubmitting: boolean
  /** Sin overlay: formulario embebido (p. ej. /usuarios/nueva) */
  variant?: 'overlay' | 'inline'
}

export function UsuarioModal({
  usuario,
  onClose,
  onSave,
  isSubmitting,
  variant = 'overlay',
}: UsuarioModalProps) {
  const isEditing = usuario !== null
  const [formData, setFormData] = useState({
    email: usuario?.email ?? '',
    password: '',
    displayName: usuario?.displayName ?? '',
    role: usuario?.role ?? ROLES.USER,
  })
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setError(null)
    try {
      if (isEditing) {
        await onSave({
          displayName: formData.displayName,
          role: formData.role as typeof ROLES.ADMIN | typeof ROLES.USER,
        })
      } else {
        await onSave(formData as CreateUsuarioDTO)
      }
    } catch (err) {
      if (err instanceof Error) {
        try {
          const parsedError = JSON.parse(err.message)
          if (typeof parsedError === 'object' && parsedError !== null) {
            const messages = Object.entries(parsedError)
              .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(', ')}`)
              .join(' | ')
            setError(messages)
            return
          }
        } catch {
          setError(err.message)
        }
      } else {
        setError('Error al guardar')
      }
    }
  }

  const inner = (
    <div
      className={`bg-white shadow-xl ${variant === 'overlay' ? 'rounded-xl p-6 max-w-md w-full' : 'rounded-xl border border-gray-200 p-6 max-w-md w-full mx-auto'}`}
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-5">
        {isEditing ? 'Editar usuario' : 'Nuevo usuario'}
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
          <input
            type="text"
            value={formData.displayName}
            onChange={(e) => setFormData((p) => ({ ...p, displayName: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-400"
            placeholder="Juan González"
          />
        </div>

        {!isEditing && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-400"
                placeholder="usuario@empresa.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-400"
                placeholder="Mínimo 8 caracteres"
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData((p) => ({ ...p, role: ROLES.ADMIN }))}
              className={`flex items-center gap-2 p-3 rounded-lg border-2 text-sm font-medium transition-colors text-left ${
                formData.role === ROLES.ADMIN
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <Shield className="h-4 w-4 flex-shrink-0" />
              <div>
                <p className="font-medium">Admin</p>
                <p className="text-xs opacity-70">Acceso total</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setFormData((p) => ({ ...p, role: ROLES.USER }))}
              className={`flex items-center gap-2 p-3 rounded-lg border-2 text-sm font-medium transition-colors text-left ${
                formData.role === ROLES.USER
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <Eye className="h-4 w-4 flex-shrink-0" />
              <div>
                <p className="font-medium">User</p>
                <p className="text-xs opacity-70">Solo lectura</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-end mt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-lg bg-brand-dark px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-deep disabled:opacity-50"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  )

  if (variant === 'inline') {
    return inner
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">{inner}</div>
  )
}
