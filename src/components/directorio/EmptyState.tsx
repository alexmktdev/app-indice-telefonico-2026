'use client'

import { Button } from './Button'

export type EmptyStateProps = {
  message: string
  actionLabel: string
  onAction: () => void
}

export function EmptyState({ message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="px-6 py-12 text-center text-muted">
      <p>{message}</p>
      <Button variant="ghost" type="button" onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  )
}
