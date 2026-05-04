// ─────────────────────────────────────────────────────────────
// AUTH CONTEXT
// Provee el estado de autenticación a toda la aplicación.
// Cualquier componente puede llamar useAuth() para obtener
// el usuario actual, hacer login o logout.
//
// Flujo:
// 1. Al cargar la app, llama a GET /api/auth/session
// 2. Si hay sesión → guarda el usuario en el estado
// 3. Si no hay sesión → usuario es null
// 4. login() → Firebase Auth + POST /api/auth/session
// 5. logout() → DELETE /api/auth/session
// ─────────────────────────────────────────────────────────────

'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { usePathname } from 'next/navigation'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { clientAuth } from '@/lib/firebase/client'
import { fetchWithCsrf } from '@/lib/helpers/csrf-client.helper'
import type { UsuarioSession } from '@/types/usuario.types'

// ── Tipo del contexto ─────────────────────────────────────────
interface AuthContextType {
  user: UsuarioSession | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const pathname = usePathname()
  const [user, setUser] = useState<UsuarioSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session', {
        credentials: 'include',
      })

      if (response.ok) {
        const result = await response.json() as {
          success: boolean
          data: UsuarioSession | null
        }
        if (result.success && result.data) {
          setUser(result.data)
        } else {
          setUser(null)
        }
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // En /login el middleware ya indica que no hay cookie de sesión: evitar GET en bucle con recargas de dev.
  useEffect(() => {
    if (pathname === '/login') {
      setIsLoading(false)
      return
    }
    void checkSession()
  }, [pathname, checkSession])

  // ── Login ─────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string): Promise<void> => {
    // Paso 1: Autenticar con Firebase Auth (cliente)
    const userCredential = await signInWithEmailAndPassword(clientAuth, email, password)

    // Paso 2: Obtener el idToken (JWT firmado por Firebase)
    const idToken = await userCredential.user.getIdToken()

    // Paso 3: Enviar el idToken a nuestro backend para crear session cookie
    const response = await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ idToken }),
    })

    if (!response.ok) {
      const error = await response.json() as { error: string }
      throw new Error(error.error ?? 'Error al iniciar sesión')
    }

    // Paso 4: Actualizar el estado con los datos del usuario
    await checkSession()
  }, [checkSession])

  // ── Logout ────────────────────────────────────────────────
  const logout = useCallback(async (): Promise<void> => {
    await signOut(clientAuth)

    try {
      await fetchWithCsrf<{ message: string }>('/api/auth/session', { method: 'DELETE' })
    } catch {
      // Revocación en servidor opcional si falla CSRF/red; la sesión local ya se cerró en cliente
    }

    setUser(null)
    window.location.href = '/login'
  }, [])

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: user !== null,
    login,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// ── Hook personalizado ────────────────────────────────────────
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error(
      'useAuth debe usarse dentro de un <AuthProvider>.'
    )
  }

  return context
}
