import { ContactoIndiceRepository } from '@/lib/repositories/contacto-indice.repository'
import { auditService } from './audit.service'
import type {
  CatalogContact,
  ContactoIndice,
  CreateContactoIndiceDTO,
  UpdateContactoIndiceDTO,
} from '@/types/contacto-indice.types'
import type { UsuarioSession } from '@/types/usuario.types'
import { ConflictError, NotFoundError } from './domain-errors'

function compareExtensions(a: string, b: string): number {
  return (parseInt(a, 10) || 0) - (parseInt(b, 10) || 0)
}

export class ContactoIndiceService {
  private readonly repo: ContactoIndiceRepository

  constructor(repo?: ContactoIndiceRepository) {
    this.repo = repo ?? new ContactoIndiceRepository()
  }

  /** Listado para el sitio público: solo activos, ordenados por anexo. */
  async getCatalogoPublico(): Promise<CatalogContact[]> {
    const rows = await this.repo.findAll(true)
    return [...rows]
      .sort((a, b) => compareExtensions(a.extension, b.extension))
      .map(({ extension, department, name }) => ({
        extension,
        department,
        name: name ?? '',
      }))
  }

  async getAll(): Promise<ContactoIndice[]> {
    return this.repo.findAll(true)
  }

  async getById(id: string): Promise<ContactoIndice> {
    const row = await this.repo.findById(id)
    if (!row) {
      throw new NotFoundError(`Entrada de índice con id "${id}" no encontrada`)
    }
    if (!row.isActive) {
      throw new NotFoundError(`Entrada de índice con id "${id}" no encontrada`)
    }
    return row
  }

  async create(data: CreateContactoIndiceDTO, currentUser: UsuarioSession): Promise<ContactoIndice> {
    const ext = data.extension.trim()
    const existing = await this.repo.findActiveByExtension(ext)
    if (existing) {
      throw new ConflictError(`Ya existe una entrada activa con el anexo ${ext}`)
    }

    const payload = {
      extension: ext,
      department: data.department.trim(),
      name: (data.name ?? '').trim(),
      createdBy: currentUser.uid,
      updatedBy: currentUser.uid,
    }

    const created = await this.repo.create(payload)

    await auditService.log({
      action: 'CREATE',
      collection: 'contactos_indice',
      documentId: created.id,
      userId: currentUser.uid,
      userEmail: currentUser.email,
    })

    return created
  }

  async update(
    id: string,
    data: UpdateContactoIndiceDTO,
    currentUser: UsuarioSession
  ): Promise<ContactoIndice> {
    await this.getById(id)

    if (data.extension !== undefined) {
      const ext = data.extension.trim()
      const other = await this.repo.findActiveByExtension(ext)
      if (other && other.id !== id) {
        throw new ConflictError(`Ya existe una entrada activa con el anexo ${ext}`)
      }
    }

    const updateData: Record<string, unknown> = {
      updatedBy: currentUser.uid,
    }
    if (data.extension !== undefined) updateData.extension = data.extension.trim()
    if (data.department !== undefined) updateData.department = data.department.trim()
    if (data.name !== undefined) updateData.name = data.name.trim()

    const updated = await this.repo.update(id, updateData as Partial<Omit<ContactoIndice, 'id'>>)

    await auditService.log({
      action: 'UPDATE',
      collection: 'contactos_indice',
      documentId: id,
      userId: currentUser.uid,
      userEmail: currentUser.email,
      changes: data as Record<string, unknown>,
    })

    return updated
  }

  async delete(id: string, currentUser: UsuarioSession): Promise<void> {
    await this.getById(id)
    await this.repo.softDelete(id, currentUser.uid)

    await auditService.log({
      action: 'DELETE',
      collection: 'contactos_indice',
      documentId: id,
      userId: currentUser.uid,
      userEmail: currentUser.email,
    })
  }

  async getStats() {
    const [total, nuevasEsteMes] = await Promise.all([
      this.repo.countActive(),
      this.repo.countCreatedThisMonth(),
    ])
    return { total, nuevasEsteMes }
  }
}
