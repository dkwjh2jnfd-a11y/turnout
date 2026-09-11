import React from 'react'
import { getReliability } from '../lib/turnoutScore.js'

export default function ReliabilityBadge({ profile, size = 'sm' }) {
  const r = getReliability(profile)
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-sm'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${padding} ${r.className}`}
      title={r.description}
    >
      {r.label}
      {r.rate !== null && <span className="opacity-70">· {r.rate}%</span>}
    </span>
  )
}
