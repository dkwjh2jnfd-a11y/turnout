import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../context/AuthContext.jsx'
import { SPORTS } from '../lib/sports.js'
import { toDatetimeLocalValue } from '../lib/format.js'
import BottomSheet from '../components/BottomSheet.jsx'

const PLAYABLE_SPORTS = SPORTS.filter((s) => s.id !== 'golf')

const defaultWhen = () => {
  const d = new Date()
  d.setMinutes(0, 0, 0)
  d.setHours(d.getHours() + 3)
  return toDatetimeLocalValue(d)
}

export default function PostGameSheet({ open, onClose, onPosted }) {
  const { user } = useAuth()
  const [sport, setSport] = useState(PLAYABLE_SPORTS[0].id)
  const [location, setLocation] = useState('')
  const [when, setWhen] = useState(defaultWhen())
  const [capacity, setCapacity] = useState(10)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function reset() {
    setSport(PLAYABLE_SPORTS[0].id)
    setLocation('')
    setWhen(defaultWhen())
    setCapacity(10)
    setNotes('')
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!location.trim()) {
      setError('Add a location so people know where to show up.')
      return
    }
    setSaving(true)
    setError('')
    const { error: insertError } = await supabase.from('games').insert({
      organizer_id: user.id,
      sport,
      location: location.trim(),
      starts_at: new Date(when).toISOString(),
      capacity,
      notes: notes.trim() || null,
    })
    setSaving(false)
    if (insertError) {
      setError(insertError.message)
      return
    }
    reset()
    onPosted()
    onClose()
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Post a Game">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <p className="mb-2 text-sm font-medium text-white/70">Sport</p>
          <div className="flex flex-wrap gap-2">
            {PLAYABLE_SPORTS.map((s) => (
              <button
                type="button"
                key={s.id}
                onClick={() => setSport(s.id)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                  sport === s.id
                    ? 'border-lime-500 bg-lime-500 text-navy-950'
                    : 'border-white/15 bg-navy-800 text-white/75'
                }`}
              >
                {s.emoji} {s.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-white/70" htmlFor="location">
            Location
          </label>
          <input
            id="location"
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Bay Ave Courts, Manahawkin"
            className="mt-1 w-full rounded-lg border border-white/15 bg-navy-800 px-3.5 py-2.5 text-sm outline-none focus:border-lime-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-white/70" htmlFor="when">
            Date &amp; time
          </label>
          <input
            id="when"
            type="datetime-local"
            required
            value={when}
            onChange={(e) => setWhen(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/15 bg-navy-800 px-3.5 py-2.5 text-sm outline-none focus:border-lime-500 [color-scheme:dark]"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-white/70" htmlFor="capacity">
              Capacity
            </label>
            <span className="font-display text-sm font-semibold text-lime-400">{capacity} players</span>
          </div>
          <input
            id="capacity"
            type="range"
            min={2}
            max={30}
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            className="mt-2 w-full"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-white/70" htmlFor="notes">
            Notes <span className="text-white/40">(optional)</span>
          </label>
          <textarea
            id="notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Bring a light + dark shirt, skill level, etc."
            className="mt-1 w-full resize-none rounded-lg border border-white/15 bg-navy-800 px-3.5 py-2.5 text-sm outline-none focus:border-lime-500"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-lime-500 px-4 py-3 text-sm font-semibold text-navy-950 disabled:opacity-60"
        >
          {saving ? 'Posting…' : 'Post game'}
        </button>
      </form>
    </BottomSheet>
  )
}
