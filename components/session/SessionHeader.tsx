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
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
            Økt-ID: {sessionId}
          </span>
          <h1 className="mt-2 text-2xl font-bold text-gray-800">
            {sessionName || 'Økt'}
          </h1>
        </div>
        <button
          onClick={() => router.push('/')}
          className="text-gray-800 hover:text-gray-600 cursor-pointer"
        >
          ← Tilbake
        </button>
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  )
}
