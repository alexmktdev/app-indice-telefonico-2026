'use client'

import type { CatalogContact } from '@/types/contacto-indice.types'
import { Button } from './Button'

export type ContactCardProps = {
  contact: CatalogContact
  fullNumber: string
  callHref: string
  onCopyNumber: () => void
  copyButtonLabel: string
}

export function ContactCard({
  contact,
  fullNumber,
  callHref,
  onCopyNumber,
  copyButtonLabel,
}: ContactCardProps) {
  return (
    <li className="group relative flex flex-col gap-2 overflow-hidden rounded-2xl border border-border-molina bg-white p-5 shadow-card transition duration-150 ease-out before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-l-2xl before:bg-gradient-to-b before:from-brand before:via-accent-sky before:to-corporate-green hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="flex flex-wrap items-baseline gap-3">
        <span
          className="font-sans text-[1.5625rem] font-extrabold tabular-nums tracking-tight text-brand sm:text-[1.625rem] group-hover:text-brand-dark"
          title="Anexo"
        >
          {contact.extension}
        </span>
      </div>
      <h2 className="text-[0.95rem] font-semibold leading-snug text-foreground">
        {contact.department}
      </h2>
      <p className="flex-1 text-[0.9rem] leading-snug text-on-surface">
        {contact.name ? (
          contact.name
        ) : (
          <span className="italic text-muted">Sin nombre en índice</span>
        )}
      </p>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-3 border-t border-border-light pt-3">
        <a
          href={callHref}
          className="min-w-0 flex-1 break-all font-sans text-lg font-extrabold tabular-nums leading-tight tracking-tight text-brand underline-offset-2 hover:text-brand-dark hover:underline sm:text-[1.3125rem]"
        >
          {fullNumber}
        </a>
        <Button
          variant="primary"
          type="button"
          onClick={onCopyNumber}
          className="shrink-0 px-4 py-2.5 text-[0.9375rem]"
        >
          {copyButtonLabel}
        </Button>
      </div>
    </li>
  )
}
