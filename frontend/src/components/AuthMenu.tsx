import { useEffect, useRef, useState } from 'react'
import { useAuthContext } from '../context/AuthContext'

export default function AuthMenu() {
  const {
    user,
    loading,
    authError,
    isConfigured,
    signIn,
    signUp,
    signOut,
  } = useAuthContext()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (authError) {
      setOpen(true)
    }
  }, [authError])

  useEffect(() => {
    if (!open) return

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  if (!isConfigured) {
    return null
  }

  if (loading) {
    return <span className="text-sm text-yarn-500">...</span>
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    setMessage(null)

    try {
      if (mode === 'signup') {
        await signUp(email, password)
        setMessage('Check your email to confirm, then sign in.')
      } else {
        await signIn(email, password)
        setOpen(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (user) {
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="hidden max-w-[10rem] truncate text-sm text-yarn-600 sm:inline">
          {user.email}
        </span>
        <button
          type="button"
          onClick={() => void signOut()}
          className="rounded-lg border border-yarn-300 bg-white px-3 py-1.5 text-sm font-medium text-yarn-800 transition hover:bg-yarn-100"
        >
          Sign out
        </button>
      </div>
    )
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="rounded-lg bg-yarn-700 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-yarn-800"
      >
        Sign in
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-72 rounded-xl border border-yarn-200 bg-white p-4 shadow-lg">
          <p className="mb-3 text-sm text-yarn-600">Sync projects across devices</p>

          {(authError || error) && (
            <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error ?? authError}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-2">
            <input
              className="input-field text-sm"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <input
              className="input-field text-sm"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
            />
            {message && <p className="text-xs text-yarn-700">{message}</p>}
            <button type="submit" disabled={submitting} className="btn-primary w-full text-sm">
              {submitting ? 'Please wait...' : mode === 'signup' ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            className="mt-2 w-full text-xs text-yarn-600 underline"
          >
            {mode === 'signin' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
          </button>
        </div>
      )}
    </div>
  )
}
