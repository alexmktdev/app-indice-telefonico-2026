import type { Query } from 'firebase-admin/firestore'
import { BaseRepository } from './base.repository'
import { fromFirestore } from '@/lib/helpers/firestore.helper'
import type { ContactoIndice } from '@/types/contacto-indice.types'

export class ContactoIndiceRepository extends BaseRepository<ContactoIndice> {
  constructor() {
    super('contactos_indice')
  }

  /**
   * Evita `where(isActive) + orderBy(createdAt)` en Firestore: esa combinación
   * exige un índice compuesto desplegado (ver `firestore.indexes.json`).
   * Ordenamos en memoria para que funcione antes de crear el índice en consola.
   */
  override async findAll(onlyActive: boolean = true): Promise<ContactoIndice[]> {
    let query: Query = this.collectionRef
    if (onlyActive) {
      query = query.where('isActive', '==', true)
    }
    const snapshot = await query.get()
    const rows = snapshot.docs.map((doc) => fromFirestore<ContactoIndice>(doc))
    return rows.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  async findActiveByExtension(extension: string): Promise<ContactoIndice | null> {
    const snapshot = await this.collectionRef
      .where('extension', '==', extension.trim())
      .where('isActive', '==', true)
      .limit(1)
      .get()

    if (snapshot.empty) return null
    const doc = snapshot.docs[0]
    if (!doc) return null
    return fromFirestore<ContactoIndice>(doc)
  }

  async countActive(): Promise<number> {
    const snapshot = await this.collectionRef
      .where('isActive', '==', true)
      .count()
      .get()
    return snapshot.data().count
  }

  async countCreatedThisMonth(): Promise<number> {
    const inicioMes = new Date()
    inicioMes.setDate(1)
    inicioMes.setHours(0, 0, 0, 0)

    const snapshot = await this.collectionRef
      .where('isActive', '==', true)
      .where('createdAt', '>=', inicioMes)
      .count()
      .get()

    return snapshot.data().count
  }
}
