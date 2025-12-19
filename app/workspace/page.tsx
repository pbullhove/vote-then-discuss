'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'
import { UserAvatarMenu } from '@/components/UserAvatarMenu'
import { AppShell } from '@/components/layout/AppShell'
import { primaryButtonClass } from '@/components/ui/PrimaryButton'

interface Session {
  id: string
  name: string | null
  created_at: string
  updated_at: string
}

export default function WorkspacePage() {
  const router = useRouter()
  const { user, loading: authLoading, signOut } = useAuth()
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoadingSessions, setIsLoadingSessions] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (user && !authLoading) {
      loadSessions()
    } else if (!authLoading && !user) {
      setIsLoadingSessions(false)
    }
  }, [user, authLoading])

  const loadSessions = async () => {
    if (!user) return

    setIsLoadingSessions(true)
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSessions(data || [])
    } catch (error) {
      console.error('Error loading sessions:', error)
    } finally {
      setIsLoadingSessions(false)
    }
  }

  const createSession = () => {
    router.push('/create-session')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('nb-NO', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const loadingView = (
    <div className="rounded-xl border border-[var(--border)] bg-white/70 p-6">
      <p className="text-[var(--muted-foreground)]">Laster innhold...</p>
    </div>
  )

  if (!user || authLoading || isLoadingSessions) {
    return (
      <AppShell
        title="Arbeidsområde"
        description="Administrer økter og se svarene samlet."
        userMenu={user ? <UserAvatarMenu user={user} onSignOut={signOut} /> : null}
        actions={
          user ? (
            <button
              onClick={createSession}
              className="rounded-lg border border-[var(--border)] bg-[var(--muted)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-white"
            >
              Ny økt
            </button>
          ) : null
        }
      >
        {loadingView}
      </AppShell>
    )
  }

  return (
    <AppShell
      title="Arbeidsområde"
      description="Notat-lignende oversikt over øktene dine."
      userMenu={<UserAvatarMenu user={user} onSignOut={signOut} />}
      actions={
        <button
          onClick={createSession}
          className={primaryButtonClass}
        >
          Ny økt
        </button>
      }
    >
      <div className="grid gap-5">
        <div className="rounded-xl border border-[var(--border)] bg-white/70 shadow-sm p-6 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-[var(--muted-foreground)]">Start noe nytt</p>
            <h2 className="text-xl font-semibold">Opprett en ny økt</h2>
            <p className="text-[var(--muted-foreground)]">
              Samle spørsmål, la folk svare i fred og se svarene sammen i ett rom.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={createSession}
              className={primaryButtonClass}
            >
              Ny økt
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-white/70 shadow-sm p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Mine økter</h2>
              <p className="text-sm text-[var(--muted-foreground)]">
                En ren liste over øktene dine, sortert etter siste endring.
              </p>
            </div>
            <button
              onClick={loadSessions}
              className="rounded-lg border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-xs font-medium text-[var(--foreground)] hover:bg-white"
            >
              Oppdater
            </button>
          </div>

          {sessions.length === 0 ? (
            <div className="mt-6 rounded-lg border border-dashed border-[var(--border)] bg-[var(--muted)] px-4 py-8 text-center">
              <p className="text-[var(--muted-foreground)]">
                Ingen økter ennå. Lag din første for å komme i gang.
              </p>
            </div>
          ) : (
            <div className="mt-4 divide-y divide-[var(--border)] rounded-lg border border-[var(--border)] bg-white">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-[var(--muted)]"
                  onClick={() => router.push(`/session/${session.id}`)}
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{session.name || `Økt ${session.id}`}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      ID: {session.id} • Opprettet {formatDate(session.created_at)}
                    </p>
                  </div>
                  <svg
                    className="h-4 w-4 text-[var(--muted-foreground)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}

