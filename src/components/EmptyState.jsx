import React from 'react'

export default function EmptyState({ emoji, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl2 border border-dashed border-white/10 px-6 py-14 text-center">
      <div className="text-4xl">{emoji}</div>
      <p className="font-display text-base font-semibold text-white/90">{title}</p>
      {subtitle && <p className="max-w-xs text-sm text-white/50">{subtitle}</p>}
      {action}
    </div>
  )
}
