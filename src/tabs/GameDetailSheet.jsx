import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../context/AuthContext.jsx'
import { sportById } from '../lib/sports.js'
import { formatWhen, isPast } from '../lib/format.js'
import ReliabilityBadge from '../components/ReliabilityBadge.jsx'
import BottomSheet from '../components/BottomSheet.jsx'

export default function GameDetailSheet({ game, open, onClose, onChanged, courseMode = false, rsvpTable, idColumn }) {
  const { user } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (!game) return null

  const sport = sportById(courseMode ? 'golf' : game.sport)
  const roster = (game.rsvps || []).filter((r) => r.status !== 'cancelled')
  const going = roster.filter((r) => r.status === 'going' || r.status === 'showed')
  const isOrganizer = user.id === game.organizer_id
  const myRsvp = roster.find((r) => r.user_id === user.id)
  const isFull = going.length >= game.capacity
  const gameHasPassed = isPast(game.starts_at)

  async function joinGame() {
    setBusy(true)
    setError('')
    const { error: upsertError } = await supabase
      .from(rsvpTable)
      .upsert({ [idColumn]: game.id, user_id: user.id, status: 'going' })
    setBusy(false)
    if (upsertError) return setError(upsertError.message)
    onChanged()
  }

  async function leaveGame() {
    setBusy(true)
    setError('')
    const { error: deleteError } = await supabase
      .from(rsvpTable)
      .delete()
      .eq(idColumn, game.id)
      .eq('user_id', user.id)
    setBusy(false)
    if (deleteError) return setError(deleteError.message)
    onChanged()
  }

  async function cancelGame() {
    setBusy(true)
    setError('')
    const { error: updateError } = await supabase.from(courseMode ? 'tee_times' : 'games').update({ status: 'cancelled' }).eq('id', game.id)
    setBusy(false)
    if (updateError) return setError(updateError.message)
    onChanged()
    onClose()
  }

  async function markAttendance(targetUserId, status) {
    setBusy(true)
    setError('')
    const { error: rpcError } = await supabase.rpc(
      courseMode ? 'mark_tee_time_attendance' : 'mark_attendance',
      { p_id: game.id, p_user_id: targetUserId, p_status: status },
    )
    setBusy(false)
    if (rpcError) return setError(rpcError.message)
    onChanged()
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={courseMode ? game.course_name : sport.label}>
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-2.5 text-sm text-white/70">
          <span className="text-lg">{sport.emoji}</span>
          <span>{formatWhen(game.starts_at)}</span>
        </div>
        {!courseMode && <p className="text-sm text-white/60">📍 {game.location}</p>}
        {game.notes && <p className="rounded-lg bg-navy-800 px-3 py-2.5 text-sm text-white/70">{game.notes}</p>}

        <div className="flex items-center justify-between rounded-lg border border-white/10 px-3.5 py-2.5">
          <span className="text-sm text-white/60">Hosted by {game.organizer?.display_name}</span>
          <ReliabilityBadge profile={game.organizer} />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-white/70">
              Who's in ({going.length}/{game.capacity})
            </p>
          </div>
          {going.length === 0 ? (
            <p className="text-sm text-white/40">Nobody's RSVP'd yet — be the first.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {going.map((r) => (
                <li key={r.user_id} className="flex items-center justify-between gap-2 rounded-lg bg-navy-800 px-3 py-2">
                  <span className="text-sm text-white/85">
                    {r.profiles?.display_name ?? 'Player'}
                    {r.user_id === game.organizer_id && (
                      <span className="ml-1.5 text-xs text-lime-400">host</span>
                    )}
                  </span>
                  {isOrganizer && gameHasPassed && r.status !== 'showed' && r.status !== 'no_show' && (
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => markAttendance(r.user_id, 'showed')}
                        className="rounded-full bg-lime-500/15 px-2.5 py-1 text-xs font-medium text-lime-400 hover:bg-lime-500/25"
                      >
                        Showed
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => markAttendance(r.user_id, 'no_show')}
                        className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium text-white/50 hover:bg-white/10"
                      >
                        No-show
                      </button>
                    </div>
                  )}
                  {(r.status === 'showed' || r.status === 'no_show') && (
                    <span className={`text-xs font-medium ${r.status === 'showed' ? 'text-lime-400' : 'text-white/40'}`}>
                      {r.status === 'showed' ? 'Showed ✓' : 'No-show'}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        {!isOrganizer && !gameHasPassed && (
          <button
            type="button"
            disabled={busy || (isFull && !myRsvp)}
            onClick={myRsvp ? leaveGame : joinGame}
            className={`rounded-lg px-4 py-3 text-sm font-semibold disabled:opacity-50 ${
              myRsvp ? 'bg-white/10 text-white' : 'bg-lime-500 text-navy-950'
            }`}
          >
            {myRsvp ? "Leave — can't make it" : isFull ? 'Full' : "I'm in"}
          </button>
        )}

        {isOrganizer && !gameHasPassed && (
          <button
            type="button"
            disabled={busy}
            onClick={cancelGame}
            className="rounded-lg border border-white/15 px-4 py-3 text-sm font-semibold text-white/60 hover:bg-white/5"
          >
            Cancel this game
          </button>
        )}

        {isOrganizer && gameHasPassed && (
          <p className="text-center text-xs text-white/40">
            Mark who showed up above — it updates everyone's Turnout Score.
          </p>
        )}
      </div>
    </BottomSheet>
  )
}
