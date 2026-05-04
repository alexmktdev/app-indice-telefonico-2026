/** Fila pública del índice (sin metadatos internos) */
export type CatalogContact = {
  extension: string
  department: string
  name: string
}

export interface ContactoIndice {
  id: string
  extension: string
  department: string
  name: string
  isActive: boolean
  createdAt: Date
  createdBy: string
  updatedAt: Date
  updatedBy: string
}

export interface CreateContactoIndiceDTO {
  extension: string
  department: string
  name: string
}

export interface UpdateContactoIndiceDTO {
  extension?: string
  department?: string
  name?: string
}
