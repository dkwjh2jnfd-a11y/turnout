import React, { useEffect, useState } from 'react'
import { useInstallPrompt } from '../lib/pwaInstall.js'

const DISMISS_KEY = 'turnout:install-banner-dismissed'

export default function InstallBanner() {
  const { isStandalone, isIOS, canPromptInstall, promptInstall } = useInstallPrompt()
  const [dismissed, setDismissed] = useState(true)
  const [showIOSSteps, setShowIOSSteps] = useState(false)

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === '1')
    } catch {
      setDismissed(false)
    }
  }, [])

  function dismiss() {
    setDismissed(true)
    try {
      localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      // ignore — worst case the banner reappears next visit
    }
  }

  if (isStandalone || dismissed) return null
  if (!isIOS && !canPromptInstall) return null // not installable yet on this browser

  return (
    <div className="mx-4 mt-3 flex flex-col gap-2 rounded-xl2 border border-lime-500/30 bg-lime-500/10 px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-lime-500 font-display text-sm font-bold text-navy-950">
            T
          </span>
          <div>
            <p className="text-sm font-semibold text-white/90">Add Turnout to your home screen</p>
            <p className="text-xs text-white/50">Opens like a real app — no app store needed.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="shrink-0 rounded-full p-1 text-white/40 hover:bg-white/10 hover:text-white/70"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {!isIOS && canPromptInstall && (
        <button
          type="button"
          onClick={async () => {
            const accepted = await promptInstall()
            if (accepted) dismiss()
          }}
          className="rounded-lg bg-lime-500 px-3 py-2 text-sm font-semibold text-navy-950"
        >
          Install app
        </button>
      )}

      {isIOS && (
        <div>
          <button
            type="button"
            onClick={() => setShowIOSSteps((s) => !s)}
            className="rounded-lg border border-lime-500/40 px-3 py-2 text-sm font-semibold text-lime-400"
          >
            {showIOSSteps ? 'Hide steps' : 'Show me how'}
          </button>
          {showIOSSteps && (
            <ol className="mt-2 flex flex-col gap-1 text-xs text-white/60">
              <li>1. Tap the Share icon in Safari's toolbar.</li>
              <li>2. Scroll down and tap "Add to Home Screen."</li>
              <li>3. Tap "Add" — Turnout now opens like any other app.</li>
            </ol>
          )}
        </div>
      )}
    </div>
  )
}
