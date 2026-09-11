import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'

export default function AuthScreen() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  // idle | sending | sent | verifying | error
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email) return
    setStatus('sending')
    setError('')
    // Note: no emailRedirectTo here on purpose. On a phone where Turnout is
    // installed to the home screen, tapping a magic-link opens Safari (not
    // the installed app), which signs Safari in but leaves the home-screen
    // icon signed out — a well-known iOS PWA limitation. Using the 6-digit
    // code below instead means you never leave the installed app, so it
    // stays signed in.
    const { error: authError } = await supabase.auth.signInWithOtp({ email })
    if (authError) {
      setStatus('error')
      setError(authError.message)
      return
    }
    setStatus('sent')
  }

  async function handleVerify(e) {
    e.preventDefault()
    if (!code) return
    setStatus('verifying')
    setError('')
    const { error: authError } = await supabase.auth.verifyOtp({
      email,
      token: code.trim(),
      type: 'email',
    })
    if (authError) {
      setStatus('sent')
      setError(authError.message)
      return
    }
    // On success, AuthContext's onAuthStateChange listener picks up the
    // new session automatically — nothing else to do here.
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
        {status === 'sent' || status === 'verifying' ? (
          <div className="text-center">
            <div className="mb-3 text-3xl">📬</div>
            <p className="font-display text-base font-semibold">Check your email</p>
            <p className="mt-1.5 text-sm text-white/60">
              We sent a 6-digit code to <span className="text-white/85">{email}</span>. Enter it below to sign in.
            </p>
            <form onSubmit={handleVerify} className="mt-4 flex flex-col gap-3 text-left">
              <label className="text-sm font-medium text-white/70" htmlFor="code">
                6-digit code
              </label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="rounded-lg border border-white/15 bg-navy-800 px-3.5 py-2.5 text-center text-lg tracking-[0.3em] outline-none focus:border-lime-500"
              />
              {status === 'error' && <p className="text-sm text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={status === 'verifying'}
                className="rounded-lg bg-lime-500 px-4 py-2.5 text-sm font-semibold text-navy-950 transition-opacity disabled:opacity-60"
              >
                {status === 'verifying' ? 'Verifying…' : 'Verify & sign in'}
              </button>
            </form>
            <p className="mt-3 text-xs text-white/40">
              Tip: type the code — don't tap the link in the email if Turnout is installed on your home screen,
              or you'll get signed into Safari instead of the app.
            </p>
            <button
              type="button"
              onClick={() => {
                setStatus('idle')
                setCode('')
                setError('')
              }}
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
              {status === 'sending' ? 'Sending code…' : 'Send sign-in code'}
            </button>
            <p className="mt-1 text-center text-xs text-white/40">No password needed — we'll email you a code.</p>
          </form>
        )}
      </div>
    </div>
  )
}
