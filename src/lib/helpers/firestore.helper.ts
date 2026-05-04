// ─────────────────────────────────────────────────────────────
// FIRESTORE HELPER
// Firestore usa su propio tipo "Timestamp" para las fechas.
// Cuando leemos un documento, necesitamos convertir esos
// Timestamps a Date de JavaScript para usarlos normalmente.
// También necesitamos agregar el "id" del documento a los datos.
// ─────────────────────────────────────────────────────────────

import {
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
  Timestamp,
} from 'firebase-admin/firestore'

// ── Convierte un Timestamp de Firestore a Date de JS ─────────
export function timestampToDate(timestamp: Timestamp | undefined | null): Date {
  if (!timestamp) return new Date()
  return timestamp.toDate()
}

// ── Convierte un DocumentSnapshot a un objeto tipado ─────────
// DocumentSnapshot es lo que Firestore retorna cuando lees un doc.
// Contiene: el "id" del documento y los "data()" con los campos.
// Esta función los une en un solo objeto limpio.
//
// <T> es genérico: le decimos qué tipo esperamos recibir.
// Ejemplo: fromFirestore<Persona>(snapshot) nos da un Persona
export function fromFirestore<T>(
  snapshot: DocumentSnapshot | QueryDocumentSnapshot
): T {
  const data = snapshot.data()

  if (!data) {
    throw new Error(`Documento ${snapshot.id} no tiene datos`)
  }

  // Recorremos todos los campos del documento
  // Si algún campo es un Timestamp, lo convertimos a Date
  const converted = Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      if (value instanceof Timestamp) {
        return [key, timestampToDate(value)]
      }
      // Si el valor es un objeto anidado (como "direccion"),
      // revisamos recursivamente sus campos también
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        const nested = Object.fromEntries(
          Object.entries(value as Record<string, unknown>).map(([k, v]) => {
            if (v instanceof Timestamp) return [k, timestampToDate(v)]
            return [k, v]
          })
        )
        return [key, nested]
      }
      return [key, value]
    })
  )

  // Combinamos el id del documento con sus datos convertidos
  return { id: snapshot.id, ...converted } as T
}
