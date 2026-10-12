import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function Login() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
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
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jij@mail.com"
              className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-900"
            />
            <button
              type="submit"
              disabled={status === 'sending'}
              className="rounded-lg bg-[#1C1C1A] px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-[#1C1C1A]"
            >
              {status === 'sending' ? 'Versturen...' : 'Stuur inloglink'}
            </button>
            {status === 'error' && <p className="text-sm text-red-600">{error}</p>}
          </form>
        )}
      </div>
    </div>
  )
}
