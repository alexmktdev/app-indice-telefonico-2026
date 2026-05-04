// ─────────────────────────────────────────────────────────────
// BASE REPOSITORY — Clase Abstracta Genérica
//
// "Abstracta" = NO se puede instanciar directamente.
// "Genérica" (<T>) = funciona con cualquier tipo (Persona, Usuario).
//
// Los métodos aquí implementados son los que TODOS los
// repositorios necesitan: findAll, findById, create, update, delete.
// Cada repositorio hijo hereda estos métodos gratuitamente.
// ─────────────────────────────────────────────────────────────

import {
  type CollectionReference,
  type DocumentReference,
  FieldValue,
  type Query,
} from 'firebase-admin/firestore'
import { adminDb } from '@/lib/firebase/admin'
import { fromFirestore } from '@/lib/helpers/firestore.helper'

// ── Interfaz del repositorio (contrato) ──────────────────────
export interface IBaseRepository<T> {
  findAll(onlyActive?: boolean): Promise<T[]>
  findById(id: string): Promise<T | null>
  create(data: Omit<T, 'id' | 'isActive' | 'createdAt' | 'updatedAt'>): Promise<T>
  update(id: string, data: Partial<Omit<T, 'id'>>): Promise<T>
  softDelete(id: string, userId: string): Promise<void>
  hardDelete(id: string): Promise<void>
}

// ── Clase abstracta genérica ──────────────────────────────────
export abstract class BaseRepository<T extends object>
  implements IBaseRepository<T>
{
  // "protected" = accesible desde esta clase Y sus hijos
  protected readonly collectionRef: CollectionReference

  constructor(private readonly collectionName: string) {
    this.collectionRef = adminDb.collection(collectionName)
  }

  // ── findAll: obtener todos los documentos ──────────────────
  async findAll(onlyActive: boolean = true): Promise<T[]> {
    let query: Query = this.collectionRef

    if (onlyActive) {
      query = query.where('isActive', '==', true)
    }

    query = query.orderBy('createdAt', 'desc')
    const snapshot = await query.get()

    return snapshot.docs.map((doc) => fromFirestore<T>(doc))
  }

  // ── findById: buscar un documento por su ID ────────────────
  async findById(id: string): Promise<T | null> {
    const docRef: DocumentReference = this.collectionRef.doc(id)
    const snapshot = await docRef.get()

    if (!snapshot.exists) {
      return null
    }

    return fromFirestore<T>(snapshot)
  }

  // ── create: crear un nuevo documento ───────────────────────
  async create(data: Omit<T, 'id' | 'isActive' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const timestamps = {
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      isActive: true,
    }

    // .add() crea el documento con ID autogenerado por Firestore
    const docRef = await this.collectionRef.add({
      ...data,
      ...timestamps,
    })

    const created = await docRef.get()
    return fromFirestore<T>(created)
  }

  // ── update: actualizar campos específicos ──────────────────
  async update(id: string, data: Partial<Omit<T, 'id'>>): Promise<T> {
    const docRef = this.collectionRef.doc(id)
    const snapshot = await docRef.get()

    if (!snapshot.exists) {
      throw new Error(
        `Documento con id "${id}" no encontrado en "${this.collectionName}"`
      )
    }

    // .update() solo modifica los campos enviados, NO sobreescribe todo
    await docRef.update({
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
    })

    const updated = await docRef.get()
    return fromFirestore<T>(updated)
  }

  // ── softDelete: marcar como inactivo (preserva historial) ──
  async softDelete(id: string, userId: string): Promise<void> {
    const docRef = this.collectionRef.doc(id)
    const snapshot = await docRef.get()

    if (!snapshot.exists) {
      throw new Error(
        `Documento con id "${id}" no encontrado en "${this.collectionName}"`
      )
    }

    await docRef.update({
      isActive: false,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: userId,
    })
  }

  // ── hardDelete: borrar permanentemente (usar con precaución) ─
  async hardDelete(id: string): Promise<void> {
    const docRef = this.collectionRef.doc(id)
    const snapshot = await docRef.get()

    if (!snapshot.exists) {
      throw new Error(
        `Documento con id "${id}" no encontrado en "${this.collectionName}"`
      )
    }

    await docRef.delete()
  }
}
