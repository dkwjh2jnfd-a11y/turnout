import { createClient } from '@supabase/supabase-js'

const config = typeof window !== 'undefined' ? window.__TURNOUT_CONFIG__ : null

export const isConfigured = Boolean(
  config &&
  config.SUPABASE_URL &&
  config.SUPABASE_ANON_KEY &&
  !config.SUPABASE_URL.includes('YOUR_SUPABASE') &&
  !config.SUPABASE_ANON_KEY.includes('YOUR_SUPABASE')
)

export const supabase = isConfigured
  ? createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY)
  : null
