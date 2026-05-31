import { createClient } from '@supabase/supabase-js'

// Credenciales de Supabase - hardcodeadas para que funcione en preview y produccion
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://oairchbitlanpzywncua.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9haXJjaGJpdGxhbnB6eXduY3VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNjM4MzIsImV4cCI6MjA5MzczOTgzMn0.7_f8egxeOn9FUOGkF8Mp-OBhpo2rGaqy-6e2rcCXLiA'

// Cliente publico - siempre configurado
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const isSupabaseConfigured = () => true

export function getServerClient() {
  return createClient(supabaseUrl, supabaseAnonKey)
}
