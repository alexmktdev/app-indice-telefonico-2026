// ─────────────────────────────────────────────────────────────
// CSRF MIDDLEWARE
// Implementa el patrón "Double Submit Cookie":
//   1. Al hacer login, el servidor genera un token aleatorio
//   2. Lo guarda en una cookie (readable por JS, no httpOnly)
//   3. El frontend lo lee y lo envía en el header X-CSRF-Token
//   4. El servidor verifica que el header coincida con la cookie
//
// Un sitio malicioso NO puede leer cookies de otro dominio
// (Same-Origin Policy), así que no puede obtener el token.
// ─────────────────────────────────────────────────────────────

import { type NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

// Generar un token aleatorio criptográficamente seguro
export function generateCsrfToken(): string {
  return randomBytes(32).toString('hex')
}

// ── Verificar el token CSRF en un request ─────────────────────
export function verifyCsrfToken(request: NextRequest): boolean {
  // Los métodos "seguros" (GET, HEAD, OPTIONS) no necesitan CSRF
  const safeMethods = ['GET', 'HEAD', 'OPTIONS']
  if (safeMethods.includes(request.method)) return true

  const headerToken = request.headers.get('x-csrf-token')
  const cookieToken = request.cookies.get('csrf-token')?.value

  if (!headerToken || !cookieToken) return false

  return headerToken === cookieToken
}

// ── Agregar token CSRF a una respuesta ────────────────────────
export function setCsrfCookie(response: NextResponse): NextResponse {
  const token = generateCsrfToken()

  response.cookies.set('csrf-token', token, {
    // NO es httpOnly: JS del frontend necesita leerlo para enviarlo en header
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 5, // 5 días (misma duración que la sesión)
  })

  return response
}
