'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type Options = {
  resetMs?: number
}

export function useCopyFeedback(options: Options = {}) {
  const { resetMs = 2000 } = options
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const copy = useCallback(
    (text: string, key: string) => {
      void navigator.clipboard.writeText(text).then(() => {
        setCopiedKey(key)
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => setCopiedKey(null), resetMs)
      })
    },
    [resetMs],
  )

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    },
    [],
  )

  return { copiedKey, copy }
}
