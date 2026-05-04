import { NextRequest, NextResponse } from 'next/server'
import { ContactoIndiceService } from '@/lib/services/contacto-indice.service'
import { NotFoundError, ConflictError } from '@/lib/services/domain-errors'
import { verifyAuth } from '@/lib/middleware/auth.middleware'
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/middleware/rate-limit.middleware'
import { verifyCsrfToken } from '@/lib/middleware/csrf.middleware'
import { sanitizeObject } from '@/lib/helpers/sanitize.helper'
import { UpdateContactoIndiceSchema } from '@/lib/validations/contacto-indice.schema'
import { ROLES } from '@/types/usuario.types'
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

const contactoService = new ContactoIndiceService()

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const ip = getClientIp(request)
    const rateLimit = checkRateLimit(ip, RATE_LIMITS.READ)
    if (!rateLimit.allowed) {
      return tooManyRequestsResponse('Demasiadas solicitudes.', rateLimit.retryAfter)
    }

    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return unauthorizedResponse(authResult.error)
    }

    const contacto = await contactoService.getById(id)
    return successResponse(contacto)
  } catch (error) {
    if (error instanceof NotFoundError) return notFoundResponse(error.message)
    console.error('[GET /api/contactos/[id]]', error)
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

    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return unauthorizedResponse(authResult.error)
    }

    if (authResult.user.role !== ROLES.ADMIN) {
      return forbiddenResponse('No tienes permisos para editar el índice.')
    }

    const body: unknown = await request.json()
    const validation = UpdateContactoIndiceSchema.safeParse(body)
    if (!validation.success) {
      return badRequestResponse(
        'Los datos de actualización son inválidos',
        validation.error.flatten().fieldErrors
      )
    }

    const sanitizedData = sanitizeObject(validation.data as Record<string, unknown>)
    const contacto = await contactoService.update(
      id,
      sanitizedData as typeof validation.data,
      authResult.user
    )

    return successResponse(contacto, 'Entrada actualizada exitosamente')
  } catch (error) {
    if (error instanceof NotFoundError) return notFoundResponse(error.message)
    if (error instanceof ConflictError) return conflictResponse(error.message)
    console.error('[PUT /api/contactos/[id]]', error)
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

    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return unauthorizedResponse(authResult.error)
    }

    if (authResult.user.role !== ROLES.ADMIN) {
      return forbiddenResponse('No tienes permisos para eliminar entradas.')
    }

    await contactoService.delete(id, authResult.user)
    return successResponse(null, 'Entrada eliminada exitosamente')
  } catch (error) {
    if (error instanceof NotFoundError) return notFoundResponse(error.message)
    console.error('[DELETE /api/contactos/[id]]', error)
    return internalErrorResponse()
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 })
}
