'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'

interface Session {
  id: string
  name: string | null
  created_at: string
  updated_at: string
}

export default function Home() {
  const router = useRouter()
  const { user, loading: authLoading, signOut } = useAuth()
  const [isCreating, setIsCreating] = useState(false)
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoadingSessions, setIsLoadingSessions] = useState(true)
  const supabase = createClient()

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

  const generateSessionId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const createSession = async () => {
    if (!user) {
      alert('You must be logged in to create a session.')
      return
    }

    // Prompt for session name
    const sessionName = prompt('Enter a name for this session (optional):')
    if (sessionName === null) {
      // User cancelled
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
        throw new Error('Failed to generate unique session ID. Please try again.')
      }

      const { data, error } = await supabase
        .from('sessions')
        .insert({ 
          id: sessionId,
          name: sessionName?.trim() || null,
          user_id: user.id 
        })
        .select()
        .single()

      if (error) throw error

      if (data) {
        router.push(`/session/${data.id}`)
      }
    } catch (error) {
      console.error('Error creating session:', error)
      alert('Failed to create session. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (authLoading || isLoadingSessions) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Vote Then Discuss</h1>
          <p className="text-gray-600 mb-8">
            Please sign in to create and manage your voting sessions.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-gray-800 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Vote Then Discuss</h1>
              <p className="text-sm text-gray-600">
                Signed in as {user.email}
              </p>
            </div>
            <button
              onClick={signOut}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Sign out
            </button>
          </div>
          <p className="text-gray-600 mb-6">
            Create a session with questions. Users answer privately, then see everyone's responses.
          </p>
          <button
            onClick={createSession}
            disabled={isCreating}
            className="w-full bg-gray-800 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Creating...' : 'New Session'}
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">My Sessions</h2>
          {sessions.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No sessions yet. Create your first session to get started!
            </p>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="border-2 border-gray-200 rounded-lg p-4 hover:border-gray-400 transition-colors cursor-pointer"
                  onClick={() => router.push(`/session/${session.id}`)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">
                        {session.name || `Session ${session.id}`}
                      </p>
                      <p className="text-sm text-gray-500">
                        ID: {session.id} • Created {formatDate(session.created_at)}
                      </p>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
