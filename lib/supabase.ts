import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''

export const supabase = (url && key && url.startsWith('http'))
  ? createClient(url, key)
  : null

export function isSupabaseConfigured(): boolean {
  return !!(url && key && supabase)
}

export function getServerClient() {
  if (!url || !key || !url.startsWith('http')) {
    throw new Error('Supabase no configurada')
  }
  return createClient(url, key)
}
