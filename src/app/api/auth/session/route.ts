// ─────────────────────────────────────────────────────────────
// POST   /api/auth/session → Crear sesión (Login)
// GET    /api/auth/session → Obtener usuario actual
// DELETE /api/auth/session → Cerrar sesión (Logout)
//
// FLUJO DE LOGIN:
// 1. Usuario ingresa email/password en el frontend
// 2. Firebase Auth (cliente) valida credenciales y retorna un idToken
// 3. El frontend envía ese idToken a ESTE endpoint
// 4. Verificamos el idToken con Firebase Admin
// 5. Creamos una session cookie (JWT de 5 días)
// 6. La guardamos en una cookie httpOnly (invisible para JS)
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/lib/services/auth.service'
import { verifyAuth } from '@/lib/middleware/auth.middleware'
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/middleware/rate-limit.middleware'
import { setCsrfCookie, verifyCsrfToken } from '@/lib/middleware/csrf.middleware'
import { LoginSchema } from '@/lib/validations/usuario.schema'
import {
  successResponse,
  badRequestResponse,
  unauthorizedResponse,
  forbiddenResponse,
  internalErrorResponse,
  tooManyRequestsResponse,
} from '@/lib/helpers/api-response.helper'

// ── POST → Login ──────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    // PASO 1: Rate Limiting (lo primero, antes de cualquier procesamiento)
    const ip = getClientIp(request)
    const rateLimit = checkRateLimit(ip, RATE_LIMITS.AUTH)

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: `Demasiados intentos de login. Espera ${rateLimit.retryAfter} segundos.` },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } }
      )
    }

    // PASO 2: Validación con Zod
    const body: unknown = await request.json()
    const validation = LoginSchema.safeParse(body)

    if (!validation.success) {
      return badRequestResponse(
        'Datos de login inválidos',
        validation.error.flatten().fieldErrors
      )
    }

    const { idToken } = validation.data

    // PASO 3: Crear la session cookie con Firebase Admin
    const sessionCookie = await authService.createSession(idToken)

    // PASO 4: Responder con la cookie de sesión + CSRF token
    const response = successResponse(
      { message: 'Sesión iniciada correctamente' },
      'Login exitoso'
    )

    // Cookie de sesión: httpOnly (JS no puede leerla)
    response.cookies.set('session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 5, // 5 días
    })

    // Cookie CSRF: NO httpOnly (JS sí puede leerla para enviarla en header)
    setCsrfCookie(response)

    return response
  } catch (error) {
    const firebaseError = error as { code?: string; message?: string }

    if (
      firebaseError.code === 'auth/argument-error' ||
      firebaseError.code === 'auth/invalid-id-token'
    ) {
      return unauthorizedResponse('Token de autenticación inválido')
    }

    if (firebaseError.message?.includes('sin rol')) {
      return unauthorizedResponse(firebaseError.message)
    }

    console.error('[POST /api/auth/session]', error)
    return internalErrorResponse()
  }
}

// ── GET → Obtener usuario actual ──────────────────────────────
// Sin sesión o token inválido → 200 + data: null (no 401): es comprobación de estado, no recurso protegido.
export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    // En desarrollo, recargas/HMR de Turbopack pueden disparar muchas peticiones; no limitar este probe.
    if (process.env.NODE_ENV === 'production') {
      const rateLimit = checkRateLimit(ip, RATE_LIMITS.SESSION_GET)
      if (!rateLimit.allowed) {
        return tooManyRequestsResponse('Demasiadas solicitudes.', rateLimit.retryAfter)
      }
    }

    const authResult = await verifyAuth(request)

    if (!authResult.success) {
      return successResponse(null)
    }

    return successResponse(authResult.user)
  } catch (error) {
    console.error('[GET /api/auth/session]', error)
    return internalErrorResponse()
  }
}

// ── DELETE → Logout ───────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const rateLimit = checkRateLimit(ip, RATE_LIMITS.SESSION_DELETE)
    if (!rateLimit.allowed) {
      return tooManyRequestsResponse('Demasiadas solicitudes.', rateLimit.retryAfter)
    }

    if (!verifyCsrfToken(request)) {
      return forbiddenResponse('Token CSRF inválido o ausente.')
    }

    const authResult = await verifyAuth(request)

    if (!authResult.success) {
      return unauthorizedResponse(authResult.error)
    }

    await authService.revokeSession(authResult.user.uid)

    const response = successResponse(
      { message: 'Sesión cerrada correctamente' },
      'Logout exitoso'
    )

    // Eliminar ambas cookies al hacer logout
    response.cookies.set('session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })

    response.cookies.set('csrf-token', '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })

    return response
  } catch (error) {
    console.error('[DELETE /api/auth/session]', error)
    return internalErrorResponse()
  }
}
