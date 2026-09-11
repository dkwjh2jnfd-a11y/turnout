// Reliability tier, derived from organizer-confirmed attendance.
// A viewer can never inflate their own score — `showed` / `no_show`
// counts only change via the mark_attendance RPC, which the database
// restricts to the organizer of that specific game (see supabase/schema.sql).
export function getReliability(profile) {
  const showed = profile?.games_showed ?? 0
  const noShow = profile?.games_no_show ?? 0
  const total = showed + noShow

  if (total < 3) {
    return {
      tier: 'new_face',
      label: 'New Face',
      rate: total === 0 ? null : Math.round((showed / total) * 100),
      total,
      description: 'Still building a track record',
      className: 'bg-navy-700 text-white/80 border-white/10',
    }
  }

  const rate = showed / total

  if (rate >= 0.9 && total >= 5) {
    return {
      tier: 'locked_in',
      label: 'Locked In',
      rate: Math.round(rate * 100),
      total,
      description: 'Shows up, almost every time',
      className: 'bg-lime-500 text-navy-950 border-lime-500',
    }
  }

  if (rate >= 0.7) {
    return {
      tier: 'reliable',
      label: 'Reliable',
      rate: Math.round(rate * 100),
      total,
      description: 'Usually shows up',
      className: 'bg-navy-600 text-lime-400 border-lime-500/40',
    }
  }

  return {
    tier: 'flaky',
    label: 'Hit or Miss',
    rate: Math.round(rate * 100),
    total,
    description: 'Skips more than most',
    className: 'bg-navy-700 text-white/60 border-white/10',
  }
}
