'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchWithCsrf } from '@/lib/helpers/csrf-client.helper'
import type {
  ContactoIndice,
  CreateContactoIndiceDTO,
  UpdateContactoIndiceDTO,
} from '@/types/contacto-indice.types'

interface State {
  contactos: ContactoIndice[]
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
}

interface Return extends State {
  recargar: () => Promise<void>
  crear: (data: CreateContactoIndiceDTO) => Promise<ContactoIndice>
  actualizar: (id: string, data: UpdateContactoIndiceDTO) => Promise<ContactoIndice>
  eliminar: (id: string) => Promise<void>
  limpiarError: () => void
}

export function useContactosIndice(): Return {
  const [state, setState] = useState<State>({
    contactos: [],
    isLoading: true,
    isSubmitting: false,
    error: null,
  })

  const recargar = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      const contactos = await fetchWithCsrf<ContactoIndice[]>('/api/contactos')
      setState((prev) => ({ ...prev, contactos, isLoading: false }))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al cargar el índice',
      }))
    }
  }, [])

  useEffect(() => {
    void recargar()
  }, [recargar])

  const crear = useCallback(async (data: CreateContactoIndiceDTO): Promise<ContactoIndice> => {
    setState((prev) => ({ ...prev, isSubmitting: true, error: null }))
    try {
      const contacto = await fetchWithCsrf<ContactoIndice>('/api/contactos', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      setState((prev) => ({
        ...prev,
        contactos: [contacto, ...prev.contactos],
        isSubmitting: false,
      }))
      return contacto
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al crear'
      setState((prev) => ({ ...prev, isSubmitting: false, error: msg }))
      throw error
    }
  }, [])

  const actualizar = useCallback(
    async (id: string, data: UpdateContactoIndiceDTO): Promise<ContactoIndice> => {
      setState((prev) => ({ ...prev, isSubmitting: true, error: null }))
      try {
        const contacto = await fetchWithCsrf<ContactoIndice>(`/api/contactos/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        })
        setState((prev) => ({
          ...prev,
          contactos: prev.contactos.map((c) => (c.id === id ? contacto : c)),
          isSubmitting: false,
        }))
        return contacto
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Error al actualizar'
        setState((prev) => ({ ...prev, isSubmitting: false, error: msg }))
        throw error
      }
    },
    []
  )

  const eliminar = useCallback(async (id: string): Promise<void> => {
    setState((prev) => ({ ...prev, isSubmitting: true, error: null }))
    try {
      await fetchWithCsrf<null>(`/api/contactos/${id}`, { method: 'DELETE' })
      setState((prev) => ({
        ...prev,
        contactos: prev.contactos.filter((c) => c.id !== id),
        isSubmitting: false,
      }))
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al eliminar'
      setState((prev) => ({ ...prev, isSubmitting: false, error: msg }))
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
      setState((prev) => ({ ...prev, error: null }))
    }, []),
  }
}

export function useContactoIndice(id: string) {
  const [contacto, setContacto] = useState<ContactoIndice | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const cargar = async () => {
      setIsLoading(true)
      try {
        const data = await fetchWithCsrf<ContactoIndice>(`/api/contactos/${id}`)
        setContacto(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar')
      } finally {
        setIsLoading(false)
      }
    }
    if (id) void cargar()
  }, [id])

  return { contacto, isLoading, error }
}
