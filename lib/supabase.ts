import { createClient } from '@supabase/supabase-js'

// Credenciales de Supabase
const supabaseUrl = 'https://oairchbitlanpzywncua.supabase.co'
const supabaseServiceKey = 'sb_secret_LyML0Qjo3eDXzjHe0EGaxA_2xpSabDX'

// Cliente con service_role para bypass RLS
export const supabase = createClient(supabaseUrl, supabaseServiceKey)

export const isSupabaseConfigured = () => true
