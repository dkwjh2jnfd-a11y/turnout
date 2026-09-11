import React from 'react'

const TABS = [
  { id: 'games', label: 'Games', icon: '🏟️' },
  { id: 'tee-times', label: 'Tee Times', icon: '⛳' },
  { id: 'leagues', label: 'Leagues', icon: '📋' },
  { id: 'profile', label: 'Profile', icon: '👤' },
]

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="sticky bottom-0 z-30 border-t border-white/10 bg-navy-950/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto grid max-w-md grid-cols-4">
        {TABS.map((tab) => {
          const isActive = active === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${
                isActive ? 'text-lime-400' : 'text-white/45 hover:text-white/70'
              }`}
            >
              <span className="text-lg leading-none">{tab.icon}</span>
              {tab.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
