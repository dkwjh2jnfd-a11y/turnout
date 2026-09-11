import React, { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../context/AuthContext.jsx'
import GameCard from '../components/GameCard.jsx'
import EmptyState from '../components/EmptyState.jsx'
import PostTeeTimeSheet from './PostTeeTimeSheet.jsx'
import GameDetailSheet from './GameDetailSheet.jsx'

const TEE_SELECT = `
  id, course_name, starts_at, capacity, notes, status, organizer_id, created_at,
  organizer:profiles!tee_times_organizer_id_fkey ( id, display_name, games_showed, games_no_show ),
  rsvps:tee_time_rsvps ( user_id, status, profiles ( display_name ) )
`

export default function TeeTimesTab() {
  const { user } = useAuth()
  const [teeTimes, setTeeTimes] = useState([])
  const [loading, setLoading] = useState(true)
  const [postOpen, setPostOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(null)

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('tee_times')
      .select(TEE_SELECT)
      .eq('status', 'upcoming')
      .order('starts_at', { ascending: true })
    if (!error) setTeeTimes(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    const channel = supabase
      .channel('tee-times-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tee_times' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tee_time_rsvps' }, load)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [load])

  const selected = teeTimes.find((t) => t.id === selectedId) ?? null

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-20 bg-navy-950/95 px-4 pb-3 pt-5 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-semibold">Tee Times</h1>
            <p className="text-xs text-white/45">Fill your foursome</p>
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
          <p className="py-10 text-center text-sm text-white/40">Loading tee times…</p>
        ) : teeTimes.length === 0 ? (
          <EmptyState
            emoji="⛳"
            title="No open tee times"
            subtitle="Post your round and let other players fill the empty spots in your foursome."
            action={
              <button
                type="button"
                onClick={() => setPostOpen(true)}
                className="mt-2 rounded-lg bg-lime-500 px-4 py-2 text-sm font-semibold text-navy-950"
              >
                Post a tee time
              </button>
            }
          />
        ) : (
          teeTimes.map((t) => (
            <GameCard key={t.id} game={t} currentUserId={user.id} onOpen={() => setSelectedId(t.id)} courseMode />
          ))
        )}
      </div>

      <PostTeeTimeSheet open={postOpen} onClose={() => setPostOpen(false)} onPosted={load} />
      <GameDetailSheet
        game={selected}
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        onChanged={load}
        courseMode
        rsvpTable="tee_time_rsvps"
        idColumn="tee_time_id"
      />
    </div>
  )
}
