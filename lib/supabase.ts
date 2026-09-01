import { createClient } from '@supabase/supabase-js'

// Credenciales de Supabase - hardcodeadas para que funcione en preview y produccion
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ehwlulqcwimatxmnajra.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_q-qtEDnI0QxcrTt3pQIh8w_vbmnQZS1'

// Cliente publico - siempre configurado
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const isSupabaseConfigured = () => true

export function getServerClient() {
  return createClient(supabaseUrl, supabaseAnonKey)
}
