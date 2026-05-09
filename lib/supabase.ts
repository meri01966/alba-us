import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Log de debug para verificar configuracion
if (typeof window !== 'undefined') {
  console.log("[v0] Supabase URL configurada:", !!supabaseUrl)
  console.log("[v0] Supabase Key configurada:", !!supabaseAnonKey)
}

// Solo crear el cliente si las variables estan configuradas
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export const isSupabaseConfigured = () => {
  const configured = !!supabase
  if (typeof window !== 'undefined') {
    console.log("[v0] isSupabaseConfigured:", configured)
  }
  return configured
}
