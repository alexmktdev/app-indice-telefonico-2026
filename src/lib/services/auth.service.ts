// ─────────────────────────────────────────────────────────────
// AUTH SERVICE
// Maneja la creación y destrucción de sesiones.
// Convierte el idToken de Firebase (corto plazo, 1 hora)
// en una session cookie (largo plazo, configurable a 5 días).
// ─────────────────────────────────────────────────────────────

import { adminAuth } from '@/lib/firebase/admin'
import type { UsuarioSession, Role } from '@/types/usuario.types'
import { LEGACY_VIEWER_ROLE, ROLES } from '@/types/usuario.types'

// Duración de la sesión: 5 días en milisegundos
const SESSION_DURATION = 60 * 60 * 24 * 5 * 1000

export class AuthService {
  // ── Crear sesión ──────────────────────────────────────────
  async createSession(idToken: string): Promise<string> {
    const decodedToken = await adminAuth.verifyIdToken(idToken)

    // Verificar que tenga rol asignado
    const role = decodedToken['role'] as Role | undefined
    if (!role || (role !== ROLES.ADMIN && role !== ROLES.USER && role !== LEGACY_VIEWER_ROLE)) {
      throw new Error('Usuario sin rol asignado. Contacta al administrador.')
    }

    // Crear la session cookie (válida por SESSION_DURATION)
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION,
    })

    return sessionCookie
  }

  // ── Obtener usuario de la sesión ──────────────────────────
  async getSessionUser(sessionCookie: string): Promise<UsuarioSession> {
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true)

    return {
      uid: decodedToken.uid,
      email: decodedToken.email ?? '',
      displayName: decodedToken.name ?? '',
      role: decodedToken['role'] === LEGACY_VIEWER_ROLE ? ROLES.USER : (decodedToken['role'] as Role),
    }
  }

  // ── Revocar sesión (logout) ───────────────────────────────
  async revokeSession(uid: string): Promise<void> {
    await adminAuth.revokeRefreshTokens(uid)
  }
}

export const authService = new AuthService()
