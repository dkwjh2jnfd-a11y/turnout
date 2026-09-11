import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../context/AuthContext.jsx'
import { toDatetimeLocalValue } from '../lib/format.js'
import BottomSheet from '../components/BottomSheet.jsx'

const defaultWhen = () => {
  const d = new Date()
  d.setMinutes(0, 0, 0)
  d.setHours(d.getHours() + 20) // default to ~tomorrow morning-ish
  return toDatetimeLocalValue(d)
}

export default function PostTeeTimeSheet({ open, onClose, onPosted }) {
  const { user } = useAuth()
  const [course, setCourse] = useState('')
  const [when, setWhen] = useState(defaultWhen())
  const [capacity, setCapacity] = useState(4)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function reset() {
    setCourse('')
    setWhen(defaultWhen())
    setCapacity(4)
    setNotes('')
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!course.trim()) {
      setError('Add the course name.')
      return
    }
    setSaving(true)
    setError('')
    const { error: insertError } = await supabase.from('tee_times').insert({
      organizer_id: user.id,
      course_name: course.trim(),
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
    <BottomSheet open={open} onClose={onClose} title="Post a Tee Time">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="text-sm font-medium text-white/70" htmlFor="course">
            Course
          </label>
          <input
            id="course"
            required
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            placeholder="e.g. Ocean Acres Golf Course"
            className="mt-1 w-full rounded-lg border border-white/15 bg-navy-800 px-3.5 py-2.5 text-sm outline-none focus:border-lime-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-white/70" htmlFor="tee-when">
            Tee time
          </label>
          <input
            id="tee-when"
            type="datetime-local"
            required
            value={when}
            onChange={(e) => setWhen(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/15 bg-navy-800 px-3.5 py-2.5 text-sm outline-none focus:border-lime-500 [color-scheme:dark]"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-white/70" htmlFor="tee-capacity">
              Foursome size
            </label>
            <span className="font-display text-sm font-semibold text-lime-400">{capacity} golfers</span>
          </div>
          <input
            id="tee-capacity"
            type="range"
            min={2}
            max={4}
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            className="mt-2 w-full"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-white/70" htmlFor="tee-notes">
            Notes <span className="text-white/40">(optional)</span>
          </label>
          <textarea
            id="tee-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Cart or walking, handicap range, etc."
            className="mt-1 w-full resize-none rounded-lg border border-white/15 bg-navy-800 px-3.5 py-2.5 text-sm outline-none focus:border-lime-500"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-lime-500 px-4 py-3 text-sm font-semibold text-navy-950 disabled:opacity-60"
        >
          {saving ? 'Posting…' : 'Post tee time'}
        </button>
      </form>
    </BottomSheet>
  )
}
