// ─────────────────────────────────────────────────────────────
// USUARIO REPOSITORY
// Hereda de BaseRepository<Usuario> y agrega métodos específicos.
// ─────────────────────────────────────────────────────────────

import { BaseRepository } from './base.repository'
import { fromFirestore } from '@/lib/helpers/firestore.helper'
import type { Usuario, Role } from '@/types/usuario.types'

export class UsuarioRepository extends BaseRepository<Usuario> {
  constructor() {
    super('users')
  }

  // ── Buscar por email ──────────────────────────────────────
  async findByEmail(email: string): Promise<Usuario | null> {
    const snapshot = await this.collectionRef
      .where('email', '==', email.toLowerCase())
      .limit(1)
      .get()

    if (snapshot.empty) return null
    const doc = snapshot.docs[0]
    if (!doc) return null

    return fromFirestore<Usuario>(doc)
  }

  // ── Buscar por rol ────────────────────────────────────────
  async findByRole(role: Role): Promise<Usuario[]> {
    const snapshot = await this.collectionRef
      .where('role', '==', role)
      .where('isActive', '==', true)
      .orderBy('createdAt', 'desc')
      .get()

    return snapshot.docs.map((doc) => fromFirestore<Usuario>(doc))
  }

  // ── Contar usuarios activos ───────────────────────────────
  async countActive(): Promise<number> {
    const snapshot = await this.collectionRef
      .where('isActive', '==', true)
      .count()
      .get()

    return snapshot.data().count
  }
}
