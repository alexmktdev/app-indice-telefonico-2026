// ─────────────────────────────────────────────────────────────
// TIPOS DE LA API
// Definen la forma estándar de todas las respuestas del backend
// Así el frontend siempre sabe qué esperar
// ─────────────────────────────────────────────────────────────

// Respuesta exitosa genérica
// <T> es un genérico: T puede ser Persona, Usuario, etc.
export interface ApiResponse<T> {
  success: true
  data: T
  message?: string
}

// Respuesta de error
export interface ApiError {
  success: false
  error: string
  details?: unknown    // Detalles adicionales (ej: errores de validación)
}

// La respuesta de cualquier endpoint es una de las dos
export type ApiResult<T> = ApiResponse<T> | ApiError

// Para endpoints que devuelven listas con paginación
export interface PaginatedResponse<T> {
  success: true
  data: T[]
  total: number
  page: number
  limit: number
}
