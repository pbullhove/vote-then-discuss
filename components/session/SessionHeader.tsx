import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'

interface SessionHeaderProps {
  sessionName: string | null
  sessionId: string
  children?: ReactNode
}

export function SessionHeader({ sessionName, sessionId, children }: SessionHeaderProps) {
  const router = useRouter()

  return (
    <div className="rounded-xl border border-[var(--border)] bg-white/70 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--muted)] px-3 py-1 text-xs font-semibold text-[var(--muted-foreground)]">
            Økt-ID: {sessionId}
          </span>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">
            {sessionName || 'Økt'}
          </h1>
        </div>
        <button
          onClick={() => router.push('/workspace')}
          className="text-sm text-[var(--muted-foreground)] underline decoration-[var(--border)] decoration-2 underline-offset-4 hover:text-[var(--foreground)]"
        >
          Til arbeidsområde
        </button>
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  )
}
