import React from 'react'

export default function SportChip({ label, emoji, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
        active
          ? 'bg-lime-500 border-lime-500 text-navy-950'
          : 'bg-navy-800/60 border-white/10 text-white/80 hover:border-white/25'
      }`}
    >
      <span>{emoji}</span>
      {label}
    </button>
  )
}
