// ─────────────────────────────────────────────────────────────
// SCHEMAS DE VALIDACIÓN — USUARIO
// ─────────────────────────────────────────────────────────────

import { z } from 'zod'
import { ROLES } from '@/types/usuario.types'

// ── Schema para CREAR un usuario ─────────────────────────────
export const CreateUsuarioSchema = z.object({
  email: z
    .string('El email es requerido')
    .email('Email inválido')
    .toLowerCase()
    .trim(),

  password: z
    .string('La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe tener al menos una mayúscula, una minúscula y un número'
    ),

  displayName: z
    .string('El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100)
    .trim(),

  role: z.enum([ROLES.ADMIN, ROLES.USER], {
    message: 'El rol debe ser "admin" o "user"',
  }),
})

// ── Schema para ACTUALIZAR un usuario ────────────────────────
export const UpdateUsuarioSchema = z.object({
  displayName: z.string().min(2).max(100).trim().optional(),
  role: z.enum([ROLES.ADMIN, ROLES.USER]).optional(),
  isActive: z.boolean().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Debes enviar al menos un campo para actualizar' }
)

// ── Schema para el LOGIN ──────────────────────────────────────
export const LoginSchema = z.object({
  idToken: z.string('Token de autenticación requerido'),
})

export type CreateUsuarioInput = z.infer<typeof CreateUsuarioSchema>
export type UpdateUsuarioInput = z.infer<typeof UpdateUsuarioSchema>
export type LoginInput = z.infer<typeof LoginSchema>
