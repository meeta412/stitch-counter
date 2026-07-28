import { useState } from 'react'
import { useAuthContext } from '../context/AuthContext'

export default function AuthPanel() {
  const { user, loading, isConfigured, signIn, signUp, signInWithGoogle, signOut } = useAuthContext()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!isConfigured) {
    return (
      <div className="card text-sm text-yarn-600">
        Cloud sync is optional. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to enable login.
      </div>
    )
  }

  if (loading) {
    return <div className="card text-sm text-yarn-600">Checking session...</div>
  }

  if (user) {
    return (
      <div className="card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-yarn-900">Signed in</p>
          <p className="text-sm text-yarn-600">{user.email}</p>
        </div>
        <button type="button" onClick={() => void signOut()} className="btn-secondary">
          Sign out
        </button>
      </div>
    )
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    setMessage(null)

    try {
      if (mode === 'signup') {
        await signUp(email, password)
        setMessage('Check your email to confirm your account, then sign in.')
      } else {
        await signIn(email, password)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-yarn-900">Cloud sync</h3>
        <p className="text-sm text-yarn-600">
          Sign in to sync projects across your phone and desktop.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          className="input-field"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <input
          className="input-field"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={6}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-yarn-700">{message}</p>}
        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Please wait...' : mode === 'signup' ? 'Create account' : 'Sign in'}
        </button>
      </form>

      <button
        type="button"
        onClick={() => void signInWithGoogle()}
        className="btn-secondary w-full"
      >
        Continue with Google
      </button>

      <button
        type="button"
        onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
        className="w-full text-sm text-yarn-600 underline"
      >
        {mode === 'signin' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
      </button>
    </div>
  )
}
