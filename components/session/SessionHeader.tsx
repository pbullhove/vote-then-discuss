import { useRouter } from 'next/navigation'

interface SessionHeaderProps {
  sessionName: string | null
  sessionId: string
}

export function SessionHeader({ sessionName, sessionId }: SessionHeaderProps) {
  const router = useRouter()

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">
          {sessionName || `Økt ${sessionId}`}
        </h1>
        <button
          onClick={() => router.push('/')}
          className="text-gray-600 hover:text-gray-800"
        >
          ← Tilbake
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-4">Økt-ID: {sessionId}</p>
    </div>
  )
}
