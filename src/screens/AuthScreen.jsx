import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'

export default function AuthScreen() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email) return
    setStatus('sending')
    setError('')
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    if (authError) {
      setStatus('error')
      setError(authError.message)
      return
    }
    setStatus('sent')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-500 text-2xl font-display font-bold text-navy-950">
          T
        </div>
        <h1 className="font-display text-2xl font-semibold">Turnout</h1>
        <p className="text-sm text-white/50">Pickup games, tee times &amp; leagues — Jersey Shore</p>
      </div>

      <div className="w-full max-w-sm rounded-xl2 border border-white/10 bg-navy-900 p-6">
        {status === 'sent' ? (
          <div className="text-center">
            <div className="mb-3 text-3xl">📬</div>
            <p className="font-display text-base font-semibold">Check your email</p>
            <p className="mt-1.5 text-sm text-white/60">
              We sent a sign-in link to <span className="text-white/85">{email}</span>. Tap it on this device to
              get in.
            </p>
            <button
              type="button"
              onClick={() => setStatus('idle')}
              className="mt-4 text-sm font-medium text-lime-400 hover:underline"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label className="text-sm font-medium text-white/70" htmlFor="email">
              Sign in with your email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-white/15 bg-navy-800 px-3.5 py-2.5 text-sm outline-none focus:border-lime-500"
            />
            {status === 'error' && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={status === 'sending'}
              className="mt-1 rounded-lg bg-lime-500 px-4 py-2.5 text-sm font-semibold text-navy-950 transition-opacity disabled:opacity-60"
            >
              {status === 'sending' ? 'Sending link…' : 'Send sign-in link'}
            </button>
            <p className="mt-1 text-center text-xs text-white/40">No password needed — we'll email you a link.</p>
          </form>
        )}
      </div>
    </div>
  )
}
