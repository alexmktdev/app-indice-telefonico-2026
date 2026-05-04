// ─────────────────────────────────────────────────────────────
// TIPOS DE USUARIO
// Un "usuario" es quien administra la aplicación (admin o user)
// No confundir con "persona" que es quien se gestiona en el sistema
// ─────────────────────────────────────────────────────────────

// Los roles posibles del sistema
// "as const" hace que TypeScript trate estos valores como literales exactos
export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const

// Alias legado para compatibilidad temporal con datos antiguos.
export const LEGACY_VIEWER_ROLE = 'viewer' as const

// Tipo derivado de ROLES: solo puede ser 'admin' o 'user'
export type Role = (typeof ROLES)[keyof typeof ROLES]

// La entidad Usuario completa (como se guarda en Firestore)
export interface Usuario {
  id: string              // = Firebase Auth UID
  email: string
  displayName: string
  role: Role
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Lo que se necesita para crear un usuario nuevo
export interface CreateUsuarioDTO {
  email: string
  password: string        // Solo al crear, nunca se guarda en Firestore
  displayName: string
  role: Role
}

// Lo que se puede actualizar de un usuario
// Partial<> hace que todos los campos sean opcionales
export interface UpdateUsuarioDTO {
  displayName?: string
  role?: Role
  isActive?: boolean
}

// Lo que el frontend recibe sobre el usuario autenticado
// Nunca incluye password ni datos sensibles
export interface UsuarioSession {
  uid: string
  email: string
  displayName: string
  role: Role
}
