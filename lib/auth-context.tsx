'use client'

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

type AuthContextType = {
  user: User | null
  loading: boolean
  signInWithGoogle: (next?: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])
  const lastAuthAttemptIdRef = useRef<string | null>(null)

  useEffect(() => {
    console.log('[auth] AuthProvider mounted; fetching initial session')
    // Get initial session
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        console.log('[auth] getSession result', {
          hasSession: Boolean(session),
          userId: session?.user?.id ?? null,
          error: error ? { message: error.message, name: error.name } : null,
        })
        setUser(session?.user ?? null)
        setLoading(false)
      })
      .catch((err) => {
        console.error('[auth] getSession threw', err)
        setUser(null)
        setLoading(false)
      })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[auth] onAuthStateChange', {
        event: _event,
        hasSession: Boolean(session),
        userId: session?.user?.id ?? null,
        lastAuthAttemptId: lastAuthAttemptIdRef.current,
      })
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const signInWithGoogle = async (next?: string) => {
    const authAttemptId =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`
    lastAuthAttemptIdRef.current = authAttemptId

    const nextPath = next ?? `${location.pathname}${location.search}`
    const redirectTo = `${location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`
    console.log('[auth] signInWithGoogle starting', {
      authAttemptId,
      next,
      nextPath,
      locationHref: location.href,
      redirectTo,
    })
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    })
    console.log('[auth] signInWithGoogle signInWithOAuth returned', {
      authAttemptId,
      oauthUrl: data?.url ?? null,
      hasError: Boolean(error),
      error: error ? { message: error.message, name: error.name, status: error.status } : null,
    })
    if (error) {
      console.error('[auth] Error signing in with Google:', error)
      alert('Failed to sign in with Google. Please try again.')
    }
  }

  const signOut = async () => {
    console.log('[auth] signOut starting', { userId: user?.id ?? null })
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('[auth] Error signing out:', error)
      alert('Failed to sign out. Please try again.')
      return
    }
    console.log('[auth] signOut finished')
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

