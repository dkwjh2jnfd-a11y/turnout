import React, { useState } from 'react'
import { isConfigured } from './lib/supabaseClient.js'
import { useAuth } from './context/AuthContext.jsx'
import SetupNeeded from './screens/SetupNeeded.jsx'
import AuthScreen from './screens/AuthScreen.jsx'
import OnboardingScreen from './screens/OnboardingScreen.jsx'
import BottomNav from './components/BottomNav.jsx'
import InstallBanner from './components/InstallBanner.jsx'
import GamesTab from './tabs/GamesTab.jsx'
import TeeTimesTab from './tabs/TeeTimesTab.jsx'
import LeaguesTab from './tabs/LeaguesTab.jsx'
import ProfileTab from './tabs/ProfileTab.jsx'

export default function App() {
  const [tab, setTab] = useState('games')

  if (!isConfigured) return <SetupNeeded />

  return <AuthedApp tab={tab} setTab={setTab} />
}

function AuthedApp({ tab, setTab }) {
  const { session, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-white/40">
        Loading Turnout…
      </div>
    )
  }

  if (!session) return <AuthScreen />
  if (!profile || !profile.display_name) return <OnboardingScreen />

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col">
      <InstallBanner />
      <main className="flex-1 pb-4">
        {tab === 'games' && <GamesTab />}
        {tab === 'tee-times' && <TeeTimesTab />}
        {tab === 'leagues' && <LeaguesTab />}
        {tab === 'profile' && <ProfileTab />}
      </main>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  )
}
