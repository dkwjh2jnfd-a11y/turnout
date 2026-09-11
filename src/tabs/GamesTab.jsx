import React, { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../context/AuthContext.jsx'
import { SPORTS } from '../lib/sports.js'
import SportChip from '../components/SportChip.jsx'
import GameCard from '../components/GameCard.jsx'
import EmptyState from '../components/EmptyState.jsx'
import PostGameSheet from './PostGameSheet.jsx'
import GameDetailSheet from './GameDetailSheet.jsx'

const PLAYABLE_SPORTS = SPORTS.filter((s) => s.id !== 'golf')
const GAME_SELECT = `
  id, sport, location, starts_at, capacity, notes, status, organizer_id, created_at,
  organizer:profiles!games_organizer_id_fkey ( id, display_name, games_showed, games_no_show ),
  rsvps:game_rsvps ( user_id, status, profiles ( display_name ) )
`

export default function GamesTab() {
  const { user } = useAuth()
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeSport, setActiveSport] = useState(null)
  const [postOpen, setPostOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(null)

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('games')
      .select(GAME_SELECT)
      .eq('status', 'upcoming')
      .order('starts_at', { ascending: true })
    if (!error) setGames(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    const channel = supabase
      .channel('games-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'games' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_rsvps' }, load)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [load])

  const filtered = activeSport ? games.filter((g) => g.sport === activeSport) : games
  const selected = games.find((g) => g.id === selectedId) ?? null

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-20 bg-navy-950/95 px-4 pb-3 pt-5 backdrop-blur">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="font-display text-xl font-semibold">Games</h1>
          <button
            type="button"
            onClick={() => setPostOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-lime-500 px-3.5 py-2 text-sm font-semibold text-navy-950"
          >
            + Post
          </button>
        </div>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none">
          <SportChip label="All sports" emoji="🎯" active={!activeSport} onClick={() => setActiveSport(null)} />
          {PLAYABLE_SPORTS.map((s) => (
            <SportChip
              key={s.id}
              label={s.label}
              emoji={s.emoji}
              active={activeSport === s.id}
              onClick={() => setActiveSport(s.id)}
            />
          ))}
        </div>
      </header>

      <div className="flex flex-col gap-3 px-4">
        {loading ? (
          <p className="py-10 text-center text-sm text-white/40">Loading games…</p>
        ) : filtered.length === 0 ? (
          <EmptyState
            emoji="🏟️"
            title="No games posted yet"
            subtitle="Be the first to get a run going — post a game and see who turns out."
            action={
              <button
                type="button"
                onClick={() => setPostOpen(true)}
                className="mt-2 rounded-lg bg-lime-500 px-4 py-2 text-sm font-semibold text-navy-950"
              >
                Post the first game
              </button>
            }
          />
        ) : (
          filtered.map((g) => (
            <GameCard key={g.id} game={g} currentUserId={user.id} onOpen={() => setSelectedId(g.id)} />
          ))
        )}
      </div>

      <PostGameSheet open={postOpen} onClose={() => setPostOpen(false)} onPosted={load} />
      <GameDetailSheet
        game={selected}
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        onChanged={load}
        rsvpTable="game_rsvps"
        idColumn="game_id"
      />
    </div>
  )
}
