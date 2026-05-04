import { NextRequest, NextResponse } from 'next/server'
import { ContactoIndiceService } from '@/lib/services/contacto-indice.service'
import { ConflictError } from '@/lib/services/domain-errors'
import { verifyAuth } from '@/lib/middleware/auth.middleware'
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/middleware/rate-limit.middleware'
import { verifyCsrfToken } from '@/lib/middleware/csrf.middleware'
import { sanitizeObject } from '@/lib/helpers/sanitize.helper'
import { CreateContactoIndiceSchema } from '@/lib/validations/contacto-indice.schema'
import { ROLES } from '@/types/usuario.types'
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

const contactoService = new ContactoIndiceService()

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const rateLimit = checkRateLimit(ip, RATE_LIMITS.READ)
    if (!rateLimit.allowed) {
      return tooManyRequestsResponse('Demasiadas solicitudes.', rateLimit.retryAfter)
    }

    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return unauthorizedResponse(authResult.error)
    }

    const contactos = await contactoService.getAll()
    return successResponse(contactos, `${contactos.length} entradas en el índice`)
  } catch (error) {
    console.error('[GET /api/contactos]', error)
    return internalErrorResponse()
  }
}

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

    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return unauthorizedResponse(authResult.error)
    }

    if (authResult.user.role !== ROLES.ADMIN) {
      return forbiddenResponse('No tienes permisos para crear entradas del índice.')
    }

    const body: unknown = await request.json()
    const validation = CreateContactoIndiceSchema.safeParse(body)

    if (!validation.success) {
      return badRequestResponse(
        'Los datos de la entrada son inválidos',
        validation.error.flatten().fieldErrors
      )
    }

    const sanitizedData = sanitizeObject(validation.data as Record<string, unknown>)
    const contacto = await contactoService.create(
      sanitizedData as typeof validation.data,
      authResult.user
    )

    return createdResponse(contacto, 'Entrada creada exitosamente')
  } catch (error) {
    if (error instanceof ConflictError) {
      return conflictResponse(error.message)
    }
    console.error('[POST /api/contactos]', error)
    return internalErrorResponse()
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 })
}
