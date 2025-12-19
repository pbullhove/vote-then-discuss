'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'
import { UserAvatarMenu } from '@/components/UserAvatarMenu'
import { AppShell } from '@/components/layout/AppShell'

const TrashIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 7h12m-9 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m-7 0h8l-.8 12a2 2 0 0 1-2 2H9.8a2 2 0 0 1-2-2L7 7Zm3 4v6m4-6v6"
    />
  </svg>
)

interface Question {
  id: string
  text: string
}

export default function CreateSessionPage() {
  const router = useRouter()
  const { user, loading: authLoading, signOut } = useAuth()
  const supabase = createClient()

  const [sessionName, setSessionName] = useState('')
  const [questions, setQuestions] = useState<Question[]>([{ id: '1', text: '' }])
  const [isCreating, setIsCreating] = useState(false)

  const hasValidQuestions = questions.some((q) => q.text.trim())

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const generateSessionId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const addQuestion = () => {
    const newId = String(Date.now() + Math.random())
    setQuestions([...questions, { id: newId, text: '' }])
  }

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== id))
    }
  }

  const updateQuestion = (id: string, text: string) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, text } : q)))
  }

  const createSession = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    const validQuestions = questions.filter((q) => q.text.trim())
    if (validQuestions.length === 0) {
      alert('Vennligst legg til minst ett spørsmål før du oppretter økten.')
      return
    }

    setIsCreating(true)
    try {
      let sessionId = generateSessionId()
      let attempts = 0
      const maxAttempts = 10

      while (attempts < maxAttempts) {
        const { data: existing } = await supabase
          .from('sessions')
          .select('id')
          .eq('id', sessionId)
          .single()

        if (!existing) {
          break
        }
        sessionId = generateSessionId()
        attempts++
      }

      if (attempts >= maxAttempts) {
        throw new Error('Kunne ikke generere unik økt-ID. Vennligst prøv igjen.')
      }

      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          id: sessionId,
          name: sessionName?.trim() || null,
          user_id: user.id,
        })
        .select()
        .single()

      if (sessionError) throw sessionError

      const questionsToInsert = validQuestions.map((q, index) => ({
        session_id: sessionId,
        question_text: q.text.trim(),
        question_order: index + 1,
      }))

      const { error: questionsError } = await supabase.from('questions').insert(questionsToInsert)

      if (questionsError) throw questionsError

      if (sessionData) {
        router.push(`/session/${sessionData.id}`)
      }
    } catch (error) {
      console.error('Error creating session:', error)
      alert('Kunne ikke opprette økt. Vennligst prøv igjen.')
    } finally {
      setIsCreating(false)
    }
  }

  const loadingShell = (
    <AppShell
      title="Opprett ny økt"
      description="Sett opp spørsmålene dine før deltakerne svarer."
      userMenu={user ? <UserAvatarMenu user={user} onSignOut={signOut} /> : null}
    >
      <div className="rounded-xl border border-[var(--border)] bg-white/70 p-6 text-[var(--muted-foreground)]">
        Laster...
      </div>
    </AppShell>
  )

  if (authLoading) {
    return loadingShell
  }

  if (!user) {
    return loadingShell
  }

  return (
    <AppShell
      title="Opprett ny økt"
      description="Gi økten et navn, legg til spørsmål og del den unike lenken."
      userMenu={<UserAvatarMenu user={user} onSignOut={signOut} />}
      actions={
        <button
          onClick={createSession}
          disabled={isCreating || !hasValidQuestions}
          className="rounded-lg border border-[var(--border)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[var(--accent-muted)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isCreating ? 'Oppretter...' : 'Opprett økt'}
        </button>
      }
    >
      <div className="grid gap-5">
        <div className="rounded-xl border border-[var(--border)] bg-white/70 shadow-sm p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm text-[var(--muted-foreground)]">Grunnlag</p>
              <h2 className="text-lg font-semibold">Detaljer for økten</h2>
              <p className="text-sm text-[var(--muted-foreground)]">
                Velg et navn (valgfritt) for å kjenne igjen økten i listen din.
              </p>
            </div>
            <button
              onClick={() => router.push('/workspace')}
              className="text-sm text-[var(--muted-foreground)] underline decoration-[var(--border)] decoration-2 underline-offset-4 hover:text-[var(--foreground)]"
            >
              Til arbeidsområde
            </button>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)]">Øktnavn (valgfritt)</label>
            <input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="F.eks. Produktgjennomgang uke 42"
              className="w-full rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-[var(--foreground)] shadow-sm placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-white/70 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Spørsmål</h2>
              <p className="text-sm text-[var(--muted-foreground)]">
                Legg inn spørsmålene deltakerne skal svare på før diskusjon.
              </p>
            </div>
            <button
              onClick={addQuestion}
              className="rounded-lg border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-xs font-medium text-[var(--foreground)] hover:bg-white"
            >
              + Legg til spørsmål
            </button>
          </div>

          <div className="space-y-3">
            {questions.map((question, index) => (
              <div
                key={question.id}
                className="rounded-lg border border-[var(--border)] bg-white/80 px-4 py-3 shadow-sm"
              >
                <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                  <span>Spørsmål {index + 1}</span>
                  {questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(question.id)}
                      className="flex items-center gap-1 rounded-md px-2 py-1 text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
                    >
                      <TrashIcon className="h-4 w-4" />
                      Fjern
                    </button>
                  )}
                </div>
                <textarea
                  value={question.text}
                  onChange={(e) => updateQuestion(question.id, e.target.value)}
                  placeholder="Skriv inn spørsmålet ditt..."
                  className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--muted)] px-3 py-3 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)] focus:bg-white focus:outline-none"
                  rows={3}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={addQuestion}
              className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              + Legg til et spørsmål til
            </button>
            <button
              onClick={createSession}
              disabled={isCreating || !hasValidQuestions}
              className="rounded-lg border border-[var(--border)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[var(--accent-muted)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreating ? 'Oppretter...' : 'Opprett økt'}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
