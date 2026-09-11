import React from 'react'

export default function SetupNeeded() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-sm rounded-xl2 border border-white/10 bg-navy-900 p-7 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-lime-500/15 text-2xl">
          🔌
        </div>
        <h1 className="font-display text-xl font-semibold">Connect your database</h1>
        <p className="mt-2 text-sm leading-relaxed text-white/60">
          Turnout needs a Supabase project before it can go live. Open{' '}
          <code className="rounded bg-navy-800 px-1 py-0.5 text-lime-400">public/config.js</code>{' '}
          and paste in your project URL and anon key — full steps are in{' '}
          <code className="rounded bg-navy-800 px-1 py-0.5 text-lime-400">README.md</code>.
        </p>
      </div>
    </div>
  )
}
