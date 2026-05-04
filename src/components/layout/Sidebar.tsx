'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { ROLES } from '@/types/usuario.types'
import {
  LayoutDashboard,
  Phone,
  UserCog,
  UserPlus,
  CirclePlus,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useState, useCallback, useEffect } from 'react'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  adminOnly?: boolean
}

const NAV_GENERAL: NavItem[] = [
  { href: '/panel', label: 'Panel de control', icon: LayoutDashboard },
  { href: '/contactos', label: 'Índice telefónico', icon: Phone },
  { href: '/contactos/nueva', label: 'Agregar nuevo anexo', icon: CirclePlus, adminOnly: true },
]

const NAV_ADMIN: NavItem[] = [
  { href: '/usuarios', label: 'Usuarios', icon: UserCog, adminOnly: true },
  { href: '/usuarios/nueva', label: 'Nuevo usuario', icon: UserPlus, adminOnly: true },
]

function getInitials(name: string | undefined): string {
  if (!name?.trim()) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0] ?? ''}${parts[parts.length - 1]![0] ?? ''}`.toUpperCase()
}

function roleLabel(role: string | undefined): string {
  if (role === ROLES.ADMIN) return 'ADMINISTRADOR'
  if (role === ROLES.USER || role === 'viewer') return 'USUARIO'
  return role?.toUpperCase() ?? 'USUARIO'
}

interface SidebarProps {
  /** En móvil: si el drawer está abierto */
  mobileOpen?: boolean
  /** Callback para cerrar el drawer en móvil */
  onMobileClose?: () => void
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  // Cerrar drawer al navegar en móvil
  useEffect(() => {
    onMobileClose?.()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const handleLogout = useCallback(async () => {
    setLoggingOut(true)
    try {
      await logout()
    } finally {
      setLoggingOut(false)
    }
  }, [logout])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    if (href === '/usuarios') return pathname === '/usuarios'
    if (href === '/contactos') {
      if (pathname === '/contactos/nueva' || pathname.startsWith('/contactos/nueva/')) {
        return false
      }
      return pathname === '/contactos' || pathname.startsWith('/contactos/')
    }
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  const renderNavLink = (item: NavItem) => {
    if (item.adminOnly && user?.role !== ROLES.ADMIN) return null
    const active = isActive(item.href)
    const Icon = item.icon

    return (
      <Link
        key={item.href}
        href={item.href}
        title={collapsed ? item.label : undefined}
        className={`
          group flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium leading-tight transition-colors
          ${collapsed ? 'justify-center px-2' : ''}
          ${active
            ? 'bg-[#2D4296] text-white shadow-sm'
            : 'text-gray-900 hover:bg-gray-50'
          }
        `}
      >
        <span
          className={`
            flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors
            ${active
              ? 'bg-white/20 text-white'
              : 'bg-[#f3f4f6] text-gray-600 group-hover:bg-gray-200 group-hover:text-gray-800'
            }
          `}
        >
          <Icon className="h-[17px] w-[17px]" strokeWidth={2} />
        </span>
        {!collapsed && <span className="truncate">{item.label}</span>}
      </Link>
    )
  }

  const sidebarContent = (
    <aside
      className={`
        flex flex-col h-full bg-white border-r border-gray-200
        transition-[width] duration-200 ease-out
        ${collapsed ? 'w-[72px]' : 'w-[256px]'}
      `}
    >
      {/* Logo */}
      <div className="flex min-h-[110px] items-center justify-center border-b border-gray-100 px-4 py-4">
        {!collapsed ? (
          <Image
            src="/logo-molina.png"
            alt="Molina"
            width={320}
            height={90}
            className="h-[88px] w-auto max-w-[220px] object-contain object-left"
            priority
          />
        ) : (
          <Image
            src="/logo-molina.png"
            alt=""
            width={52}
            height={52}
            className="h-11 w-11 object-contain"
          />
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {!collapsed && (
          <p className="mb-2 px-2.5 text-[11px] font-bold tracking-[0.05em] text-gray-900">
            GENERAL
          </p>
        )}
        <div className="space-y-2">{NAV_GENERAL.map(renderNavLink)}</div>

        {user?.role === ROLES.ADMIN && (
          <>
            {!collapsed && (
              <p className="mb-2 mt-10 px-2.5 text-[11px] font-bold tracking-[0.05em] text-gray-900">
                ADMINISTRACIÓN
              </p>
            )}
            <div className={`space-y-2 ${collapsed ? 'mt-10' : ''}`}>{NAV_ADMIN.map(renderNavLink)}</div>
          </>
        )}
      </nav>

      {/* Tarjeta de usuario */}
      <div className="border-t border-gray-100 p-3">
        {!collapsed ? (
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#2D4296] text-xs font-bold text-white">
              {getInitials(user?.displayName)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900">
                {user?.displayName ?? 'Usuario'}
              </p>
              <p className="truncate text-[10px] font-normal uppercase tracking-wide text-gray-500">
                {roleLabel(user?.role)}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex-shrink-0 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2D4296] text-xs font-bold text-white">
              {getInitials(user?.displayName)}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Contraer/expandir — solo en desktop */}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className={`
            mt-3 hidden lg:flex w-full items-center justify-center gap-2 rounded-lg py-2.5
            text-[11px] font-bold uppercase tracking-wide text-gray-900
            transition-colors hover:bg-gray-50
            ${collapsed ? 'px-0' : 'px-2'}
          `}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Contraer menú</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )

  return (
    <>
      {/* ── Desktop: sidebar fijo sticky ── */}
      <div className="hidden lg:flex lg:flex-shrink-0 sticky top-0 h-screen">
        {sidebarContent}
      </div>

      {/* ── Móvil: drawer con overlay ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          {/* Panel */}
          <div className="relative flex flex-col h-full shadow-xl z-50">
            {/* Botón cerrar */}
            <button
              type="button"
              onClick={onMobileClose}
              className="absolute top-3 right-3 z-50 p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}
