'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { ROLES } from '@/types/usuario.types'
import { Phone, UserPlus, UserCog, Activity } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface DashboardData {
  indice: { total: number; nuevasEsteMes: number }
  usuarios?: { total: number }
  generadoEn: string
  rol: string
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string
  value: number
  subtitle: string
  icon: LucideIcon
  color: 'blue' | 'green' | 'purple' | 'orange'
}) {
  const theme = {
    blue: {
      accent: 'h-1 bg-gradient-to-r from-brand via-brand-dark to-sky-500',
      iconBox: 'bg-gradient-to-br from-brand to-brand-dark text-white shadow-sm shadow-slate-900/10',
      value: 'text-brand-dark',
      subtitle: 'text-slate-600',
    },
    green: {
      accent: 'h-1 bg-gradient-to-r from-corporate-green via-emerald-500 to-teal-600',
      iconBox:
        'bg-gradient-to-br from-corporate-green to-emerald-700 text-white shadow-sm shadow-slate-900/10',
      value: 'text-emerald-800',
      subtitle: 'text-emerald-900/75',
    },
    purple: {
      accent: 'h-1 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600',
      iconBox:
        'bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-sm shadow-slate-900/10',
      value: 'text-indigo-900',
      subtitle: 'text-indigo-950/70',
    },
    orange: {
      accent: 'h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500',
      iconBox:
        'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm shadow-slate-900/10',
      value: 'text-amber-900',
      subtitle: 'text-amber-950/75',
    },
  }[color]

  return (
    <div
      className={`
        group flex h-full w-full flex-col overflow-hidden rounded-xl border border-slate-200/80
        bg-white shadow-[0_2px_12px_rgba(15,23,42,0.045)] transition-[box-shadow] duration-200
        hover:shadow-[0_4px_18px_rgba(15,23,42,0.065)]
      `}
    >
      <div className={`w-full shrink-0 ${theme.accent}`} aria-hidden />
      <div className="flex flex-1 items-start gap-3 px-4 py-4 sm:gap-4 sm:px-5 sm:py-5">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12 ${theme.iconBox}`}
        >
          <Icon className="h-5 w-5 sm:h-[22px] sm:w-[22px]" strokeWidth={2.25} />
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p className="text-xs font-semibold text-slate-500 sm:text-sm">{title}</p>
          <p
            className={`mt-1 text-2xl font-extrabold tabular-nums tracking-tight sm:text-3xl ${theme.value}`}
          >
            {value}
          </p>
          <p className={`mt-1.5 text-xs font-medium leading-snug text-balance sm:text-[13px] ${theme.subtitle}`}>
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function PanelPage() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await fetch('/api/dashboard', { credentials: 'include' })
        const result = (await res.json()) as {
          success: boolean
          data: DashboardData
          error?: string
        }
        if (!result.success) throw new Error(result.error)
        setData(result.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar')
      } finally {
        setIsLoading(false)
      }
    }
    void cargar()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded-lg w-48 animate-pulse" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-full overflow-hidden rounded-xl border border-gray-200/80 bg-gray-50 shadow-[0_2px_10px_rgba(15,23,42,0.04)] animate-pulse"
            >
              <div className="h-1 bg-gray-300" />
              <div className="flex items-start gap-3 px-4 py-4 sm:gap-4 sm:px-5 sm:py-5">
                <div className="h-11 w-11 shrink-0 rounded-xl bg-gray-200 sm:h-12 sm:w-12" />
                <div className="min-w-0 flex-1 space-y-2 pt-0.5">
                  <div className="h-3 w-28 rounded bg-gray-200" />
                  <div className="h-8 w-16 rounded bg-gray-200" />
                  <div className="h-3 w-full max-w-[220px] rounded bg-gray-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">{error}</div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bienvenido, {user?.displayName}</h1>
        <p className="text-gray-500 mt-1">Resumen del índice telefónico y administración</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        <StatCard
          title="Entradas en el índice"
          value={data?.indice.total ?? 0}
          subtitle="Anexos activos visibles al público"
          icon={Phone}
          color="blue"
        />
        <StatCard
          title="Nuevas este mes"
          value={data?.indice.nuevasEsteMes ?? 0}
          subtitle="Alta de entradas en el mes actual"
          icon={UserPlus}
          color="green"
        />
        {user?.role === ROLES.ADMIN && data?.usuarios && (
          <StatCard
            title="Usuarios del sistema"
            value={data.usuarios.total}
            subtitle="Administradores y lectores"
            icon={UserCog}
            color="purple"
          />
        )}
      </div>

      <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-[0_2px_12px_rgba(15,23,42,0.045)] sm:flex sm:items-center sm:justify-between sm:gap-4 sm:p-4">
        <div className="flex gap-2.5 sm:gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-brand-dark text-white shadow-sm shadow-slate-900/10 sm:h-10 sm:w-10">
            <Activity className="h-4 w-4 sm:h-[18px] sm:w-[18px]" strokeWidth={2.25} />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs font-bold text-gray-900 sm:text-sm">Tu acceso</h2>
            <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600 sm:text-xs">
              {user?.role === ROLES.ADMIN
                ? 'Puedes crear, editar y dar de baja entradas del índice y gestionar usuarios.'
                : 'Puedes ver las entradas del índice telefónico en modo lectura.'}
            </p>
          </div>
        </div>
        <span
          className={`mt-2 inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow-sm shadow-slate-900/15 sm:mt-0 sm:px-3 sm:py-1 sm:text-[10px] ${
            user?.role === ROLES.ADMIN
              ? 'bg-gradient-to-r from-corporate-green to-emerald-600'
              : 'bg-gradient-to-r from-sky-500 to-brand'
          }`}
        >
          {user?.role === ROLES.ADMIN ? 'Administrador' : 'Solo lectura'}
        </span>
      </div>
    </div>
  )
}
