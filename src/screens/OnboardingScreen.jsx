import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function OnboardingScreen() {
  const { user, refreshProfile } = useAuth()
  const [name, setName] = useState('')
  const [area, setArea] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError('')
    const { error: upsertError } = await supabase
      .from('profiles')
      .update({ display_name: name.trim(), home_area: area.trim() || null })
      .eq('id', user.id)
    setSaving(false)
    if (upsertError) {
      setError(upsertError.message)
      return
    }
    refreshProfile()
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-xl2 border border-white/10 bg-navy-900 p-6">
        <h1 className="font-display text-xl font-semibold">You're in 🎉</h1>
        <p className="mt-1 text-sm text-white/60">Set up your player profile so people know who's showing up.</p>
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
          <div>
            <label className="text-sm font-medium text-white/70" htmlFor="name">
              Your name
            </label>
            <input
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="First name + last initial"
              className="mt-1 w-full rounded-lg border border-white/15 bg-navy-800 px-3.5 py-2.5 text-sm outline-none focus:border-lime-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-white/70" htmlFor="area">
              Home area <span className="text-white/40">(optional)</span>
            </label>
            <input
              id="area"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="e.g. Long Beach Island"
              className="mt-1 w-full rounded-lg border border-white/15 bg-navy-800 px-3.5 py-2.5 text-sm outline-none focus:border-lime-500"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="mt-2 rounded-lg bg-lime-500 px-4 py-2.5 text-sm font-semibold text-navy-950 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Start playing'}
          </button>
        </form>
      </div>
    </div>
  )
}
