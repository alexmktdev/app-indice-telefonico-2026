// ─────────────────────────────────────────────────────────────
// CSRF CLIENT HELPER
// Funciones del lado del cliente para manejar el token CSRF.
// Lee la cookie csrf-token y la envía en X-CSRF-Token header
// automáticamente en operaciones de escritura (POST, PUT, DELETE).
// ─────────────────────────────────────────────────────────────

// ── Leer el token CSRF desde la cookie ───────────────────────
export function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null

  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'csrf-token') {
      return value ?? null
    }
  }
  return null
}

// ── Fetch con CSRF token automático ──────────────────────────
// Wrapper sobre fetch que agrega automáticamente el token CSRF
// en el header para métodos de escritura.
export async function fetchWithCsrf<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const method = options?.method?.toUpperCase() ?? 'GET'

  const needsCsrf = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  }

  if (needsCsrf) {
    const csrfToken = getCsrfToken()
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken
    }
  }

  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers,
  })

  const result = await response.json() as
    | { success: true; data: T }
    | { success: false; error: string; details?: Record<string, string[]> }

  if (!response.ok || !result.success) {
    // Si hay detalles de validación (Zod), los serializamos en el mensaje
    if (!result.success && result.details) {
      throw new Error(JSON.stringify(result.details))
    }
    throw new Error(!result.success ? result.error : 'Error desconocido')
  }

  return (result as { success: true; data: T }).data
}
