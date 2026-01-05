'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { useAuth } from '@/lib/auth-context'
import { UserAvatarMenu } from '@/components/UserAvatarMenu'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'

type NavbarProps = {
  cta?: ReactNode
}

export function Navbar({ cta }: NavbarProps) {
  const { user, loading, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="min-w-0">
          <div className="text-lg font-semibold leading-snug">Vote, then discuss</div>
        </div>
        <div className="flex items-center gap-2">
          {!loading && user ? (
            <>
              <Link
                href="/create-session"
                className="text-sm text-[var(--muted-foreground)] underline decoration-[var(--border)] decoration-2 underline-offset-4 hover:text-[var(--foreground)]"
              >
                Opprett økt
              </Link>
              <Link
                href="/workspace"
                className="rounded-lg border border-[var(--border)] bg-[var(--muted)] px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-sm hover:bg-white"
              >
                Arbeidsområde
              </Link>
              {cta}
            </>
          ) : null}
          {!loading && !user ? (
            <GoogleSignInButton
              label="Logg inn"
              className="rounded-lg border border-[var(--border)] bg-white/70 px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-sm hover:bg-[var(--muted)] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          ) : null}
          {!loading && user ? <UserAvatarMenu user={user} onSignOut={signOut} /> : null}
        </div>
      </div>
    </header>
  )
}
