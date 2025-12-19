'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/Navbar'
import { primaryButtonClass } from '@/components/ui/PrimaryButton'

const normalizeSessionCode = (value: string) =>
  value
    .toUpperCase()
    .replace(/\s+/g, '')
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 4)

export default function Home() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [sessionCode, setSessionCode] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const joinSession = async () => {
    const code = normalizeSessionCode(sessionCode)
    setSessionCode(code)
    setErrorMessage(null)

    if (code.length !== 4) {
      setErrorMessage('Skriv inn en gyldig kode (4 tegn).')
      return
    }

    setIsJoining(true)
    try {
      const { data, error } = await supabase.from('sessions').select('id').eq('id', code).single()

      if (error || !data) {
        setErrorMessage('Fant ingen økt med den koden. Sjekk koden og prøv igjen.')
        return
      }

      router.push(`/session/${code}`)
    } catch (error) {
      console.error('Error joining session:', error)
      setErrorMessage('Kunne ikke sjekke økten akkurat nå. Prøv igjen om litt.')
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col">
      <Navbar />

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-xl -translate-y-12">
          <div className="rounded-2xl border border-[var(--border)] bg-white/70 p-6 shadow-sm sm:p-8">
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault()
                joinSession()
              }}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                <input
                  value={sessionCode}
                  onChange={(e) => {
                    setSessionCode(normalizeSessionCode(e.target.value))
                    if (errorMessage) setErrorMessage(null)
                  }}
                  inputMode="text"
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="Spillkode"
                  aria-label="Øktkode"
                  className="h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 text-center text-lg font-semibold tracking-[0.2em] text-[var(--foreground)] shadow-sm placeholder:tracking-normal placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isJoining}
                  className={`${primaryButtonClass} h-12 shrink-0 px-5`}
                >
                  {isJoining ? 'Sjekker…' : 'Bli med'}
                </button>
              </div>

              {errorMessage ? (
                <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)] px-4 py-3 text-sm text-[var(--foreground)]">
                  {errorMessage}
                </div>
              ) : null}
            </form>
          </div>

        </div>
      </main>
    </div>
  )
}
