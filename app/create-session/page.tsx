'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'

interface Question {
  id: string
  text: string
}

export default function CreateSessionPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const supabase = createClient()

  const [sessionName, setSessionName] = useState('')
  const [questions, setQuestions] = useState<Question[]>([{ id: '1', text: '' }])
  const [isCreating, setIsCreating] = useState(false)

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

    // Validate that at least one question has text
    const validQuestions = questions.filter((q) => q.text.trim())
    if (validQuestions.length === 0) {
      alert('Vennligst legg til minst ett spørsmål før du oppretter økten.')
      return
    }

    setIsCreating(true)
    try {
      // Generate a unique 4-character ID
      let sessionId = generateSessionId()
      let attempts = 0
      const maxAttempts = 10

      // Check if ID already exists and regenerate if needed
      while (attempts < maxAttempts) {
        const { data: existing } = await supabase
          .from('sessions')
          .select('id')
          .eq('id', sessionId)
          .single()

        if (!existing) {
          break // ID is unique
        }
        sessionId = generateSessionId()
        attempts++
      }

      if (attempts >= maxAttempts) {
        throw new Error('Kunne ikke generere unik økt-ID. Vennligst prøv igjen.')
      }

      // Create the session
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

      // Create all questions
      const questionsToInsert = validQuestions.map((q, index) => ({
        session_id: sessionId,
        question_text: q.text.trim(),
        question_order: index + 1,
      }))

      const { error: questionsError } = await supabase
        .from('questions')
        .insert(questionsToInsert)

      if (questionsError) throw questionsError

      // Redirect to the session page
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Laster...</div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Opprett ny økt</h1>
            <button
              onClick={() => router.push('/')}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Tilbake
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <label className="block text-gray-800 font-medium mb-2">
            Øktnavn (valgfritt)
          </label>
          <input
            type="text"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            placeholder="Skriv inn et navn for denne økten..."
            className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg p-4 text-gray-800 focus:outline-none focus:border-gray-400 shadow-sm"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Spørsmål</h2>
            <button
              onClick={addQuestion}
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              + Legg til spørsmål
            </button>
          </div>

          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={question.id} className="rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <label className="block text-gray-800 font-medium">
                    Spørsmål {index + 1}
                  </label>
                  {questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(question.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Fjern
                    </button>
                  )}
                </div>
                <textarea
                  value={question.text}
                  onChange={(e) => updateQuestion(question.id, e.target.value)}
                  placeholder="Skriv inn spørsmålet ditt..."
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg p-4 text-gray-800 focus:outline-none focus:border-gray-400 resize-none shadow-sm"
                  rows={3}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <button
            onClick={createSession}
            disabled={isCreating || questions.filter((q) => q.text.trim()).length === 0}
            className="w-full bg-gray-800 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Oppretter økt...' : 'Opprett økt'}
          </button>
        </div>
      </div>
    </div>
  )
}
