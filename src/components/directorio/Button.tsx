'use client'

import type { ComponentProps } from 'react'
import { twMerge } from 'tailwind-merge'

const BASE =
  'inline-flex items-center justify-center rounded-[10px] px-3.5 py-2 text-sm font-semibold transition active:scale-[0.98] focus-visible:outline-none'

const VARIANT_CLASS = {
  primary:
    'bg-brand text-white hover:bg-brand-dark focus-visible:ring-4 focus-visible:ring-corporate-green/35',
  secondary:
    'border border-border-molina bg-surface-2 text-foreground hover:border-corporate-green hover:bg-corporate-green/15 hover:text-brand-dark',
  ghost:
    'mt-2 border border-border-molina bg-transparent text-brand hover:border-corporate-green hover:text-corporate-green-dark',
} as const

export type ButtonVariant = keyof typeof VARIANT_CLASS

export type ButtonProps = Omit<ComponentProps<'button'>, 'className'> & {
  variant?: ButtonVariant
  className?: string
}

export function Button({
  variant = 'primary',
  type = 'button',
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={twMerge(BASE, VARIANT_CLASS[variant], className)}
      {...rest}
    />
  )
}
