import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../context/AuthContext.jsx'
import { SPORTS } from '../lib/sports.js'
import BottomSheet from '../components/BottomSheet.jsx'

export default function PostLeagueSheet({ open, onClose, onPosted }) {
  const { user } = useAuth()
  const [sport, setSport] = useState(SPORTS[0].id)
  const [name, setName] = useState('')
  const [schedule, setSchedule] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [contact, setContact] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function reset() {
    setSport(SPORTS[0].id)
    setName('')
    setSchedule('')
    setLocation('')
    setDescription('')
    setContact('')
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !location.trim()) {
      setError('Add a name and location.')
      return
    }
    setSaving(true)
    setError('')
    const { error: insertError } = await supabase.from('leagues').insert({
      organizer_id: user.id,
      sport,
      name: name.trim(),
      schedule: schedule.trim() || null,
      location: location.trim(),
      description: description.trim() || null,
      contact_info: contact.trim() || null,
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
    <BottomSheet open={open} onClose={onClose} title="Post a League">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <p className="mb-2 text-sm font-medium text-white/70">Sport</p>
          <div className="flex flex-wrap gap-2">
            {SPORTS.map((s) => (
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
          <label className="text-sm font-medium text-white/70" htmlFor="league-name">
            League name
          </label>
          <input
            id="league-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. LBI Thursday Night Rec League"
            className="mt-1 w-full rounded-lg border border-white/15 bg-navy-800 px-3.5 py-2.5 text-sm outline-none focus:border-lime-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-white/70" htmlFor="league-schedule">
            Schedule <span className="text-white/40">(optional)</span>
          </label>
          <input
            id="league-schedule"
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
            placeholder="e.g. Thursdays, 6-week season starting June"
            className="mt-1 w-full rounded-lg border border-white/15 bg-navy-800 px-3.5 py-2.5 text-sm outline-none focus:border-lime-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-white/70" htmlFor="league-location">
            Location
          </label>
          <input
            id="league-location"
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Southern Regional HS fields"
            className="mt-1 w-full rounded-lg border border-white/15 bg-navy-800 px-3.5 py-2.5 text-sm outline-none focus:border-lime-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-white/70" htmlFor="league-desc">
            Details <span className="text-white/40">(optional)</span>
          </label>
          <textarea
            id="league-desc"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Skill level, cost, roster size, etc."
            className="mt-1 w-full resize-none rounded-lg border border-white/15 bg-navy-800 px-3.5 py-2.5 text-sm outline-none focus:border-lime-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-white/70" htmlFor="league-contact">
            How to sign up <span className="text-white/40">(optional)</span>
          </label>
          <input
            id="league-contact"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Email, phone, or a link"
            className="mt-1 w-full rounded-lg border border-white/15 bg-navy-800 px-3.5 py-2.5 text-sm outline-none focus:border-lime-500"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-lime-500 px-4 py-3 text-sm font-semibold text-navy-950 disabled:opacity-60"
        >
          {saving ? 'Posting…' : 'Post league'}
        </button>
      </form>
    </BottomSheet>
  )
}
