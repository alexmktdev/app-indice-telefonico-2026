// Root Layout - Envuelve la app con AuthProvider
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/context/AuthContext'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'App Indice Telefónico · Municipalidad de Molina',
  description: 'Consulta pública del índice telefónico y administración municipal.',
  icons: {
    icon: [{ url: '/favicon_molina.ico', type: 'image/x-icon', sizes: 'any' }],
    shortcut: '/favicon_molina.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
