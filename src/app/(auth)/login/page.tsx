// Página de Login - URL: /login
import { Suspense } from 'react'
import { LoginForm } from './LoginForm'

function LoginFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D4296]" />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  )
}
