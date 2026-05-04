// ─────────────────────────────────────────────────────────────
// NEXT.JS MIDDLEWARE
// Se ejecuta en el "Edge Runtime" ANTES de que cualquier
// página se procese.
//
// Responsabilidades:
//   1. Si NO hay sesión y accede a ruta protegida → redirigir al login
//   2. Si SÍ hay sesión y accede al login → redirigir al dashboard
//
// NOTA: No verifica el token con Firebase (requiere Admin SDK
// que no funciona en Edge). Solo verifica si la cookie EXISTE.
// La verificación real ocurre en cada API Route con verifyAuth().
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'

// Rutas que NO requieren autenticación (sitio público + login)
const PUBLIC_ROUTES = ['/login', '/']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Verificar si existe la cookie de sesión
  const sessionCookie = request.cookies.get('session')?.value
  const isAuthenticated = Boolean(sessionCookie)

  const isPublicRoute = pathname === '/' || PUBLIC_ROUTES.includes(pathname)

  // Usuario autenticado intenta acceder al login → panel privado
  if (isAuthenticated && pathname === '/login') {
    return NextResponse.redirect(new URL('/panel', request.url))
  }

  // Usuario NO autenticado accede a ruta protegida → redirigir al login
  if (!isAuthenticated && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

// Aplicar a todas las rutas EXCEPTO archivos estáticos, API y assets comunes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - logo-molina.png (logo)
     * - .svg, .png, .jpg, .jpeg, .gif, .webp, .ico (static assets; incl. favicon_molina.ico)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|logo-molina.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
