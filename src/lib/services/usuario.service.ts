// ─────────────────────────────────────────────────────────────
// USUARIO SERVICE — Lógica de Negocio de Usuarios
// Sincroniza Firebase Auth + Firestore en cada operación.
// ─────────────────────────────────────────────────────────────

import { UsuarioRepository } from '@/lib/repositories/usuario.repository'
import { adminAuth } from '@/lib/firebase/admin'
import { auditService } from './audit.service'
import { NotFoundError, ConflictError } from './domain-errors'
import type { Usuario, CreateUsuarioDTO, UpdateUsuarioDTO, UsuarioSession } from '@/types/usuario.types'

export class UsuarioService {
  private readonly usuarioRepo: UsuarioRepository

  constructor(usuarioRepo?: UsuarioRepository) {
    this.usuarioRepo = usuarioRepo ?? new UsuarioRepository()
  }

  async getAll(): Promise<Usuario[]> {
    return this.usuarioRepo.findAll(true)
  }

  async getById(id: string): Promise<Usuario> {
    const usuario = await this.usuarioRepo.findById(id)
    if (!usuario || !usuario.isActive) {
      throw new NotFoundError(`Usuario con id "${id}" no encontrado`)
    }
    return usuario
  }

  async create(data: CreateUsuarioDTO, currentUser: UsuarioSession): Promise<Usuario> {
    // 1. Verificar que el email no existe en Firestore
    const existe = await this.usuarioRepo.findByEmail(data.email)
    if (existe) {
      throw new ConflictError(`Ya existe un usuario con el email ${data.email}`)
    }

    // 2. Crear usuario en Firebase Authentication
    const firebaseUser = await adminAuth.createUser({
      email: data.email,
      password: data.password,
      displayName: data.displayName,
    })

    // 3. Asignar el rol como Custom Claim en el token JWT
    await adminAuth.setCustomUserClaims(firebaseUser.uid, {
      role: data.role,
    })

    // 4. Guardar el usuario en Firestore (sin password)
    const usuarioData = {
      email: data.email,
      displayName: data.displayName,
      role: data.role,
      isActive: true,
      createdBy: currentUser.uid,
      updatedBy: currentUser.uid,
    }

    // Usamos el UID de Firebase Auth como ID del documento
    await this.usuarioRepo['collectionRef']
      .doc(firebaseUser.uid)
      .set({
        ...usuarioData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

    const usuario = await this.usuarioRepo.findById(firebaseUser.uid)
    if (!usuario) throw new Error('Error al crear usuario')

    await auditService.log({
      action: 'CREATE',
      collection: 'users',
      documentId: firebaseUser.uid,
      userId: currentUser.uid,
      userEmail: currentUser.email,
    })

    return usuario
  }

  async update(id: string, data: UpdateUsuarioDTO, currentUser: UsuarioSession): Promise<Usuario> {
    await this.getById(id)

    // Si cambia el rol, actualizar también en Firebase Auth
    if (data.role) {
      await adminAuth.setCustomUserClaims(id, { role: data.role })
      await adminAuth.revokeRefreshTokens(id)
    }

    // Si se desactiva/activa, sincronizar con Firebase Auth
    if (data.isActive === false) {
      await adminAuth.updateUser(id, { disabled: true })
    }
    if (data.isActive === true) {
      await adminAuth.updateUser(id, { disabled: false })
    }

    const usuario = await this.usuarioRepo.update(id, {
      ...data,
      updatedBy: currentUser.uid,
    } as Partial<Usuario>)

    await auditService.log({
      action: 'UPDATE',
      collection: 'users',
      documentId: id,
      userId: currentUser.uid,
      userEmail: currentUser.email,
      changes: data as Record<string, unknown>,
    })

    return usuario
  }

  async delete(id: string, currentUser: UsuarioSession): Promise<void> {
    if (id === currentUser.uid) {
      throw new ConflictError('No puedes eliminar tu propio usuario')
    }

    await this.getById(id)
    await this.usuarioRepo.softDelete(id, currentUser.uid)
    await adminAuth.updateUser(id, { disabled: true })

    await auditService.log({
      action: 'DELETE',
      collection: 'users',
      documentId: id,
      userId: currentUser.uid,
      userEmail: currentUser.email,
    })
  }

  async getStats() {
    const total = await this.usuarioRepo.countActive()
    return { total }
  }
}
