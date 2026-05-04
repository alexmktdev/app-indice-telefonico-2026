// ─────────────────────────────────────────────────────────────
// GET /api/dashboard → Estadísticas para el panel principal
// Accesible para Admin y User
// ─────────────────────────────────────────────────────────────

import { NextRequest } from 'next/server'
import { ContactoIndiceService } from '@/lib/services/contacto-indice.service'
import { UsuarioService } from '@/lib/services/usuario.service'
import { verifyAuth } from '@/lib/middleware/auth.middleware'
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/middleware/rate-limit.middleware'
import { ROLES } from '@/types/usuario.types'
import {
  successResponse,
  unauthorizedResponse,
  internalErrorResponse,
  tooManyRequestsResponse,
} from '@/lib/helpers/api-response.helper'

const contactoService = new ContactoIndiceService()
const usuarioService = new UsuarioService()

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const rateLimit = checkRateLimit(ip, RATE_LIMITS.DASHBOARD)
    if (!rateLimit.allowed) {
      return tooManyRequestsResponse('Demasiadas solicitudes.', rateLimit.retryAfter)
    }

    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return unauthorizedResponse(authResult.error)
    }

    // Ejecutamos consultas en paralelo con Promise.all
    const [indiceStats, usuarioStats] = await Promise.all([
      contactoService.getStats(),
      authResult.user.role === ROLES.ADMIN
        ? usuarioService.getStats()
        : Promise.resolve(null),
    ])

    const dashboardData = {
      indice: {
        total: indiceStats.total,
        nuevasEsteMes: indiceStats.nuevasEsteMes,
      },
      ...(usuarioStats && { usuarios: { total: usuarioStats.total } }),
      generadoEn: new Date().toISOString(),
      rol: authResult.user.role,
    }

    return successResponse(dashboardData)
  } catch (error) {
    console.error('[GET /api/dashboard]', error)
    return internalErrorResponse()
  }
}
