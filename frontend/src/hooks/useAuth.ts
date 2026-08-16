import { useCallback, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { getAuthRedirectUrl, hasOAuthCallbackParams, clearAuthParamsFromUrl, parseAuthErrorFromUrl } from '../lib/auth'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [authError, setAuthError] = useState<string | null>(() => parseAuthErrorFromUrl())

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    let cancelled = false

    const client = supabase

    async function initAuth() {
      try {
        if (hasOAuthCallbackParams()) {
          const urlError = parseAuthErrorFromUrl()
          if (urlError) {
            if (!cancelled) setAuthError(urlError)
            return
          }

          const code = new URLSearchParams(window.location.search).get('code')
          const { data, error } = code
            ? await client.auth.exchangeCodeForSession(code)
            : await client.auth.getSession()

          if (error) {
            if (!cancelled) setAuthError(error.message)
            return
          }

          clearAuthParamsFromUrl()
          if (!cancelled) {
            setSession(data.session)
            setUser(data.session?.user ?? null)
          }
          return
        }

        const { data, error } = await client.auth.getSession()
        if (error && !cancelled) {
          setAuthError(error.message)
        }
        if (!cancelled) {
          setSession(data.session)
          setUser(data.session?.user ?? null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void initAuth()

    const { data: listener } = client.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      setLoading(false)

      if (event === 'SIGNED_IN') {
        setAuthError(null)
        clearAuthParamsFromUrl()
      }
    })

    return () => {
      cancelled = true
      listener.subscription.unsubscribe()
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase is not configured')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getAuthRedirectUrl(),
      },
    })
    if (error) throw error
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase is not configured')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }, [])

  return {
    user,
    session,
    loading,
    authError,
    isConfigured: isSupabaseConfigured,
    signUp,
    signIn,
    signOut,
  }
}
