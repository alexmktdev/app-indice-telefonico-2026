// ─────────────────────────────────────────────────────────────
// NEXT.JS CONFIGURATION
// Configura headers de seguridad HTTP y CORS para toda la app.
//
// Los headers HTTP son metadatos que el servidor envía con
// cada respuesta. El navegador los lee y ajusta su comportamiento.
//
// Esta configuración aplica en producción Y desarrollo.
// ─────────────────────────────────────────────────────────────

import path from 'path'
import type { NextConfig } from 'next'

/**
 * Raíz del app para Turbopack. Debe coincidir con `node_modules/next` (donde corres `npm run dev`).
 * `import.meta.url` del config compilado a veces apunta a `.next`/tmp y empeora "Next.js package not found".
 */
const turbopackRoot = path.resolve(process.cwd())

// URL de tu aplicación (para CORS)
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

// Content Security Policy: define qué recursos puede cargar tu página
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: blob: https:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self'
    https://*.googleapis.com
    https://*.firebase.com
    https://*.firebaseio.com
    https://identitytoolkit.googleapis.com
    https://securetoken.googleapis.com;
  frame-src 'none';
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
`.replace(/\n/g, ' ').trim()

const nextConfig: NextConfig = {
  // Evita Turbopack "Next.js package not found" cuando infiere mal la raíz (p. ej. lockfiles fuera del app).
  // @see https://github.com/vercel/next.js/issues/76028#issuecomment-2874870886
  turbopack: {
    root: turbopackRoot,
  },

  async headers() {
    return [
      // ══════════════════════════════════════════════════════
      // BLOQUE 1: Security Headers para TODAS las rutas
      // ══════════════════════════════════════════════════════
      {
        source: '/(.*)',
        headers: [
          // Previene clickjacking: nadie puede embeber tu app en un iframe
          { key: 'X-Frame-Options', value: 'DENY' },

          // Evita que el navegador adivine el tipo de archivo (MIME sniffing)
          { key: 'X-Content-Type-Options', value: 'nosniff' },

          // Fuerza HTTPS por 2 años
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },

          // Controla qué info se envía como Referer a otros sitios
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },

          // Desactiva prefetch de DNS por privacidad
          { key: 'X-DNS-Prefetch-Control', value: 'off' },

          // Deshabilita APIs del navegador que no necesitamos
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(), usb=()',
          },

          // Content Security Policy: defensa potente contra XSS
          { key: 'Content-Security-Policy', value: ContentSecurityPolicy },
        ],
      },

      // ══════════════════════════════════════════════════════
      // BLOQUE 2: CORS para las API Routes
      // ══════════════════════════════════════════════════════
      {
        source: '/api/(.*)',
        headers: [
          // Solo permite requests desde tu propio dominio
          { key: 'Access-Control-Allow-Origin', value: APP_URL },
          // Métodos HTTP permitidos
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          // Headers permitidos en las requests
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With' },
          // Permite que el navegador envíe cookies en requests cross-origin
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          // Cachear preflight por 24 horas
          { key: 'Access-Control-Max-Age', value: '86400' },
        ],
      },
    ]
  },

  // Habilitar compresión de respuestas (gzip)
  compress: true,

  // No revelar qué tecnología usamos (information disclosure)
  poweredByHeader: false,

  // Solo permitir imágenes de dominios específicos
  images: {
    remotePatterns: [],
  },
}

export default nextConfig
