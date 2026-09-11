import React, { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../context/AuthContext.jsx'
import { sportById } from '../lib/sports.js'
import EmptyState from '../components/EmptyState.jsx'
import PostLeagueSheet from './PostLeagueSheet.jsx'

const LEAGUE_SELECT = `
  id, sport, name, schedule, location, description, contact_info, organizer_id, created_at,
  organizer:profiles!leagues_organizer_id_fkey ( display_name ),
  interested:league_interest ( user_id )
`

export default function LeaguesTab() {
  const { user } = useAuth()
  const [leagues, setLeagues] = useState([])
  const [loading, setLoading] = useState(true)
  const [postOpen, setPostOpen] = useState(false)
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('leagues')
      .select(LEAGUE_SELECT)
      .order('created_at', { ascending: false })
    if (!error) setLeagues(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function toggleInterest(league) {
    setBusyId(league.id)
    const already = (league.interested || []).some((i) => i.user_id === user.id)
    if (already) {
      await supabase.from('league_interest').delete().eq('league_id', league.id).eq('user_id', user.id)
    } else {
      await supabase.from('league_interest').upsert({ league_id: league.id, user_id: user.id })
    }
    await load()
    setBusyId(null)
  }

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-20 bg-navy-950/95 px-4 pb-3 pt-5 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-semibold">Leagues</h1>
            <p className="text-xs text-white/45">Rec leagues around the Shore</p>
          </div>
          <button
            type="button"
            onClick={() => setPostOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-lime-500 px-3.5 py-2 text-sm font-semibold text-navy-950"
          >
            + Post
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-3 px-4">
        {loading ? (
          <p className="py-10 text-center text-sm text-white/40">Loading leagues…</p>
        ) : leagues.length === 0 ? (
          <EmptyState
            emoji="📋"
            title="No leagues listed yet"
            subtitle="Know of a rec league? Post it so people can find it."
            action={
              <button
                type="button"
                onClick={() => setPostOpen(true)}
                className="mt-2 rounded-lg bg-lime-500 px-4 py-2 text-sm font-semibold text-navy-950"
              >
                Post a league
              </button>
            }
          />
        ) : (
          leagues.map((l) => {
            const sport = sportById(l.sport)
            const interested = l.interested || []
            const isInterested = interested.some((i) => i.user_id === user.id)
            return (
              <div key={l.id} className="flex flex-col gap-2.5 rounded-xl2 border border-white/10 bg-navy-900 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-800 text-lg">
                      {sport.emoji}
                    </span>
                    <div>
                      <p className="font-display font-semibold leading-tight">{l.name}</p>
                      <p className="text-xs text-white/50">{sport.label}</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-white/40">
                    {interested.length} interested
                  </span>
                </div>
                <p className="text-sm text-white/60">📍 {l.location}</p>
                {l.schedule && <p className="text-sm text-white/60">🗓️ {l.schedule}</p>}
                {l.description && <p className="text-sm text-white/50">{l.description}</p>}
                {l.contact_info && <p className="text-xs text-white/40">Sign up: {l.contact_info}</p>}
                <div className="flex items-center justify-between border-t border-white/5 pt-2.5">
                  <span className="text-xs text-white/45">Posted by {l.organizer?.display_name ?? 'Someone'}</span>
                  <button
                    type="button"
                    disabled={busyId === l.id}
                    onClick={() => toggleInterest(l)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      isInterested ? 'bg-white/10 text-white' : 'bg-lime-500 text-navy-950'
                    }`}
                  >
                    {isInterested ? "I'm interested ✓" : "I'm interested"}
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      <PostLeagueSheet open={postOpen} onClose={() => setPostOpen(false)} onPosted={load} />
    </div>
  )
}
