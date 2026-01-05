'use client'

import { useAuth } from '@/lib/auth-context'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'

function LoginContent() {
  const searchParams = useSearchParams()
  const redirectedFrom = searchParams.get('redirectedFrom')
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log('[auth] Login page state', {
      loading,
      hasUser: Boolean(user),
      userId: user?.id ?? null,
      redirectedFrom,
      locationHref: typeof window !== 'undefined' ? window.location.href : null,
    })
    if (!loading && user) {
      console.log('[auth] Login page redirecting after sign-in', { to: redirectedFrom || '/' })
      router.push(redirectedFrom || '/')
    }
  }, [user, loading, router, redirectedFrom])

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-[var(--muted-foreground)]">Laster...</div>
      </div>
    )
  }

  if (user) {
    return null
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <div className="bg-white/80 border border-[var(--border)] rounded-2xl shadow-sm p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Vote Then Discuss</h1>
        <p className="text-[var(--muted-foreground)] mb-8">
          Logg inn med Google for å opprette og delta i avstemmingsøkter.
        </p>
        <GoogleSignInButton
          className="w-full bg-white border border-[var(--border)] text-[var(--foreground)] py-3 px-6 rounded-lg font-medium hover:bg-[var(--muted)] transition-colors flex items-center justify-center gap-3 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          label="Logg inn med Google"
          next={redirectedFrom || undefined}
        />
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
          <div className="text-[var(--muted-foreground)]">Laster...</div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}

