'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'

interface Question {
  id: string
  question_text: string
  question_order: number
}

interface Answer {
  id: string
  answer_text: string
  user_id: string
}

interface Session {
  id: string
  name: string | null
}

export default function SessionPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const sessionId = params.id as string
  const supabase = createClient()

  const [session, setSession] = useState<Session | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, Answer[]>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showQuestionInput, setShowQuestionInput] = useState(false)
  const [newQuestionText, setNewQuestionText] = useState('')
  const [isAddingQuestion, setIsAddingQuestion] = useState(false)
  
  const userId = user?.id || ''

  useEffect(() => {
    if (!authLoading && userId) {
      loadSessionData()
      loadSession()
      checkSubmissionStatus()
    }
  }, [sessionId, authLoading, userId])

  useEffect(() => {
    if (isSubmitted) {
      loadAllAnswers()
      // Subscribe to new answers
      const channel = supabase
        .channel(`session:${sessionId}`)
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'answers' },
          () => {
            loadAllAnswers()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [isSubmitted, sessionId])

  const loadSessionData = async () => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('id, name')
        .eq('id', sessionId)
        .single()

      if (error) throw error
      setSession(data)
    } catch (error) {
      console.error('Error loading session data:', error)
    }
  }

  const loadSession = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('session_id', sessionId)
        .order('question_order', { ascending: true })

      if (error) throw error
      setQuestions(data || [])
    } catch (error) {
      console.error('Error loading session:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const checkSubmissionStatus = async () => {
    try {
      const { data } = await supabase
        .from('submissions')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', userId)
        .single()

      if (data) {
        setIsSubmitted(true)
        loadAllAnswers()
      }
    } catch (error) {
      // User hasn't submitted yet
    }
  }

  const loadAllAnswers = async () => {
    try {
      const { data, error } = await supabase
        .from('answers')
        .select('*')
        .eq('session_id', sessionId)

      if (error) throw error

      // Group answers by question_id
      const grouped: Record<string, Answer[]> = {}
      data?.forEach((answer) => {
        if (!grouped[answer.question_id]) {
          grouped[answer.question_id] = []
        }
        grouped[answer.question_id].push(answer)
      })

      setSubmittedAnswers(grouped)
    } catch (error) {
      console.error('Error loading answers:', error)
    }
  }

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleSubmit = async () => {
    if (questions.length === 0) {
      alert('Please add questions to this session first.')
      return
    }

    // Check if all questions are answered
    const unanswered = questions.filter((q) => !answers[q.id]?.trim())
    if (unanswered.length > 0) {
      alert(`Please answer all ${questions.length} question(s) before submitting.`)
      return
    }

    setIsSubmitting(true)
    try {
      // Insert all answers
      const answerEntries = questions.map((q) => ({
        question_id: q.id,
        session_id: sessionId,
        answer_text: answers[q.id],
        user_id: userId,
      }))

      const { error: answersError } = await supabase
        .from('answers')
        .upsert(answerEntries, { onConflict: 'question_id,user_id' })

      if (answersError) throw answersError

      // Mark as submitted
      const { error: submissionError } = await supabase
        .from('submissions')
        .insert({
          session_id: sessionId,
          user_id: userId,
        })

      if (submissionError) throw submissionError

      setIsSubmitted(true)
      loadAllAnswers()
    } catch (error) {
      console.error('Error submitting answers:', error)
      alert('Failed to submit answers. Please try again.')
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
      const { data, error } = await supabase
        .from('questions')
        .insert({
          session_id: sessionId,
          question_text: newQuestionText.trim(),
          question_order: nextOrder,
        })
        .select()
        .single()

      if (error) throw error
      if (data) {
        setQuestions((prev) => [...prev, data])
        setNewQuestionText('')
        setShowQuestionInput(false)
      }
    } catch (error) {
      console.error('Error adding question:', error)
      alert('Failed to add question. Please try again.')
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

  if (authLoading || isLoading || !userId) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading session...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">
              {session?.name || `Session ${sessionId}`}
            </h1>
            <button
              onClick={() => router.push('/')}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-4">Session ID: {sessionId}</p>
        </div>

        {!isSubmitted ? (
          <div className="space-y-4">
            {questions.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <p className="text-gray-600 mb-4">No questions yet. Add your first question!</p>
                <button
                  onClick={handleAddQuestionClick}
                  className="bg-gray-800 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  + Add Question
                </button>
                {showQuestionInput && (
                  <div className="mt-6 text-left">
                    <textarea
                      value={newQuestionText}
                      onChange={(e) => setNewQuestionText(e.target.value)}
                      onKeyDown={handleQuestionInputKeyDown}
                      placeholder="Enter your question..."
                      className="w-full bg-white border-2 border-gray-200 rounded-lg p-4 text-gray-800 focus:outline-none focus:border-gray-400 resize-none mb-3"
                      rows={3}
                      autoFocus
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={handleCancelAddQuestion}
                        className="text-gray-600 hover:text-gray-800 font-medium px-4 py-2"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={addQuestion}
                        disabled={isAddingQuestion || !newQuestionText.trim()}
                        className="bg-gray-800 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isAddingQuestion ? 'Adding...' : 'Add Question'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                {questions.map((question, index) => (
                  <div key={question.id} className="bg-white rounded-2xl shadow-lg p-6">
                    <label className="block text-gray-800 font-medium mb-2">
                      Question {index + 1}
                    </label>
                    <p className="text-gray-700 mb-4">{question.question_text}</p>
                    <textarea
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      placeholder="Type your answer here..."
                      className="w-full bg-white border-2 border-gray-200 rounded-lg p-4 text-gray-800 focus:outline-none focus:border-gray-400 resize-none"
                      rows={4}
                    />
                  </div>
                ))}
                {showQuestionInput && (
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <label className="block text-gray-800 font-medium mb-2">
                      New Question
                    </label>
                    <textarea
                      value={newQuestionText}
                      onChange={(e) => setNewQuestionText(e.target.value)}
                      onKeyDown={handleQuestionInputKeyDown}
                      placeholder="Enter your question..."
                      className="w-full bg-white border-2 border-gray-200 rounded-lg p-4 text-gray-800 focus:outline-none focus:border-gray-400 resize-none mb-3"
                      rows={3}
                      autoFocus
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={handleCancelAddQuestion}
                        className="text-gray-600 hover:text-gray-800 font-medium px-4 py-2"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={addQuestion}
                        disabled={isAddingQuestion || !newQuestionText.trim()}
                        className="bg-gray-800 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isAddingQuestion ? 'Adding...' : 'Add Question'}
                      </button>
                    </div>
                  </div>
                )}
                <div className="bg-white rounded-2xl shadow-lg p-6 flex justify-between items-center">
                  <button
                    onClick={handleAddQuestionClick}
                    className="text-gray-600 hover:text-gray-800 font-medium"
                  >
                    + Add Another Question
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-gray-800 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Answers'}
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-green-800 mb-2">✓ Answers Submitted!</h2>
              <p className="text-green-700">You can now see everyone's responses below.</p>
            </div>

            {questions.map((question, index) => {
              const questionAnswers = submittedAnswers[question.id] || []
              return (
                <div key={question.id} className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    Question {index + 1}: {question.question_text}
                  </h3>
                  <div className="space-y-3">
                    {questionAnswers.length === 0 ? (
                      <p className="text-gray-500 italic">No answers yet.</p>
                    ) : (
                      questionAnswers.map((answer) => (
                        <div
                          key={answer.id}
                          className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs text-gray-500 font-medium">
                              {answer.user_id === userId ? 'You' : `User ${answer.user_id.slice(0, 8)}...`}
                            </span>
                            {answer.user_id === userId && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                Your answer
                              </span>
                            )}
                          </div>
                          <p className="text-gray-800">{answer.answer_text}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

