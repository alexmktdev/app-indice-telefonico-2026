// ─────────────────────────────────────────────────────────────
// PÁGINA: Gestión de usuarios del sistema
// URL: /usuarios
// Acceso: Solo Admin
// ─────────────────────────────────────────────────────────────

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useUsuarios } from '@/hooks/useUsuarios'
import { ROLES } from '@/types/usuario.types'
import type { Usuario, CreateUsuarioDTO, UpdateUsuarioDTO } from '@/types/usuario.types'
import { UserPlus, Pencil, Trash2, Loader2, Shield, Eye, CheckCircle, XCircle } from 'lucide-react'
import { UsuarioModal } from '@/components/usuarios/UsuarioModal'

// ── Badge de rol ──────────────────────────────────────────────
function RoleBadge({ role }: { role: string }) {
  const isAdmin = role === ROLES.ADMIN
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
      {isAdmin ? <Shield className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
      {isAdmin ? 'Admin' : 'User'}
    </span>
  )
}

// ── Badge de estado ───────────────────────────────────────────
function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
      {isActive ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
      {isActive ? 'Activo' : 'Inactivo'}
    </span>
  )
}

// ── Página principal ──────────────────────────────────────────
export default function UsuariosPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { usuarios, isLoading, isSubmitting, error, crear, actualizar, eliminar } = useUsuarios()

  const [modalOpen, setModalOpen] = useState(false)
  const [usuarioEditar, setUsuarioEditar] = useState<Usuario | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  // Protección: solo admin
  useEffect(() => {
    if (user && user.role !== ROLES.ADMIN) {
      router.push('/')
    }
  }, [user, router])

  const handleOpenEditar = (u: Usuario) => {
    setUsuarioEditar(u)
    setModalOpen(true)
  }

  const handleSave = async (data: CreateUsuarioDTO | UpdateUsuarioDTO) => {
    if (usuarioEditar) {
      await actualizar(usuarioEditar.id, data as UpdateUsuarioDTO)
    } else {
      await crear(data as CreateUsuarioDTO)
    }
    setModalOpen(false)
  }

  const handleEliminar = async (id: string) => {
    await eliminar(id)
    setConfirmDelete(null)
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
        <h1 className="text-2xl font-bold text-gray-900">Usuarios del sistema</h1>
        <p className="mt-1 text-gray-500">
          {usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''} registrado
          {usuarios.length !== 1 ? 's' : ''}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {usuarios.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <UserPlus className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No hay usuarios registrados</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Estado</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {usuarios.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">
                      {u.displayName}
                      {u.id === user?.uid && <span className="ml-2 text-xs text-gray-400">(tú)</span>}
                    </p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </td>
                  <td className="px-6 py-4"><RoleBadge role={u.role} /></td>
                  <td className="px-6 py-4 hidden sm:table-cell"><StatusBadge isActive={u.isActive} /></td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditar(u)}
                        title="Editar usuario"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-corporate-green px-2.5 py-2 text-xs font-bold text-white shadow-md ring-1 ring-white/30 transition hover:bg-corporate-green-dark hover:shadow-lg active:scale-[0.98]"
                      >
                        <Pencil className="h-4 w-4 shrink-0" strokeWidth={2.25} />
                        <span className="hidden min-[480px]:inline">Editar</span>
                      </button>
                      {u.id !== user?.uid && (
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(u.id)}
                          title="Eliminar usuario"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-2.5 py-2 text-xs font-bold text-white shadow-md ring-1 ring-rose-400/40 transition hover:bg-rose-700 hover:shadow-lg active:scale-[0.98]"
                        >
                          <Trash2 className="h-4 w-4 shrink-0" strokeWidth={2.25} />
                          <span className="hidden min-[480px]:inline">Eliminar</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <UsuarioModal
          key={usuarioEditar?.id ?? 'nuevo'}
          usuario={usuarioEditar}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          isSubmitting={isSubmitting}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">¿Eliminar usuario?</h3>
            <p className="text-gray-500 text-sm mb-6">El usuario perderá acceso al sistema inmediatamente.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={() => handleEliminar(confirmDelete)} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2">
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
