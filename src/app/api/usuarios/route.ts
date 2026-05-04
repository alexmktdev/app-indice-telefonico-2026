// ─────────────────────────────────────────────────────────────
// GET  /api/usuarios → Listar usuarios (Solo Admin)
// POST /api/usuarios → Crear usuario   (Solo Admin)
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { UsuarioService } from '@/lib/services/usuario.service'
import { ConflictError } from '@/lib/services/domain-errors'
import { verifyAdmin } from '@/lib/middleware/auth.middleware'
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/middleware/rate-limit.middleware'
import { verifyCsrfToken } from '@/lib/middleware/csrf.middleware'
import { sanitizeObject } from '@/lib/helpers/sanitize.helper'
import { CreateUsuarioSchema } from '@/lib/validations/usuario.schema'
import {
  successResponse,
  createdResponse,
  badRequestResponse,
  unauthorizedResponse,
  forbiddenResponse,
  conflictResponse,
  internalErrorResponse,
  tooManyRequestsResponse,
} from '@/lib/helpers/api-response.helper'

const usuarioService = new UsuarioService()

// ── GET → Listar usuarios ─────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const rateLimit = checkRateLimit(ip, RATE_LIMITS.READ)
    if (!rateLimit.allowed) {
      return tooManyRequestsResponse('Demasiadas solicitudes.', rateLimit.retryAfter)
    }

    const authResult = await verifyAdmin(request)
    if (!authResult.success) {
      return authResult.status === 401
        ? unauthorizedResponse(authResult.error)
        : forbiddenResponse(authResult.error)
    }

    const usuarios = await usuarioService.getAll()
    return successResponse(usuarios, `${usuarios.length} usuarios encontrados`)
  } catch (error) {
    console.error('[GET /api/usuarios]', error)
    return internalErrorResponse()
  }
}

// ── POST → Crear usuario ──────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const rateLimit = checkRateLimit(ip, RATE_LIMITS.WRITE)
    if (!rateLimit.allowed) {
      return tooManyRequestsResponse('Demasiadas solicitudes.', rateLimit.retryAfter)
    }

    if (!verifyCsrfToken(request)) {
      return forbiddenResponse('Token CSRF inválido o ausente.')
    }

    const authResult = await verifyAdmin(request)
    if (!authResult.success) {
      return authResult.status === 401
        ? unauthorizedResponse(authResult.error)
        : forbiddenResponse(authResult.error)
    }

    const body: unknown = await request.json()
    const validation = CreateUsuarioSchema.safeParse(body)
    if (!validation.success) {
      return badRequestResponse(
        'Los datos del usuario son inválidos',
        validation.error.flatten().fieldErrors
      )
    }

    const sanitizedData = sanitizeObject(validation.data as Record<string, unknown>)
    const usuario = await usuarioService.create(
      sanitizedData as typeof validation.data,
      authResult.user
    )
    return createdResponse(usuario, 'Usuario creado exitosamente')
  } catch (error) {
    if (error instanceof ConflictError) {
      return conflictResponse(error.message)
    }
    console.error('[POST /api/usuarios]', error)
    return internalErrorResponse()
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 })
}
