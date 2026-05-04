import { z } from 'zod'

export const CreateContactoIndiceSchema = z.object({
  extension: z
    .string('El anexo es requerido')
    .trim()
    .min(1, 'El anexo es requerido')
    .max(10, 'El anexo no puede superar 10 caracteres')
    .regex(/^\d+$/, 'El anexo debe contener solo dígitos'),

  department: z
    .string('La dependencia es requerida')
    .trim()
    .min(2, 'La dependencia debe tener al menos 2 caracteres')
    .max(300, 'La dependencia no puede superar 300 caracteres'),

  name: z
    .string()
    .trim()
    .max(200, 'El nombre no puede superar 200 caracteres')
    .optional()
    .default(''),
})

export const UpdateContactoIndiceSchema = z
  .object({
    extension: z
      .string()
      .trim()
      .min(1)
      .max(10)
      .regex(/^\d+$/)
      .optional(),
    department: z.string().trim().min(2).max(300).optional(),
    name: z.string().trim().max(200).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Debes enviar al menos un campo para actualizar',
  })

export type CreateContactoIndiceInput = z.infer<typeof CreateContactoIndiceSchema>
export type UpdateContactoIndiceInput = z.infer<typeof UpdateContactoIndiceSchema>
