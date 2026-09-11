import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../context/AuthContext.jsx'
import { getReliability } from '../lib/turnoutScore.js'
import ReliabilityBadge from '../components/ReliabilityBadge.jsx'

export default function ProfileTab() {
  const { user, profile, refreshProfile, signOut } = useAuth()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(profile?.display_name ?? '')
  const [area, setArea] = useState(profile?.home_area ?? '')
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState({ posted: 0, joined: 0 })

  useEffect(() => {
    setName(profile?.display_name ?? '')
    setArea(profile?.home_area ?? '')
  }, [profile])

  useEffect(() => {
    if (!user) return
    async function loadStats() {
      const [postedGames, postedTee, joined] = await Promise.all([
        supabase.from('games').select('id', { count: 'exact', head: true }).eq('organizer_id', user.id),
        supabase.from('tee_times').select('id', { count: 'exact', head: true }).eq('organizer_id', user.id),
        supabase
          .from('game_rsvps')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .neq('status', 'cancelled'),
      ])
      setStats({
        posted: (postedGames.count ?? 0) + (postedTee.count ?? 0),
        joined: joined.count ?? 0,
      })
    }
    loadStats()
  }, [user])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    await supabase
      .from('profiles')
      .update({ display_name: name.trim(), home_area: area.trim() || null })
      .eq('id', user.id)
    setSaving(false)
    setEditing(false)
    refreshProfile()
  }

  const reliability = getReliability(profile)

  return (
    <div className="flex flex-col gap-5 px-4 pt-5">
      <h1 className="font-display text-xl font-semibold">Profile</h1>

      <div className="flex flex-col items-center gap-3 rounded-xl2 border border-white/10 bg-navy-900 p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-lime-500 font-display text-2xl font-bold text-navy-950">
          {(profile?.display_name || '?').charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-display text-lg font-semibold">{profile?.display_name}</p>
          {profile?.home_area && <p className="text-sm text-white/45">{profile.home_area}</p>}
        </div>
        <ReliabilityBadge profile={profile} size="lg" />
        <p className="max-w-[15rem] text-xs text-white/40">
          {reliability.total === 0
            ? 'Show up to games to start building your Turnout Score.'
            : `${reliability.description} — based on your last ${reliability.total} game${reliability.total === 1 ? '' : 's'}.`}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl2 border border-white/10 bg-navy-900 p-4 text-center">
          <p className="font-display text-2xl font-semibold text-lime-400">{stats.posted}</p>
          <p className="text-xs text-white/50">Games hosted</p>
        </div>
        <div className="rounded-xl2 border border-white/10 bg-navy-900 p-4 text-center">
          <p className="font-display text-2xl font-semibold text-lime-400">{stats.joined}</p>
          <p className="text-xs text-white/50">Games joined</p>
        </div>
      </div>

      <div className="rounded-xl2 border border-white/10 bg-navy-900 p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-white/80">Player info</p>
          {!editing && (
            <button type="button" onClick={() => setEditing(true)} className="text-xs font-medium text-lime-400">
              Edit
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="flex flex-col gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="rounded-lg border border-white/15 bg-navy-800 px-3.5 py-2.5 text-sm outline-none focus:border-lime-500"
            />
            <input
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Home area"
              className="rounded-lg border border-white/15 bg-navy-800 px-3.5 py-2.5 text-sm outline-none focus:border-lime-500"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-lg bg-lime-500 px-4 py-2 text-sm font-semibold text-navy-950 disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white/60"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-1.5 text-sm text-white/60">
            <p>{user.email}</p>
            <p>{profile?.home_area || 'No home area set'}</p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={signOut}
        className="rounded-lg border border-white/10 px-4 py-3 text-sm font-medium text-white/50 hover:bg-white/5"
      >
        Sign out
      </button>
    </div>
  )
}
