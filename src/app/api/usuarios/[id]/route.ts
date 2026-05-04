// ─────────────────────────────────────────────────────────────
// GET    /api/usuarios/[id] → Ver usuario (Solo Admin)
// PUT    /api/usuarios/[id] → Actualizar usuario (Solo Admin)
// DELETE /api/usuarios/[id] → Eliminar usuario (Solo Admin)
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { UsuarioService } from '@/lib/services/usuario.service'
import { NotFoundError, ConflictError } from '@/lib/services/domain-errors'
import { verifyAdmin } from '@/lib/middleware/auth.middleware'
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/middleware/rate-limit.middleware'
import { verifyCsrfToken } from '@/lib/middleware/csrf.middleware'
import { sanitizeObject } from '@/lib/helpers/sanitize.helper'
import { UpdateUsuarioSchema } from '@/lib/validations/usuario.schema'
import {
  successResponse,
  badRequestResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  conflictResponse,
  internalErrorResponse,
  tooManyRequestsResponse,
} from '@/lib/helpers/api-response.helper'

const usuarioService = new UsuarioService()

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

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

    const usuario = await usuarioService.getById(id)
    return successResponse(usuario)
  } catch (error) {
    if (error instanceof NotFoundError) return notFoundResponse(error.message)
    console.error('[GET /api/usuarios/[id]]', error)
    return internalErrorResponse()
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

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
    const validation = UpdateUsuarioSchema.safeParse(body)
    if (!validation.success) {
      return badRequestResponse(
        'Los datos de actualización son inválidos',
        validation.error.flatten().fieldErrors
      )
    }

    const sanitizedData = sanitizeObject(validation.data as Record<string, unknown>)
    const usuario = await usuarioService.update(
      id,
      sanitizedData as typeof validation.data,
      authResult.user
    )
    return successResponse(usuario, 'Usuario actualizado exitosamente')
  } catch (error) {
    if (error instanceof NotFoundError) return notFoundResponse(error.message)
    if (error instanceof ConflictError) return conflictResponse(error.message)
    console.error('[PUT /api/usuarios/[id]]', error)
    return internalErrorResponse()
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

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

    await usuarioService.delete(id, authResult.user)
    return successResponse(null, 'Usuario eliminado exitosamente')
  } catch (error) {
    if (error instanceof NotFoundError) return notFoundResponse(error.message)
    if (error instanceof ConflictError) return conflictResponse(error.message)
    console.error('[DELETE /api/usuarios/[id]]', error)
    return internalErrorResponse()
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 })
}
