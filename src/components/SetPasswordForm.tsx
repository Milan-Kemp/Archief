import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface Props {
  onClose: () => void
}

export function SetPasswordForm({ onClose }: Props) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Wachtwoord moet minstens 8 tekens zijn.')
      return
    }
    if (password !== confirm) {
      setError('Wachtwoorden komen niet overeen.')
      return
    }

    setStatus('saving')
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setStatus('idle')

    if (updateError) {
      setError(updateError.message)
      return
    }

    setStatus('saved')
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-sm rounded-xl bg-[#FAFAF7] p-5 dark:bg-[#1c1c1a]">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-medium text-[#1C1C1A] dark:text-[#F5F5F2]">
            Wachtwoord instellen
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
          >
            Sluiten
          </button>
        </div>

        {status === 'saved' ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Wachtwoord ingesteld. Je kunt vanaf nu inloggen met e-mail en wachtwoord.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-[#1C1C1A] px-3 py-2 text-sm font-medium text-white dark:bg-white dark:text-[#1C1C1A]"
            >
              Sluiten
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-sm">
              Nieuw wachtwoord
              <input
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minstens 8 tekens"
                className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Herhaal wachtwoord
              <input
                type="password"
                required
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
              />
            </label>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={status === 'saving'}
              className="rounded-lg bg-[#1C1C1A] px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-[#1C1C1A]"
            >
              {status === 'saving' ? 'Opslaan...' : 'Opslaan'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
