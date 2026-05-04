// ─────────────────────────────────────────────────────────────
// AUTH MIDDLEWARE
// Esta función se llama al inicio de CADA API Route protegida.
// Hace tres cosas:
//   1. Lee la cookie de sesión
//   2. Verifica que el token JWT sea válido (no expirado, no falso)
//   3. Extrae el uid y el rol del usuario desde el token
//
// Si algo falla, retorna un error. Si todo es correcto,
// retorna los datos del usuario autenticado.
// ─────────────────────────────────────────────────────────────

import { NextRequest } from 'next/server'
import { adminAuth } from '@/lib/firebase/admin'
import type { Role, UsuarioSession } from '@/types/usuario.types'
import { LEGACY_VIEWER_ROLE, ROLES } from '@/types/usuario.types'

// ── Resultado del middleware ──────────────────────────────────
// Usamos un "discriminated union": si success es true,
// garantizamos que "user" existe. Si es false, existe "error".
type AuthResult =
  | { success: true; user: UsuarioSession }
  | { success: false; error: string; status: number }

// ── Función principal del middleware ─────────────────────────
export async function verifyAuth(request: NextRequest): Promise<AuthResult> {
  // 1. Leer la cookie de sesión (httpOnly, invisible para JS del navegador)
  const sessionCookie = request.cookies.get('session')?.value

  if (!sessionCookie) {
    return {
      success: false,
      error: 'No autenticado. Inicia sesión.',
      status: 401,
    }
  }

  try {
    // 2. Verificar el token con Firebase Admin
    // verifySessionCookie() verifica:
    //   - Que el token no fue manipulado (firma digital)
    //   - Que no ha expirado
    //   - Que pertenece a nuestro proyecto Firebase
    // El segundo parámetro "true" verifica que el token
    // no fue revocado (por ejemplo, al hacer logout)
    const decodedToken = await adminAuth.verifySessionCookie(
      sessionCookie,
      true // checkRevoked
    )

    // 3. Extraer el rol desde los Custom Claims
    const role = decodedToken['role'] as Role | typeof LEGACY_VIEWER_ROLE | undefined

    if (!role || (role !== ROLES.ADMIN && role !== ROLES.USER && role !== LEGACY_VIEWER_ROLE)) {
      return {
        success: false,
        error: 'Usuario sin rol asignado. Contacta al administrador.',
        status: 403,
      }
    }

    return {
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email ?? '',
        displayName: decodedToken.name ?? '',
        role: role === LEGACY_VIEWER_ROLE ? ROLES.USER : role,
      },
    }
  } catch (error) {
    const firebaseError = error as { code?: string }

    if (firebaseError.code === 'auth/session-cookie-expired') {
      return { success: false, error: 'Sesión expirada. Inicia sesión nuevamente.', status: 401 }
    }

    if (firebaseError.code === 'auth/session-cookie-revoked') {
      return { success: false, error: 'Sesión revocada. Inicia sesión nuevamente.', status: 401 }
    }

    return { success: false, error: 'Token inválido.', status: 401 }
  }
}

// ── Verificación de rol específico (Admin) ───────────────────
// Combina verifyAuth + verificación de rol admin.
export async function verifyAdmin(request: NextRequest): Promise<AuthResult> {
  const authResult = await verifyAuth(request)

  if (!authResult.success) return authResult

  if (authResult.user.role !== ROLES.ADMIN) {
    return {
      success: false,
      error: 'Acceso denegado. Se requiere rol de administrador.',
      status: 403,
    }
  }

  return authResult
}
