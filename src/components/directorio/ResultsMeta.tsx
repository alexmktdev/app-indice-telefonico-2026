'use client'

export type ResultsMetaProps = {
  message: string
}

export function ResultsMeta({ message }: ResultsMetaProps) {
  return (
    <p className="mb-3 mt-4 text-sm text-muted" role="status">
      {message}
    </p>
  )
}
