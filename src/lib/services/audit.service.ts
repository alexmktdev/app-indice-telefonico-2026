// ─────────────────────────────────────────────────────────────
// AUDIT SERVICE
// Registra todas las operaciones en la colección "audit_logs".
// Propósito: saber quién hizo qué y cuándo (trazabilidad total).
// ─────────────────────────────────────────────────────────────

import { FieldValue } from 'firebase-admin/firestore'
import { adminDb } from '@/lib/firebase/admin'

type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'READ'

interface AuditLogData {
  action: AuditAction
  collection: string
  documentId: string
  userId: string
  userEmail: string
  changes?: Record<string, unknown>
}

export class AuditService {
  private readonly collectionName = 'audit_logs'

  async log(data: AuditLogData): Promise<void> {
    try {
      await adminDb.collection(this.collectionName).add({
        ...data,
        timestamp: FieldValue.serverTimestamp(),
      })
    } catch (error) {
      // Si falla el log de auditoría, NO detenemos la operación principal.
      // Solo lo registramos en la consola del servidor.
      console.error('[AuditService] Error al registrar log:', error)
    }
  }
}

// Singleton: exportamos una única instancia
export const auditService = new AuditService()
