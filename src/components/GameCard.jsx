import React from 'react'
import { sportById } from '../lib/sports.js'
import { formatWhen } from '../lib/format.js'
import ReliabilityBadge from './ReliabilityBadge.jsx'

export default function GameCard({ game, onOpen, currentUserId, courseMode = false }) {
  const sport = sportById(courseMode ? 'golf' : game.sport)
  const going = (game.rsvps || []).filter((r) => r.status === 'going' || r.status === 'showed')
  const isFull = going.length >= game.capacity
  const isIn = going.some((r) => r.user_id === currentUserId)

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full flex-col gap-3 rounded-xl2 border border-white/10 bg-navy-900 p-4 text-left transition-colors hover:border-white/25"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-800 text-lg">
            {sport.emoji}
          </span>
          <div>
            <p className="font-display font-semibold leading-tight">
              {courseMode ? game.course_name : sport.label}
            </p>
            <p className="text-xs text-white/50">{courseMode ? sport.label + ' Tee Time' : game.location}</p>
          </div>
        </div>
        {isIn && (
          <span className="shrink-0 rounded-full bg-lime-500/15 px-2 py-0.5 text-[11px] font-semibold text-lime-400">
            You're in
          </span>
        )}
      </div>

      {!courseMode && <p className="text-xs text-white/40">{game.location}</p>}

      <div className="flex items-center justify-between text-sm">
        <span className="text-white/75">{formatWhen(game.starts_at)}</span>
        <span className={`font-medium ${isFull ? 'text-white/40' : 'text-lime-400'}`}>
          {going.length}/{game.capacity} {isFull ? 'full' : 'going'}
        </span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-navy-800">
        <div
          className="h-full rounded-full bg-lime-500 transition-all"
          style={{ width: `${Math.min(100, (going.length / game.capacity) * 100)}%` }}
        />
      </div>

      <div className="flex items-center justify-between border-t border-white/5 pt-2.5">
        <span className="text-xs text-white/45">
          Hosted by {game.organizer?.display_name ?? 'Someone'}
        </span>
        <ReliabilityBadge profile={game.organizer} />
      </div>
    </button>
  )
}
