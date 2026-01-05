'use client'

import * as React from 'react'
import { useAuth } from '@/lib/auth-context'
import { GoogleIcon } from '@/components/icons/GoogleIcon'

type GoogleSignInButtonProps = {
  className?: string
  label?: string
  /**
   * Optional explicit next path override.
   * If omitted, we resolve it from the current URL:
   * - `redirectedFrom` query param (if present)
   * - otherwise current path+query (except `/login`, which defaults to `/`)
   */
  next?: string
}

function resolveNextPath(explicitNext?: string) {
  if (explicitNext) return explicitNext
  if (typeof window === 'undefined') return undefined

  const url = new URL(window.location.href)
  const redirectedFrom = url.searchParams.get('redirectedFrom') || undefined
  if (redirectedFrom) return redirectedFrom

  if (url.pathname === '/login') return '/'
  return `${url.pathname}${url.search}`
}

export function GoogleSignInButton({
  className,
  label = 'Logg inn med Google',
  next,
}: GoogleSignInButtonProps) {
  const { loading, signInWithGoogle } = useAuth()

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => {
        const resolvedNext = resolveNextPath(next)
        console.log('[auth] GoogleSignInButton click', {
          loading,
          explicitNext: next,
          resolvedNext,
          locationHref: typeof window !== 'undefined' ? window.location.href : null,
        })
        return signInWithGoogle(resolvedNext)
      }}
      className={className}
      aria-label={label}
    >
      <GoogleIcon className="w-5 h-5" />
      {label}
    </button>
  )
}

