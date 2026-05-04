import { NextRequest, NextResponse } from 'next/server'
import { ContactoIndiceService } from '@/lib/services/contacto-indice.service'
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/middleware/rate-limit.middleware'
import {
  successResponse,
  internalErrorResponse,
  tooManyRequestsResponse,
} from '@/lib/helpers/api-response.helper'

const contactoService = new ContactoIndiceService()

/** Catálogo del índice telefónico sin autenticación (solo lectura). */
export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const rateLimit = checkRateLimit(ip, RATE_LIMITS.READ)
    if (!rateLimit.allowed) {
      return tooManyRequestsResponse('Demasiadas solicitudes.', rateLimit.retryAfter)
    }

    const catalogo = await contactoService.getCatalogoPublico()
    return successResponse(catalogo)
  } catch (error) {
    console.error('[GET /api/public/contactos]', error)
    return internalErrorResponse()
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 })
}
