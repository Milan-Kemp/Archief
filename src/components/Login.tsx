import { useState } from 'react'
import { supabase } from '../lib/supabase'

type Mode = 'password' | 'magiclink'

const inputClass =
  'rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-900'
const buttonClass =
  'rounded-lg bg-[#1C1C1A] px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-[#1C1C1A]'

export function Login() {
  const [mode, setMode] = useState<Mode>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

  function switchMode(next: Mode) {
    setMode(next)
    setStatus('idle')
    setError('')
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setStatus('error')
      setError(error.message)
    }
    // Bij succes pakt de auth-listener in useAuth de sessie vanzelf op.
  }

  async function handleMagicLinkSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setError('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.href },
    })

    if (error) {
      setStatus('error')
      setError(error.message)
    } else {
      setStatus('sent')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAF7] px-4 text-[#1C1C1A] dark:bg-[#161614] dark:text-[#F5F5F2]">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-xl font-medium">Archief</h1>

        {status === 'sent' ? (
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Check je mail voor de inloglink.
          </p>
        ) : mode === 'password' ? (
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jij@mail.com"
              className={inputClass}
            />
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Wachtwoord"
              className={inputClass}
            />
            <button type="submit" disabled={status === 'sending'} className={buttonClass}>
              {status === 'sending' ? 'Inloggen...' : 'Inloggen'}
            </button>
            {status === 'error' && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="button"
              onClick={() => switchMode('magiclink')}
              className="text-left text-xs text-neutral-500 underline hover:text-neutral-800 dark:hover:text-neutral-200"
            >
              Wachtwoord vergeten? Stuur een inloglink
            </button>
          </form>
        ) : (
          <form onSubmit={handleMagicLinkSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jij@mail.com"
              className={inputClass}
            />
            <button type="submit" disabled={status === 'sending'} className={buttonClass}>
              {status === 'sending' ? 'Versturen...' : 'Stuur inloglink'}
            </button>
            {status === 'error' && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="button"
              onClick={() => switchMode('password')}
              className="text-left text-xs text-neutral-500 underline hover:text-neutral-800 dark:hover:text-neutral-200"
            >
              Terug naar inloggen met wachtwoord
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
