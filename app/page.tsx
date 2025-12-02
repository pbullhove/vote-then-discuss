'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'

export default function Home() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [isCreating, setIsCreating] = useState(false)
  const supabase = createClient()

  const createSession = async () => {
    setIsCreating(true)
    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert({})
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

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Vote Then Discuss</h1>
            {user && (
              <p className="text-sm text-gray-600">
                Signed in as {user.email}
              </p>
            )}
          </div>
          {user && (
            <button
              onClick={signOut}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Sign out
            </button>
          )}
        </div>
        <p className="text-gray-600 mb-8">
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
    </div>
  )
}
