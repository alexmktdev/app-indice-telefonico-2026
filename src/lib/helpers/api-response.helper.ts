// ─────────────────────────────────────────────────────────────
// API RESPONSE HELPER
// Funciones puras que crean objetos NextResponse estandarizados.
// Cada API Route usará estas funciones para responder,
// garantizando que SIEMPRE tengan el mismo formato:
//   Éxito: { success: true, data: T, message?: string }
//   Error: { success: false, error: string, details?: unknown }
// ─────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import type { ApiResponse, ApiError } from '@/types/api.types'

// ── Respuesta exitosa (200 OK) ────────────────────────────────
// <T> es genérico: puede ser Persona, Usuario, un array, etc.
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    { success: true as const, data, message },
    { status }
  )
}

// ── Respuesta de creación exitosa (201 Created) ───────────────
export function createdResponse<T>(
  data: T,
  message: string = 'Recurso creado exitosamente'
): NextResponse<ApiResponse<T>> {
  return successResponse(data, message, 201)
}

// ── Respuesta de error (genérica) ────────────────────────────
export function errorResponse(
  error: string,
  status: number = 500,
  details?: unknown
): NextResponse<ApiError> {
  return NextResponse.json(
    { success: false as const, error, details },
    { status }
  )
}

// ── Errores HTTP comunes ──────────────────────────────────────
// Los nombramos con su significado semántico para que el código
// sea más legible: badRequestResponse() es más claro que errorResponse('...', 400)

export function badRequestResponse(
  error: string = 'Datos inválidos',
  details?: unknown
): NextResponse<ApiError> {
  return errorResponse(error, 400, details)
}

export function unauthorizedResponse(
  error: string = 'No autenticado. Inicia sesión.'
): NextResponse<ApiError> {
  return errorResponse(error, 401)
}

export function forbiddenResponse(
  error: string = 'No tienes permisos para realizar esta acción.'
): NextResponse<ApiError> {
  return errorResponse(error, 403)
}

export function notFoundResponse(
  error: string = 'Recurso no encontrado.'
): NextResponse<ApiError> {
  return errorResponse(error, 404)
}

export function conflictResponse(
  error: string = 'El recurso ya existe.'
): NextResponse<ApiError> {
  return errorResponse(error, 409)
}

export function tooManyRequestsResponse(
  error: string = 'Demasiadas solicitudes. Intenta más tarde.',
  retryAfter?: number
): NextResponse<ApiError> {
  const response = errorResponse(error, 429)
  if (retryAfter) {
    response.headers.set('Retry-After', String(retryAfter))
  }
  return response
}

export function internalErrorResponse(
  error: string = 'Error interno del servidor.'
): NextResponse<ApiError> {
  return errorResponse(error, 500)
}
