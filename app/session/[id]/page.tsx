'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { sessionService, type Answer, type Question } from '@/lib/services/session-service'
import { SessionHeader } from '@/components/session/SessionHeader'
import { LoadingState } from '@/components/session/LoadingState'
import { EmptyQuestionsState } from '@/components/session/EmptyQuestionsState'
import { QuestionInput } from '@/components/session/QuestionInput'
import { AnonymousNameInput } from '@/components/session/AnonymousNameInput'
import { QuestionCard } from '@/components/session/QuestionCard'
import { SubmissionSuccess } from '@/components/session/SubmissionSuccess'
import { AnswersView } from '@/components/session/AnswersView'
import { AppShell } from '@/components/layout/AppShell'
import { UserAvatarMenu } from '@/components/UserAvatarMenu'

type SessionDetails = {
  id: string
  name: string | null
  user_id: string
}

export default function SessionPage() {
  const params = useParams()
  const { user, loading: authLoading, signOut } = useAuth()
  const sessionId = params.id as string

  const [session, setSession] = useState<SessionDetails | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, Answer[]>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showQuestionInput, setShowQuestionInput] = useState(false)
  const [newQuestionText, setNewQuestionText] = useState('')
  const [isAddingQuestion, setIsAddingQuestion] = useState(false)
  const [showAnswersForUser, setShowAnswersForUser] = useState(true)
  const [anonymousUserId, setAnonymousUserId] = useState<string>('')
  const [anonymousUserName, setAnonymousUserName] = useState<string>('')
  const [submittedUserId, setSubmittedUserId] = useState<string>('')

  useEffect(() => {
    if (!user && !authLoading) {
      let storedId = localStorage.getItem(`anonymous_user_id_${sessionId}`)
      const storedName = localStorage.getItem(`anonymous_user_name_${sessionId}`)

      if (!storedId) {
        storedId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem(`anonymous_user_id_${sessionId}`, storedId)
      }

      if (storedName) {
        setAnonymousUserName(storedName)
        const expectedUserId = `anon_${storedName.trim()}_${storedId.split('_').slice(1).join('_')}`
        setSubmittedUserId(expectedUserId)
      }

      setAnonymousUserId(storedId)
    }
  }, [user, authLoading, sessionId])

  const userId = user?.id || anonymousUserId

  const stableUserId = useMemo(() => user?.id || '', [user?.id])
  const stableAnonymousUserId = useMemo(() => anonymousUserId || '', [anonymousUserId])
  const stableAnonymousUserName = useMemo(() => anonymousUserName || '', [anonymousUserName])
  const isSessionOwner = !!(session?.user_id && user?.id === session.user_id)
  const userAnswersToggleKey = useMemo(() => `session_${sessionId}_answers_visible`, [sessionId])
  const isViewingAnswers = isSubmitted && showAnswersForUser

  useEffect(() => {
    const stored = localStorage.getItem(userAnswersToggleKey)
    if (stored !== null) {
      setShowAnswersForUser(stored === 'true')
    }
  }, [userAnswersToggleKey])

  const loadSessionData = useCallback(async () => {
    const data = await sessionService.loadSession(sessionId)
    setSession(data || null)
  }, [sessionId])

  const loadQuestions = useCallback(async () => {
    try {
      const data = await sessionService.loadQuestions(sessionId)
      setQuestions(data)
    } catch (error) {
      console.error('Error loading questions:', error)
    } finally {
      setIsLoading(false)
    }
  }, [sessionId])

  const checkSubmissionStatus = useCallback(async () => {
    try {
      let userIdToCheck: string

      if (user) {
        userIdToCheck = userId
      } else if (anonymousUserId && anonymousUserName) {
        userIdToCheck = `anon_${anonymousUserName.trim()}_${anonymousUserId.split('_').slice(1).join('_')}`
      } else {
        return
      }

      const submission = await sessionService.checkSubmissionStatus(sessionId, userIdToCheck)

      if (submission) {
        setSubmittedUserId(submission.user_id)
        setIsSubmitted(true)
      }
    } catch (error) {
      // User hasn't submitted yet
    }
  }, [anonymousUserId, anonymousUserName, sessionId, user, userId])

  const loadAllAnswers = useCallback(async () => {
    try {
      const grouped = await sessionService.loadAllAnswers(sessionId)
      setSubmittedAnswers(grouped)
    } catch (error) {
      console.error('Error loading answers:', error)
    }
  }, [sessionId])

  useEffect(() => {
    if (!authLoading) {
      loadSessionData()
      loadQuestions()
      if (userId || (anonymousUserId && anonymousUserName)) {
        checkSubmissionStatus()
      }
    }
  }, [
    sessionId,
    authLoading,
    stableUserId,
    stableAnonymousUserId,
    stableAnonymousUserName,
    loadSessionData,
    loadQuestions,
    checkSubmissionStatus,
  ])

  useEffect(() => {
    const unsubscribe = sessionService.subscribeToSession(sessionId, () => {
      loadSessionData()
    })

    return unsubscribe
  }, [sessionId, loadSessionData])

  useEffect(() => {
    if (!isSubmitted || !isViewingAnswers) {
      return
    }

    loadAllAnswers()
    const unsubscribe = sessionService.subscribeToAnswers(sessionId, () => {
      loadAllAnswers()
    })

    return unsubscribe
  }, [isSubmitted, isViewingAnswers, loadAllAnswers, sessionId])

  const handleToggleUserAnswersVisibility = () => {
    const nextValue = !showAnswersForUser
    setShowAnswersForUser(nextValue)
    localStorage.setItem(userAnswersToggleKey, String(nextValue))
  }

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleSubmit = async () => {
    if (questions.length === 0) {
      alert('Vennligst legg til spørsmål til denne økten først.')
      return
    }

    if (!userId) {
      alert('Kunne ikke sende inn. Vennligst oppdater siden og prøv igjen.')
      return
    }

    if (!user && !anonymousUserName?.trim()) {
      alert('Vennligst skriv inn navnet ditt før du sender inn.')
      return
    }

    const unanswered = questions.filter((q) => !answers[q.id]?.trim())
    if (unanswered.length > 0) {
      alert(`Vennligst svar på alle ${questions.length} spørsmål før du sender inn.`)
      return
    }

    setIsSubmitting(true)
    try {
      const finalUserId = user
        ? userId
        : `anon_${anonymousUserName.trim()}_${anonymousUserId.split('_').slice(1).join('_')}`

      setSubmittedUserId(finalUserId)

      if (!user) {
        localStorage.setItem(`anonymous_user_name_${sessionId}`, anonymousUserName.trim())
      }

      const answerEntries = questions.map((q) => ({
        question_id: q.id,
        answer_text: answers[q.id],
      }))

      await sessionService.submitAnswers(sessionId, finalUserId, answerEntries)

      setShowAnswersForUser(true)
      localStorage.setItem(userAnswersToggleKey, 'true')
      setIsSubmitted(true)
    } catch (error) {
      console.error('Error submitting answers:', error)
      alert('Kunne ikke sende inn svar. Vennligst prøv igjen.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddQuestionClick = () => {
    setShowQuestionInput(true)
  }

  const handleCancelAddQuestion = () => {
    setShowQuestionInput(false)
    setNewQuestionText('')
  }

  const addQuestion = async () => {
    if (!newQuestionText?.trim()) return

    setIsAddingQuestion(true)
    try {
      const nextOrder = questions.length + 1
      const newQuestion = await sessionService.addQuestion(sessionId, newQuestionText, nextOrder)

      setQuestions((prev) => [...prev, newQuestion])
      setNewQuestionText('')
      setShowQuestionInput(false)
    } catch (error) {
      console.error('Error adding question:', error)
      alert('Kunne ikke legge til spørsmål. Vennligst prøv igjen.')
    } finally {
      setIsAddingQuestion(false)
    }
  }

  const handleQuestionInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      addQuestion()
    }
  }

  const shellTitle = session?.name || 'Økt'
  const shellDescription = `Økt-ID: ${sessionId}`

  if (authLoading || isLoading || (!user && !anonymousUserId)) {
    return (
      <AppShell
        title={shellTitle}
        description={shellDescription}
        userMenu={user ? <UserAvatarMenu user={user} onSignOut={signOut} /> : null}
      >
        <LoadingState />
      </AppShell>
    )
  }

  return (
    <AppShell
      title={shellTitle}
      description={shellDescription}
      userMenu={user ? <UserAvatarMenu user={user} onSignOut={signOut} /> : null}
    >
      <div className="space-y-5">
        <SessionHeader sessionName={session?.name || null} sessionId={sessionId}>
          {isSubmitted && (
            <div className="flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-white/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-[var(--foreground)]">Vis svar i denne visningen</p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {showAnswersForUser
                    ? 'Svarene vises nå. Slå av for å skjule dem.'
                    : 'Svarene er skjult for deg. Slå på for å se dem.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleUserAnswersVisibility}
                role="switch"
                aria-checked={showAnswersForUser}
                aria-label="Slå av/på visning av svar for deg"
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showAnswersForUser ? 'bg-green-500' : 'bg-[var(--border)]'
                  }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${showAnswersForUser ? 'translate-x-5' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>
          )}
        </SessionHeader>

        {!isSubmitted ? (
          <div className="space-y-4">
            {questions.length === 0 ? (
              <EmptyQuestionsState
                showQuestionInput={showQuestionInput}
                newQuestionText={newQuestionText}
                isAddingQuestion={isAddingQuestion}
                onAddQuestionClick={handleAddQuestionClick}
                onCancelAddQuestion={handleCancelAddQuestion}
                onQuestionTextChange={setNewQuestionText}
                onAddQuestion={addQuestion}
                onQuestionInputKeyDown={handleQuestionInputKeyDown}
              />
            ) : (
              <>
                {!user && (
                  <AnonymousNameInput
                    anonymousUserName={anonymousUserName}
                    onNameChange={setAnonymousUserName}
                  />
                )}
                {questions.map((question) => (
                  <QuestionCard
                    key={question.id}
                    questionText={question.question_text}
                    answer={answers[question.id] || ''}
                    onAnswerChange={(value) => handleAnswerChange(question.id, value)}
                  />
                ))}
                {showQuestionInput && (
                  <QuestionInput
                    newQuestionText={newQuestionText}
                    isAddingQuestion={isAddingQuestion}
                    onQuestionTextChange={setNewQuestionText}
                    onCancel={handleCancelAddQuestion}
                    onAdd={addQuestion}
                    onKeyDown={handleQuestionInputKeyDown}
                  />
                )}
                <div className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-white/70 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    onClick={handleAddQuestionClick}
                    className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  >
                    + Legg til et spørsmål til
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || (!user && !anonymousUserName?.trim())}
                    className="rounded-lg border border-[var(--border)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[var(--accent-muted)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? 'Sender inn...' : 'Send inn svar'}
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <SubmissionSuccess />
            {isViewingAnswers ? (
              <AnswersView
                questions={questions}
                submittedAnswers={submittedAnswers}
                currentUserId={userId}
                submittedUserId={submittedUserId}
              />
            ) : null}
          </div>
        )}
      </div>
    </AppShell>
  )
}
