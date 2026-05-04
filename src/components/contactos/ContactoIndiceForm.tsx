'use client'

import { useState, type FormEvent } from 'react'
import type { ContactoIndice, CreateContactoIndiceDTO, UpdateContactoIndiceDTO } from '@/types/contacto-indice.types'
import { Loader2 } from 'lucide-react'

interface Props {
  initialData?: ContactoIndice
  onSubmit: (data: CreateContactoIndiceDTO | UpdateContactoIndiceDTO) => Promise<void>
  isSubmitting: boolean
  submitLabel: string
}

function FormField({
  label,
  id,
  error,
  required,
  ...inputProps
}: {
  label: string
  id: string
  error?: string
  required?: boolean
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={id}
        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 bg-white placeholder-gray-400 ${error ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
        {...inputProps}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

export function ContactoIndiceForm({
  initialData,
  onSubmit,
  isSubmitting,
  submitLabel,
}: Props) {
  const [formData, setFormData] = useState({
    extension: initialData?.extension ?? '',
    department: initialData?.department ?? '',
    name: initialData?.name ?? '',
  })

  const [errors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  const setField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitError(null)
    try {
      await onSubmit(formData)
    } catch (error) {
      if (error instanceof Error) {
        try {
          const parsedError = JSON.parse(error.message)
          if (typeof parsedError === 'object' && parsedError !== null) {
            const messages = Object.entries(parsedError)
              .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(', ')}`)
              .join(' | ')
            setSubmitError(messages)
            return
          }
        } catch {
          setSubmitError(error.message)
        }
      } else {
        setSubmitError('Error al guardar')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {submitError}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Datos del contacto</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Anexo"
            id="extension"
            value={formData.extension}
            onChange={(e) => setField('extension', e.target.value)}
            placeholder="701"
            required
            error={errors.extension}
          />
          <FormField
            label="Nombre (opcional)"
            id="name"
            value={formData.name}
            onChange={(e) => setField('name', e.target.value)}
            placeholder="Nombre de la persona o cargo"
            error={errors.name}
          />
        </div>
        <FormField
          label="Dependencia / unidad"
          id="department"
          value={formData.department}
          onChange={(e) => setField('department', e.target.value)}
          placeholder="Ej. Dirección de Tránsito"
          required
          error={errors.department}
        />
      </div>

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-lg bg-brand-dark px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
