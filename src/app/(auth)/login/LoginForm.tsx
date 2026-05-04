'use client'

import { useState, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Eye, EyeOff } from 'lucide-react'

/** Evita open redirect y destinos que no son rutas de la app (p. ej. assets). */
function safePostLoginPath(from: string | null): string {
  if (!from || !from.startsWith('/') || from.startsWith('//')) return '/panel'
  if (/\.(?:ico|png|jpg|jpeg|gif|webp|svg|css|js|map|woff2?)$/i.test(from)) return '/panel'
  return from
}

export function LoginForm() {
  const { login, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await login(email, password)
      const from = safePostLoginPath(searchParams.get('from'))
      router.push(from)
      router.refresh()
    } catch (err) {
      const firebaseError = err as { code?: string; message?: string }

      if (
        firebaseError.code === 'auth/invalid-credential' ||
        firebaseError.code === 'auth/user-not-found' ||
        firebaseError.code === 'auth/wrong-password'
      ) {
        setError('Email o contraseña incorrectos')
      } else if (firebaseError.code === 'auth/too-many-requests') {
        setError('Demasiados intentos. Espera unos minutos.')
      } else if (firebaseError.code === 'auth/user-disabled') {
        setError('Tu cuenta está deshabilitada. Contacta al administrador.')
      } else {
        setError(firebaseError.message ?? 'Error al iniciar sesión')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D4296]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FB] px-4 py-4">
      <div className="w-full max-w-[390px] bg-white rounded-[16px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6">
        <div className="flex justify-center mb-4">
          <img
            src="/logo-molina.png"
            alt="Logo Molina"
            className="w-[220px] h-auto object-contain"
          />
        </div>

        <div className="text-center mb-6">
          <h1 className="text-[20px] font-bold text-[#1A1C1E] mb-0.5">Acceso al Sistema</h1>
          <p className="text-[10px] font-bold text-[#2D4296] tracking-[0.05em] uppercase">
            Administración índice telefónico
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 rounded-lg px-3 py-1.5 text-[12px] text-center">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label htmlFor="email" className="block text-[11px] font-semibold text-[#44474E]">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="correo@molina.cl"
              className="w-full h-[38px] px-3 bg-white border border-[#DDE2EB] rounded-[8px] text-[14px] text-gray-900 placeholder-[#8E9199] focus:outline-none focus:ring-2 focus:ring-[#2D4296]/20 focus:border-[#2D4296] transition-all"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="block text-[11px] font-semibold text-[#44474E]">
                Contraseña
              </label>
              <button
                type="button"
                className="text-[11.5px] font-medium text-[#2D4296] hover:underline"
              >
                ¿Olvidó su contraseña?
              </button>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full h-[38px] px-3 pr-9 bg-white border border-[#DDE2EB] rounded-[8px] text-[14px] text-gray-900 placeholder-[#8E9199] focus:outline-none focus:ring-2 focus:ring-[#2D4296]/20 focus:border-[#2D4296] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#44474E] hover:text-[#1A1C1E] transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-[42px] bg-[#2D4296] text-white rounded-[10px] text-[13px] font-bold hover:bg-[#1E2D6B] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-[#2D4296]/20 mt-1"
          >
            {isSubmitting ? 'Cargando...' : 'Ingresar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[9px] font-bold text-[#44474E] leading-relaxed uppercase tracking-wider">
            © 2026 Municipalidad de Molina - Acceso exclusivo solo personal autorizado
          </p>
        </div>
      </div>
    </div>
  )
}
