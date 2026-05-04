'use client'

export type HeroProps = {
  logoSrc: string
  logoAlt: string
  eyebrow: string
  title: string
  phonePrefix: string
}

export function Hero({ logoSrc, logoAlt, eyebrow, title, phonePrefix }: HeroProps) {
  return (
    <header className="w-full shrink-0 bg-gradient-to-br from-brand via-brand-dark to-brand-deep px-4 py-5 text-white shadow-header sm:px-6 sm:py-6 md:py-8">
      <div className="mx-auto flex max-w-[1100px] flex-col items-center gap-4 text-center md:flex-row md:items-center md:justify-start md:gap-8 md:text-left">
        <div className="shrink-0 rounded-[14px] bg-white p-2 shadow-[0_4px_20px_rgba(0,0,0,0.12)] md:mx-0">
          <img
            src={logoSrc}
            alt={logoAlt}
            decoding="async"
            className="mx-auto block h-auto max-h-[104px] w-auto max-w-[min(280px,85vw)] object-contain object-center md:mx-0 md:max-w-[260px] md:object-left"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col items-center md:items-start">
          <p className="mb-1 text-xs uppercase tracking-[0.12em] text-white/90">{eyebrow}</p>
          <h1 className="text-[clamp(1.75rem,4vw,2.35rem)] font-extrabold uppercase leading-tight tracking-wide">
            {title}
          </h1>
          <p className="mt-3 max-w-[48ch] text-[clamp(1.125rem,2.8vw,1.45rem)] font-medium leading-[1.55] text-white/98 max-md:max-w-[34ch] max-md:px-1 md:mx-0">
            Marque <strong className="font-extrabold text-corporate-green">{phonePrefix}</strong> y el{' '}
            <strong className="font-extrabold text-corporate-green">anexo</strong> de tres o más dígitos.
          </p>
        </div>
      </div>
    </header>
  )
}
