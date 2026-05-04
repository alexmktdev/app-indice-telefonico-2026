// ─────────────────────────────────────────────────────────────
// SANITIZE HELPER
// La sanitización es la ÚLTIMA línea de defensa contra XSS.
// Zod ya validó que el formato es correcto.
// Ahora nos aseguramos de que el contenido es seguro.
//
// Flujo: Input -> Zod valida estructura -> Sanitize limpia contenido
// ─────────────────────────────────────────────────────────────

// ── Sanitizar un string individual ───────────────────────────
export function sanitizeString(input: string): string {
  return input
    .trim()
    // Eliminar todos los tags HTML (<script>, </div>, <img>, etc.)
    .replace(/<[^>]*>/g, '')
    // Eliminar caracteres de control (invisibles pero peligrosos)
    .replace(/[\x00-\x1F\x7F]/g, '')
}

// ── Sanitizar un objeto completo recursivamente ───────────────
// Recorre todos los campos y sanitiza los strings.
// Si encuentra un objeto anidado (como "direccion"), lo procesa también.
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      if (typeof value === 'string') {
        return [key, sanitizeString(value)]
      }
      if (
        value !== null &&
        typeof value === 'object' &&
        !Array.isArray(value)
      ) {
        return [key, sanitizeObject(value as Record<string, unknown>)]
      }
      return [key, value]
    })
  )
  return sanitized as T
}

// ── Sanitizar RUT (caso especial) ────────────────────────────
// El RUT solo puede contener dígitos, puntos y guión
export function sanitizeRut(rut: string): string {
  return rut.trim().toUpperCase().replace(/[^0-9.\-K]/g, '')
}

// ── Sanitizar email ───────────────────────────────────────────
export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase().replace(/[^a-z0-9@.\-_+]/g, '')
}
