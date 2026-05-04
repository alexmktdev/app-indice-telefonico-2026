// ─────────────────────────────────────────────────────────────
// HOOK: useUsuarios
// Mismo patrón que usePersonas pero para usuarios del sistema.
// Usa fetchWithCsrf para protección CSRF automática.
// ─────────────────────────────────────────────────────────────

'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchWithCsrf } from '@/lib/helpers/csrf-client.helper'
import type { Usuario, CreateUsuarioDTO, UpdateUsuarioDTO } from '@/types/usuario.types'

interface UseUsuariosState {
  usuarios: Usuario[]
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
}

interface UseUsuariosReturn extends UseUsuariosState {
  recargar: () => Promise<void>
  crear: (data: CreateUsuarioDTO) => Promise<Usuario>
  actualizar: (id: string, data: UpdateUsuarioDTO) => Promise<Usuario>
  eliminar: (id: string) => Promise<void>
  limpiarError: () => void
}

export function useUsuarios(): UseUsuariosReturn {
  const [state, setState] = useState<UseUsuariosState>({
    usuarios: [],
    isLoading: true,
    isSubmitting: false,
    error: null,
  })

  const recargar = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    try {
      const usuarios = await fetchWithCsrf<Usuario[]>('/api/usuarios')
      setState(prev => ({ ...prev, usuarios, isLoading: false }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al cargar usuarios',
      }))
    }
  }, [])

  useEffect(() => { recargar() }, [recargar])

  const crear = useCallback(async (data: CreateUsuarioDTO): Promise<Usuario> => {
    setState(prev => ({ ...prev, isSubmitting: true, error: null }))
    try {
      const usuario = await fetchWithCsrf<Usuario>('/api/usuarios', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      setState(prev => ({
        ...prev,
        usuarios: [usuario, ...prev.usuarios],
        isSubmitting: false,
      }))
      return usuario
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al crear'
      setState(prev => ({ ...prev, isSubmitting: false, error: msg }))
      throw error
    }
  }, [])

  const actualizar = useCallback(async (id: string, data: UpdateUsuarioDTO): Promise<Usuario> => {
    setState(prev => ({ ...prev, isSubmitting: true, error: null }))
    try {
      const usuario = await fetchWithCsrf<Usuario>(`/api/usuarios/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      setState(prev => ({
        ...prev,
        usuarios: prev.usuarios.map(u => u.id === id ? usuario : u),
        isSubmitting: false,
      }))
      return usuario
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al actualizar'
      setState(prev => ({ ...prev, isSubmitting: false, error: msg }))
      throw error
    }
  }, [])

  const eliminar = useCallback(async (id: string): Promise<void> => {
    setState(prev => ({ ...prev, isSubmitting: true, error: null }))
    try {
      await fetchWithCsrf<null>(`/api/usuarios/${id}`, { method: 'DELETE' })
      setState(prev => ({
        ...prev,
        usuarios: prev.usuarios.filter(u => u.id !== id),
        isSubmitting: false,
      }))
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al eliminar'
      setState(prev => ({ ...prev, isSubmitting: false, error: msg }))
      throw error
    }
  }, [])

  return {
    ...state,
    recargar,
    crear,
    actualizar,
    eliminar,
    limpiarError: useCallback(() => {
      setState(prev => ({ ...prev, error: null }))
    }, []),
  }
}
