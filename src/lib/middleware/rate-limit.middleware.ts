// ─────────────────────────────────────────────────────────────
// RATE LIMIT MIDDLEWARE
// Limita cuántas requests puede hacer una IP en un período.
// Previene ataques de fuerza bruta y abuso de la API.
//
// Implementación en memoria (simple, para un servidor).
// Para múltiples servidores usar Redis.
// ─────────────────────────────────────────────────────────────

interface RateLimitEntry {
  count: number
  resetTime: number
}

// Map en memoria: sobrevive entre requests
const store = new Map<string, RateLimitEntry>()

// Limpiar entradas expiradas cada 5 minutos para liberar memoria
const CLEANUP_INTERVAL = 5 * 60 * 1000

if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    store.forEach((entry, key) => {
      if (now > entry.resetTime) {
        store.delete(key)
      }
    })
  }, CLEANUP_INTERVAL)
}

export interface RateLimitOptions {
  maxRequests: number
  windowMs: number
  identifier?: string
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  retryAfter: number
}

// ── Función principal ─────────────────────────────────────────
export function checkRateLimit(
  ip: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now()
  const key = `${options.identifier ?? 'default'}:${ip}`
  const entry = store.get(key)

  // No hay entrada o la ventana expiró
  if (!entry || now > entry.resetTime) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + options.windowMs,
    }
    store.set(key, newEntry)

    return {
      allowed: true,
      remaining: options.maxRequests - 1,
      resetTime: newEntry.resetTime,
      retryAfter: 0,
    }
  }

  // Superó el límite
  if (entry.count >= options.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter: Math.ceil((entry.resetTime - now) / 1000),
    }
  }

  // Dentro del límite: incrementar
  entry.count++
  store.set(key, entry)

  return {
    allowed: true,
    remaining: options.maxRequests - entry.count,
    resetTime: entry.resetTime,
    retryAfter: 0,
  }
}

// ── Límites predefinidos por tipo de operación ────────────────
export const RATE_LIMITS = {
  AUTH: { maxRequests: 5, windowMs: 15 * 60 * 1000, identifier: 'auth' },
  WRITE: { maxRequests: 30, windowMs: 60 * 1000, identifier: 'write' },
  READ: { maxRequests: 100, windowMs: 60 * 1000, identifier: 'read' },
  DASHBOARD: { maxRequests: 20, windowMs: 60 * 1000, identifier: 'dashboard' },
  /** GET /api/auth/session (polling de sesión) */
  SESSION_GET: { maxRequests: 90, windowMs: 60 * 1000, identifier: 'session-get' },
  /** DELETE /api/auth/session (logout) */
  SESSION_DELETE: { maxRequests: 30, windowMs: 60 * 1000, identifier: 'session-delete' },
} as const

// ── Helper: obtener IP del request ───────────────────────────
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0]?.trim()
    if (firstIp) return firstIp
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp

  return '127.0.0.1'
}
